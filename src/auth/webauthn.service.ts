
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

// Define the type locally if not exported
type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'hybrid' | 'internal';

@Injectable()
export class WebAuthnService {
    private rpName = 'PMS School';
    private rpID: string;
    private origin: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        // Dynamic configuration for dev and production
        // In production, use the actual domain (e.g., 'thpt-nguyen-hue.vercel.app')
        // In dev, use 'localhost' or the actual IP if accessing from mobile
        this.rpID = this.configService.get('RP_ID') || this.configService.get('FRONTEND_DOMAIN') || 'localhost';
        this.origin = this.configService.get('ORIGIN') || this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }

    /**
     * 1. REGISTRATION - Generate Options
     */
    async generateRegistrationOptions(userId: number) {
        const user = await this.prisma.nguoiDung.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const userAuthenticators = await this.prisma.userAuthenticator.findMany({
            where: { userId },
        });

        // Convert stored IDs (Storage format -> Base64URL) if needed.
        // Assuming we store as whatever verifyRegistration returns (which is usually Base64URL in v13, but let's be safe).

        try {
            const options = await generateRegistrationOptions({
                rpName: this.rpName,
                rpID: this.rpID,
                userID: isoUint8Array.fromUTF8String(user.id.toString()),
                userName: user.email || user.taiKhoan,
                attestationType: 'none',
                excludeCredentials: userAuthenticators.map((authenticator) => ({
                    id: authenticator.credentialID, // v13 expects string (Base64URL)
                    type: 'public-key',
                    transports: authenticator.transports
                        ? (authenticator.transports.split(',') as AuthenticatorTransport[])
                        : undefined,
                })),
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'preferred',
                    authenticatorAttachment: 'platform', // Enforce platform authenticator (TouchID/FaceID)
                },
            });

            // Save challenge
            await this.prisma.nguoiDung.update({
                where: { id: userId },
                data: { maXacThuc: options.challenge },
            });

            return options;

        } catch (error) {
            console.error('WebAuthn Generate Error:', error);
            throw new BadRequestException(`WebAuthn Error: ${error.message}`);
        }
    }



    /**
     * 2. REGISTRATION - Verify Response
     */
    async verifyRegistration(userId: number, body: any) {
        const user = await this.prisma.nguoiDung.findUnique({ where: { id: userId } });
        if (!user || !user.maXacThuc) {
            throw new UnauthorizedException('Challenge not found or expired');
        }

        const { verified, registrationInfo } = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: user.maXacThuc,
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
        });

        if (verified && registrationInfo) {
            // v13 structure: credential { id, publicKey, counter } are inside 'credential' object
            const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
            const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

            // Check if device exists
            const existing = await this.prisma.userAuthenticator.findFirst({
                where: { credentialID } // credentialID is Base64URL string from lib
            });

            if (existing) {
                throw new BadRequestException('Device already registered');
            }

            // Save authenticator
            // Need to convert Uint8Array ID to string.
            // Usually hex or base64url.
            // The schema credentialID is string.
            // const credentialIDStr = Buffer.from(credentialID).toString('base64');

            await this.prisma.userAuthenticator.create({
                data: {
                    credentialID, // Store as Base64URL string
                    credentialPublicKey: Buffer.from(credentialPublicKey), // Store Uint8Array as Buffer
                    counter: BigInt(counter),
                    credentialDeviceType,
                    credentialBackedUp,
                    transports: body.response.transports ? body.response.transports.join(',') : '',
                    userId: user.id,
                },
            });

            // Clear challenge
            await this.prisma.nguoiDung.update({ where: { id: userId }, data: { maXacThuc: null } });

            return { verified: true };
        }

        throw new UnauthorizedException('Verification failed');
    }

    /**
     * 3. AUTHENTICATION - Generate Options
     */
    async generateAuthenticationOptions(email: string) {
        // Find user by email or username
        // Note: Passkey login (usernameless) works differently, but for now we implement "enter email -> use passkey" flow.
        const user = await this.prisma.nguoiDung.findFirst({
            where: {
                OR: [{ email }, { taiKhoan: email }]
            }
        });

        if (!user) throw new UnauthorizedException('User not found');

        const opts = await generateAuthenticationOptions({
            rpID: this.rpID,
            allowCredentials: [], // Allow any authenticator registered to this RP? No, need to list user's credentials for "non-discoverable" flow.
            // If we want "discoverable" (usernameless), we leave this empty.
            // If we want specific user flow, we query their authenticators.
        });

        // For non-discoverable flow (safer defaults):
        const authenticators = await this.prisma.userAuthenticator.findMany({ where: { userId: user.id } });
        opts.allowCredentials = authenticators.map(auth => ({
            id: auth.credentialID, // Already string
            type: 'public-key',
            transports: auth.transports ? (auth.transports.split(',') as AuthenticatorTransport[]) : undefined
        }));
        opts.userVerification = 'preferred';

        // Store challenge
        await this.prisma.nguoiDung.update({
            where: { id: user.id },
            data: { maXacThuc: opts.challenge },
        });

        return { options: opts, userId: user.id }; // Send userId back? No, just options.
    }

    /**
     * 4. AUTHENTICATION - Verify Response
     */
    async verifyAuthentication(email: string, body: any) {
        // Find user. For now assuming email was provided in step 1 and client remembers it.
        // Or client sends it again.
        const user = await this.prisma.nguoiDung.findFirst({
            where: {
                OR: [{ email }, { taiKhoan: email }]
            }
        });
        if (!user || !user.maXacThuc) throw new UnauthorizedException('User/Challenge invalid');

        const authenticator = await this.prisma.userAuthenticator.findFirst({
            where: { credentialID: body.id } // body.id is the Credential ID (Base64URL)
        });

        if (!authenticator) throw new UnauthorizedException('Authenticator not found');

        const { verified, authenticationInfo } = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: user.maXacThuc,
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
            credential: { // Renamed from 'authenticator' to 'credential' in v13? Or just follow type error guidance
                id: authenticator.credentialID,
                publicKey: authenticator.credentialPublicKey, // Buffer is compatible with Uint8Array usually
                counter: Number(authenticator.counter), // BigInt to number
                transports: authenticator.transports ? (authenticator.transports.split(',') as AuthenticatorTransport[]) : undefined
            },
        });

        if (verified && authenticationInfo) {
            // Update counter
            await this.prisma.userAuthenticator.update({
                where: { id: authenticator.id }, // UUID
                data: { counter: BigInt(authenticationInfo.newCounter) }
            });

            // Clear challenge
            await this.prisma.nguoiDung.update({ where: { id: user.id }, data: { maXacThuc: null } });

            return { verified: true, user };
        }

        throw new UnauthorizedException('Verification failed');
    }

}
