const sendBrevoEmail = async (to, subject, htmlContent) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: 'WasteWise',
                email: 'shedgemayank0@gmail.com'
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: htmlContent
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Brevo API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
};

const sendVerificationEmail = async (userEmail, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const htmlContent = `
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
    `;

    try {
        await sendBrevoEmail(userEmail, 'Please verify your email for WasteWise', htmlContent);
        console.log(`Verification email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Email could not be sent.');
    }
};

const sendAdminReportEmail = async (adminEmail, reports) => {
    const htmlContent = `
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
        await sendBrevoEmail(adminEmail, `WasteWise Daily Report Summary (${new Date().toLocaleDateString()})`, htmlContent);
        console.log(`Admin report sent to ${adminEmail}`);
    } catch (error) {
        console.error('Error sending admin report:', error);
    }
};

const sendPasswordResetEmail = async (userEmail, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const htmlContent = `
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
    `;

    try {
        await sendBrevoEmail(userEmail, 'Password Reset Request for WasteWise', htmlContent);
        console.log(`Password reset email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Email could not be sent.');
    }
};

const sendPickupReminderEmail = async (userEmail, wasteType, pickupTime, location) => {
    const htmlContent = `
      <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #2E7D32; font-size: 28px;">WasteWise ♻️</h1>
          </div>
          <h2 style="color: #333; text-align: center;">📬 Pickup Reminder</h2>
          <p style="color: #555; font-size: 16px;">
            Don't forget! Your <strong>${wasteType}</strong> waste pickup is scheduled for <strong>tomorrow</strong>.
          </p>
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${location}</p>
            <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${pickupTime}</p>
            <p style="margin: 5px 0;"><strong>🗑️ Waste Type:</strong> ${wasteType}</p>
          </div>
          <p style="color: #555; font-size: 14px;"><strong>Tips:</strong></p>
          <ul style="color: #555; font-size: 14px;">
            <li>Segregate your waste properly</li>
            <li>Keep bins accessible for collection</li>
            <li>Ensure proper bag sealing</li>
          </ul>
          <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>WasteWise Navi Mumbai</p>
          </div>
        </div>
      </div>
    `;

    try {
        await sendBrevoEmail(userEmail, '📬 Waste Pickup Reminder - Tomorrow', htmlContent);
        console.log(`Pickup reminder sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending pickup reminder:', error);
    }
};

const sendWeeklySummaryEmail = async (userEmail, userName, stats) => {
    const htmlContent = `
      <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #2E7D32; font-size: 28px;">WasteWise ♻️</h1>
          </div>
          <h2 style="color: #333; text-align: center;">📊 Your Weekly Summary</h2>
          <p style="color: #555; font-size: 16px;">Hi <strong>${userName}</strong>, here's your impact this week!</p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">📈 This Week's Stats</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #555;">🗑️ Reports Submitted:</td>
                <td style="text-align: right; font-weight: bold; color: #2E7D32;">${stats.reportsSubmitted}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #555;">✅ Reports Resolved:</td>
                <td style="text-align: right; font-weight: bold; color: #2E7D32;">${stats.reportsResolved}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #555;">🌍 Environmental Impact:</td>
                <td style="text-align: right; font-weight: bold; color: #2E7D32;">${stats.impactPoints} points</td>
              </tr>
            </table>
          </div>

          ${stats.reportsSubmitted > 0 ? `
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #2E7D32; font-size: 18px; font-weight: bold;">🎉 Great job contributing to a cleaner community!</p>
            </div>
          ` : `
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 16px;">Haven't submitted any reports this week? Help us keep Navi Mumbai clean!</p>
            </div>
          `}

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #f57c00; margin-top: 0;">💡 Quick Tip</h4>
            <p style="color: #555; margin: 0;">Remember to check your pickup schedule and segregate waste properly for better recycling!</p>
          </div>

          <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>WasteWise Navi Mumbai</p>
            <p>Keep making a difference! ♻️</p>
          </div>
        </div>
      </div>
    `;

    try {
        await sendBrevoEmail(userEmail, '📊 Your Weekly WasteWise Summary', htmlContent);
        console.log(`Weekly summary sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending weekly summary:', error);
    }
};

export { 
    sendVerificationEmail, 
    sendAdminReportEmail, 
    sendPasswordResetEmail,
    sendPickupReminderEmail,
    sendWeeklySummaryEmail
};