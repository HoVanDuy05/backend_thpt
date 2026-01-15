import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thiết lập tiền tố global cho API
  app.setGlobalPrefix('api');

  // Bật CORS với cấu hình chi tiết cho PWA/Mobile
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://thpt-nguyen-hue.vercel.app',
      /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
      /^capacitor:\/\/localhost$/, // Capacitor iOS
      /^ionic:\/\/localhost$/, // Ionic
      /^http:\/\/localhost$/, // Android WebView
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-custom-lang'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Trường học (THPT)')
    .setDescription('Tài liệu API cho hệ thống quản lý học tập, đề thi và chấm điểm')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Đổi sang api/docs để không trùng với prefix api

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();