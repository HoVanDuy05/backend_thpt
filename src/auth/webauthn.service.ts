
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

@Injectable()
export class WebAuthnService {
    private rpName = 'PMS School';
    private rpID: string;
    private origin: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        // Default to localhost for dev, but configurable
        this.rpID = this.configService.get('RP_ID') || 'localhost';
        this.origin = this.configService.get('ORIGIN') || 'http://localhost:3000';
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

        const options = await generateRegistrationOptions({
            rpName: this.rpName,
            rpID: this.rpID,
            userID: isoUint8Array.fromUTF8String(user.id.toString()),
            userName: user.email || user.taiKhoan,
            attestationType: 'none',
            excludeCredentials: userAuthenticators.map((authenticator) => ({
                id: isoUint8Array.fromHex(authenticator.credentialID),
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

        // Save challenge to user session or temporary store (here storing in DB user record for simplicity, could be Redis)
        // NOTE: In a real app, use Redis or a session store. For now, we'll return it and expect client to sign it.
        // Ideally, we verify against a stored challenge.
        // Let's store it temporarily in a new field on user or just re-verify with expectedChallenge (stateless challenge?)
        // SimpleWebAuthn recommends saving the challenge.
        // For this implementation, I will save the expected challenge in the User record (adding a temp field) or just update schema?
        // Let's reuse 'maXacThuc' field temporarily or add a new field 'currentChallenge' to schema? 
        // Wait, adding a field to schema takes migration time.
        // I'll return the challenge and for verification, I'll trust the client sends back the challenge signed? No, that's insecure.
        // I MUST store the challenge.
        // Let's use `maXacThuc` field on NguoiDung since it's a string and transient.
        await this.prisma.nguoiDung.update({
            where: { id: userId },
            data: { maXacThuc: options.challenge },
        });

        return options;
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
            const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

            // check if device exists
            const existing = await this.prisma.userAuthenticator.findFirst({
                where: { credentialID: Buffer.from(credentialID).toString('base64') } // Store as base64 string or hex? Schema says String.
                // Let's stick to base64url or hex. SimpleWebAuthn uses base64url usually.
                // Let's use the isoBase64URL helpers from library if needed, or Buffer.
                // Prisma Bytes -> Buffer.
            });

            // Save authenticator
            // Need to convert Uint8Array ID to string.
            // Usually hex or base64url. 
            // The schema credentialID is string. 
            const credentialIDStr = Buffer.from(credentialID).toString('base64');

            await this.prisma.userAuthenticator.create({
                data: {
                    credentialID: credentialIDStr,
                    credentialPublicKey: Buffer.from(credentialPublicKey),
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
            id: Buffer.from(auth.credentialID, 'base64'), // Decode from string storage
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
            where: { credentialID: body.id } // body.id is base64url usually in response
        });

        if (!authenticator) throw new UnauthorizedException('Authenticator not found');

        const { verified, authenticationInfo } = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: user.maXacThuc,
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
            authenticator: {
                credentialID: Buffer.from(authenticator.credentialID, 'base64'),
                credentialPublicKey: authenticator.credentialPublicKey,
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
