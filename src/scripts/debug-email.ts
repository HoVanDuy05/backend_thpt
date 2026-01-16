
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from the root of backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function debugEmail() {
    console.log('--- STARTING EMAIL DEBUG ---');
    console.log('Current working directory:', process.cwd());

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ ERROR: RESEND_API_KEY is missing in .env file');
        return;
    }
    console.log('✅ Found RESEND_API_KEY:', apiKey.slice(0, 5) + '...');

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Check if we are in sandbox mode
    if (fromEmail.includes('resend.dev')) {
        console.warn('⚠️  WARNING: You are using the default Resend Sandbox domain (onboarding@resend.dev).');
        console.warn('   In this mode, you can ONLY send emails to the address you used to sign up for Resend.');
        console.warn('   Sending to any other address will FAIL.');
    }

    const testRecipient = 'vanduyho919@gmail.com'; // Trying the likely owner email first based on code comments

    console.log(`\n📧 Attempting to send test email to: ${testRecipient}`);
    console.log(`📨 From: ${fromEmail}`);

    try {
        const { data, error } = await resend.emails.send({
            from: 'NHers Debug <' + fromEmail + '>',
            to: [testRecipient],
            subject: 'Debug Email Test 🧪',
            html: '<p>This is a test email to verify your Resend configuration. <strong>It works!</strong></p>',
        });

        if (error) {
            console.error('❌ FAILED to send email.');
            console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Email sent SUCCESSFULLY!');
            console.log('Response data:', data);
        }
    } catch (err) {
        console.error('❌ EXCEPTION occurred while sending:');
        console.error(err);
    }
    console.log('--- END DEBUG ---');
}

debugEmail();
