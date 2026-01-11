import { Resend } from 'resend';

export const sendWelcomeEmail = async (email: string, name: string, tempPassword: string) => {
    // Check for API key at runtime to avoid top-level errors during build/dev
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn("Skipping email send: RESEND_API_KEY is missing");
        return;
    }

    const resend = new Resend(apiKey);
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await resend.emails.send({
        from: 'WorkforceOne <welcome@workforceone.co.za>',
        to: email,
        subject: 'Welcome to WorkforceOne',
        html: `
            <h1>Welcome to WorkforceOne, ${name}!</h1>
            <p>You have been invited to join your organization's workspace.</p>
            <p>Your temporary password is: <strong>${tempPassword}</strong></p>
            <p>Please log in at <a href="${domain}">${domain}</a> and change your password immediately.</p>
            <br />
            <p>Best regards,<br>The WorkforceOne Team</p>
        `
    });
};
