import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Vui lòng chọn file');
        }
        const result = await this.cloudinaryService.uploadFile(file, 'upload/images');
        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Vui lòng chọn file');
        }
        const result = await this.cloudinaryService.uploadFile(file, 'upload/avatars');
        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    }

    @Post('audio')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAudio(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Vui lòng chọn file');
        }
        const result = await this.cloudinaryService.uploadFile(file, 'upload/audio');
        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    }
}
