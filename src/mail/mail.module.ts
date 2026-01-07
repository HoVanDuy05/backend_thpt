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
                port: parseInt(process.env.MAIL_PORT || '587'),
                secure: process.env.MAIL_SECURE === 'true', // true for 465, false for 587
                auth: {
                    user: process.env.MAIL_USER || 'user@example.com',
                    pass: process.env.MAIL_PASS || 'password',
                },
                tls: {
                    rejectUnauthorized: false // Helps with some SMTP providers
                }
            },
            defaults: {
                from: `"${process.env.MAIL_FROM_NAME || 'NHers Academy'}" <${process.env.MAIL_FROM_EMAIL || 'noreply@school.com'}>`,
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new EjsAdapter(),
                options: {
                    strict: false,
                },
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
