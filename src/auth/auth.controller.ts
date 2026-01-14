import { Controller, Post, Body, HttpCode, HttpStatus, Get, Request, UseGuards, Res, Req, Patch, UploadedFiles, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private cloudinaryService: CloudinaryService) { }

    @Public()
    @Post('register')
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('verify')
    async verify(@Body() body: { email: string; code: string }) {
        return this.authService.verifyCode(body.email, body.code);
    }

    @Public()
    @Post('resend-code')
    async resendCode(@Body() body: { email: string }) {
        return this.authService.resendCode(body.email);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() loginDto: LoginDto, @Request() req) {
        try {
            return await this.authService.login(loginDto, req);
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        // req.user is set by JwtStrategy
        const userId = Number(req.user?.userId);
        if (!userId || Number.isNaN(userId)) {
            throw new BadRequestException('Invalid user id');
        }
        return this.authService.getProfile(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(@Request() req, @Body() body: any) {
        const userId = Number(req.user?.userId);
        if (!userId || Number.isNaN(userId)) {
            throw new BadRequestException('Invalid user id');
        }
        return this.authService.updateProfile(userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @Post('avatar')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatar', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ]))
    async uploadAvatar(@Request() req, @UploadedFiles() files: { avatar?: Express.Multer.File[]; file?: Express.Multer.File[] }) {
        const userId = Number(req.user?.userId);
        if (!userId || Number.isNaN(userId)) {
            throw new BadRequestException('Invalid user id');
        }
        const file = files?.avatar?.[0] || files?.file?.[0];
        if (!file) {
            throw new BadRequestException('Vui lòng chọn file');
        }

        const result = await this.cloudinaryService.uploadFile(file, 'upload/avatars');
        const url = (result as any)?.secure_url;
        if (!url) throw new BadRequestException('Upload failed');

        await this.authService.updateAvatar(userId, url);

        return {
            avatar: url,
        };
    }

    // Google OAuth
    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Initiates Google OAuth flow
    }

    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req, @Res() res) {
        // Validate Google user
        const user = await this.authService.validateGoogleUser(req.user);

        // Generate JWT
        const result = await this.authService.googleLogin(user, req);

        // Redirect to frontend with token
        // Use FRONTEND_URL or dynamically detect from Host header
        let frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            const host = req.headers.host;
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            frontendUrl = `${protocol}://${host}`;

            // If it's Vercel, we might need to remove /api if the host includes it, 
            // but usually host is just the domain.
            // If the frontend is on the same domain, we are good.
        }

        console.log(`[OAuth] Detected host: ${req.headers.host}, Redirecting to: ${frontendUrl}/vi/auth/callback`);
        res.redirect(`${frontendUrl}/vi/auth/callback?token=${result.access_token}`);
    }
}
