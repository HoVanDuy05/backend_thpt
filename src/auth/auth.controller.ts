import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
  Res,
  Req,
  Patch,
  UploadedFiles,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
  ) { }

  @Public()
  @Get('ping')
  ping() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: any, @Req() req) {
    const locale = req.headers['x-custom-lang'] || 'vi';
    return this.authService.register(registerDto, locale);
  }

  @Public()
  @Post('verify')
  async verify(@Body() body: { email: string; code: string }, @Req() req) {
    const locale = req.headers['x-custom-lang'] || 'vi';
    return this.authService.verifyCode(body.email, body.code, locale);
  }

  @Public()
  @Post('resend-code')
  async resendCode(@Body() body: { email: string }, @Req() req) {
    const locale = req.headers['x-custom-lang'] || 'vi';
    return this.authService.resendCode(body.email, locale);
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
    let userId = Number(req.user?.userId);

    // Fallback if req.user is raw payload
    if ((!userId || Number.isNaN(userId)) && req.user?.sub) {
      userId = Number(req.user.sub);
    }

    if (!userId || Number.isNaN(userId)) {
      this.logger.error(`Profile Request Failed - Invalid UserID. Req.user: ${JSON.stringify(req.user)}`);
      throw new BadRequestException(`validation.invalid_user_id | Missing ID in request context`);
    }
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() body: any) {
    let userId = Number(req.user?.userId);
    // Fallback
    if ((!userId || Number.isNaN(userId)) && req.user?.sub) {
      userId = Number(req.user.sub);
    }

    if (!userId || Number.isNaN(userId)) {
      this.logger.error(`Update Profile Failed - Invalid UserID. Req.user: ${JSON.stringify(req.user)}`);
      throw new BadRequestException('validation.invalid_user_id');
    }
    return this.authService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ) {
    let userId = Number(req.user?.userId);
    if ((!userId || Number.isNaN(userId)) && req.user?.sub) {
      userId = Number(req.user.sub);
    }

    if (!userId || Number.isNaN(userId)) {
      this.logger.error(`Upload Avatar Failed - Invalid UserID. Req.user: ${JSON.stringify(req.user)}`);
      throw new BadRequestException('validation.invalid_user_id');
    }
    const file = files?.avatar?.[0] || files?.file?.[0];
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    const result = await this.cloudinaryService.uploadFile(
      file,
      'upload/avatars',
    );
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

    console.log(
      `[OAuth] Detected host: ${req.headers.host}, Redirecting to: ${frontendUrl}/vi/auth/callback`,
    );
    res.redirect(
      `${frontendUrl}/vi/auth/callback?token=${result.access_token}`,
    );
  }

  // WebAuthn Endpoints
  @Post('webauthn/register/options')
  @UseGuards(JwtAuthGuard)
  async registerOptions(@Request() req) {
    let userId = Number(req.user?.userId);
    if ((!userId || Number.isNaN(userId)) && req.user?.sub) {
      userId = Number(req.user.sub);
    }

    if (!userId || Number.isNaN(userId)) {
      this.logger.error(`WebAuthn Register Options Failed - Invalid UserID. Req.user: ${JSON.stringify(req.user)}`);
      throw new BadRequestException('validation.invalid_user_id');
    }
    return this.authService.webAuthnService.generateRegistrationOptions(userId);
  }

  @Post('webauthn/register/verify')
  @UseGuards(JwtAuthGuard)
  async verifyRegistration(@Request() req, @Body() body: any) {
    const userId = Number(req.user?.userId);
    return this.authService.webAuthnService.verifyRegistration(userId, body);
  }

  @Public()
  @Post('webauthn/login/options')
  async loginOptions(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email required');
    return this.authService.webAuthnService.generateAuthenticationOptions(
      body.email,
    );
  }

  @Public()
  @Post('webauthn/login/verify')
  async verifyLogin(
    @Body() body: { email: string; response: any },
    @Req() req,
  ) {
    if (!body.email || !body.response)
      throw new BadRequestException('Email and response required');
    const { verified, user } =
      await this.authService.webAuthnService.verifyAuthentication(
        body.email,
        body.response,
      );

    if (verified && user) {
      return this.authService.generateTokenForUser(user, req);
    }
  }
}
