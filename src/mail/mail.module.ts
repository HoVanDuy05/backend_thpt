import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';

@Global()
@Module({
    imports: [
        MailerModule.forRoot({
            // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
            // or
            transport: {
                host: process.env.MAIL_HOST || 'smtp.example.com',
                secure: false,
                auth: {
                    user: process.env.MAIL_USER || 'user@example.com',
                    pass: process.env.MAIL_PASS || 'password',
                },
            },
            defaults: {
                from: '"Hệ thống Trường học" <noreply@school.com>',
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new EjsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
