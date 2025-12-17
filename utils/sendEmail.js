import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (userEmail, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    try {
        await resend.emails.send({
            from: 'WasteWise <onboarding@resend.dev>', // You'll update this later with your domain
            to: userEmail,
            subject: 'Please verify your email for WasteWise',
            html: `
              <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="color: #2E7D32; font-size: 28px;">WasteWise ♻️</h1>
                  </div>
                  <h2 style="color: #333; text-align: center;">Welcome! Just one more step...</h2>
                  <p style="color: #555; font-size: 16px;">
                    Thank you for registering with WasteWise. Please click the button below to verify your email address and activate your account.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #28a745; color: white; padding: 15px 30px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 18px; font-weight: bold;">
                       Verify Your Email
                    </a>
                  </div>
                  <p style="color: #777; font-size: 14px;">
                    If you did not create an account, no further action is required.
                  </p>
                  <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p>WasteWise Navi Mumbai</p>
                  </div>
                </div>
              </div>
            `,
        });
        console.log(`Verification email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Email could not be sent.');
    }
};

const sendAdminReportEmail = async (adminEmail, reports) => {
    const reportsHtml = `
      <div style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 800px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">WasteWise - New Community Reports Summary</h2>
          <p style="color: #555;">You have <strong>${reports.length} new report(s)</strong> awaiting review.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background-color: #e9ecef;">
              <tr>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Submitted By</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Description</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${reports.map(report => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="border: 1px solid #dee2e6; padding: 12px;">${report.user ? report.user.name : 'N/A'}</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">${report.description}</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">${new Date(report.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    try {
        await resend.emails.send({
            from: 'WasteWise Reporter <onboarding@resend.dev>',
            to: adminEmail,
            subject: `WasteWise Daily Report Summary (${new Date().toLocaleDateString()})`,
            html: reportsHtml,
        });
        console.log(`Admin report sent to ${adminEmail}`);
    } catch (error) {
        console.error('Error sending admin report:', error);
    }
};

const sendPasswordResetEmail = async (userEmail, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    try {
        await resend.emails.send({
            from: 'WasteWise <onboarding@resend.dev>',
            to: userEmail,
            subject: 'Password Reset Request for WasteWise',
            html: `
              <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
                    <h1 style="color: #2E7D32; font-size: 28px;">WasteWise ♻️</h1>
                  </div>
                  <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                  <p style="color: #555; font-size: 16px;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                  <p style="color: #555; font-size: 16px;">Please click the button below to choose a new password. This link will expire in 15 minutes.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #f0ad4e; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 18px; font-weight: bold;">
                       Reset Your Password
                    </a>
                  </div>
                  <p style="color: #777; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                </div>
              </div>
            `,
        });
        console.log(`Password reset email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Email could not be sent.');
    }
};

export { sendVerificationEmail, sendAdminReportEmail, sendPasswordResetEmail };