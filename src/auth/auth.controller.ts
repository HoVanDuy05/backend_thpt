import { Controller, Post, Body, HttpCode, HttpStatus, Get, Request, UseGuards, Res, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
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
        return this.authService.getProfile(req.user.userId);
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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/vi/auth/callback?token=${result.access_token}`);
    }
}
