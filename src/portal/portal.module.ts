import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BannerController } from './controllers/banner.controller';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { BannerService } from './services/banner.service';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';

import { ExportModule } from '../common/export/export.module';

@Module({
  imports: [PrismaModule, ExportModule],
  controllers: [BannerController, PostController, CommentController],
  providers: [BannerService, PostService, CommentService],
  exports: [BannerService, PostService], // Export if needed
})
export class PortalModule {}
