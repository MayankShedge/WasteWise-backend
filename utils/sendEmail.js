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
        <div style="max-width: 900px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">WasteWise - New Community Reports Summary</h2>
          <p style="color: #555;">You have <strong>${reports.length} new report(s)</strong> awaiting review.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background-color: #e9ecef;">
              <tr>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Submitted By</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Description</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Location</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${reports.map(report => {
                // Format location coordinates
                const lat = report.location?.coordinates?.[1] || 'N/A';
                const lng = report.location?.coordinates?.[0] || 'N/A';
                const googleMapsLink = lat !== 'N/A' && lng !== 'N/A' 
                  ? `https://www.google.com/maps?q=${lat},${lng}`
                  : '#';
                const locationText = lat !== 'N/A' && lng !== 'N/A'
                  ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                  : 'No location';
                
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="border: 1px solid #dee2e6; padding: 12px;">${report.user ? report.user.name : 'N/A'}</td>
                    <td style="border: 1px solid #dee2e6; padding: 12px;">${report.description}</td>
                    <td style="border: 1px solid #dee2e6; padding: 12px;">
                      ${lat !== 'N/A' && lng !== 'N/A' ? `
                        <a href="${googleMapsLink}" target="_blank" style="color: #2E7D32; text-decoration: none;">
                          📍 View on Map
                        </a>
                        <br>
                        <small style="color: #666;">${locationText}</small>
                      ` : 'No location'}
                    </td>
                    <td style="border: 1px solid #dee2e6; padding: 12px;">${new Date(report.createdAt).toLocaleDateString()}</td>
                  </tr>
                `;
              }).join('')}
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
    // Calculate progress to next badge
    let nextBadge = '';
    let pointsToNext = 0;
    let progressPercent = 0;
    
    if (stats.currentPoints < 100) {
        nextBadge = 'Green Guardian';
        pointsToNext = 100 - stats.currentPoints;
        progressPercent = (stats.currentPoints / 100) * 100;
    } else if (stats.currentPoints < 250) {
        nextBadge = 'Eco Enthusiast';
        pointsToNext = 250 - stats.currentPoints;
        progressPercent = ((stats.currentPoints - 100) / 150) * 100;
    } else if (stats.currentPoints < 500) {
        nextBadge = 'Waste Warrior';
        pointsToNext = 500 - stats.currentPoints;
        progressPercent = ((stats.currentPoints - 250) / 250) * 100;
    } else {
        nextBadge = 'Max Level!';
        pointsToNext = 0;
        progressPercent = 100;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 15px !important; }
            .stats-table td { font-size: 14px !important; }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <div style="background-color: #f4f4f4; padding: 20px;">
          <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
              <h1 style="color: #2E7D32; font-size: 28px; margin: 0;">WasteWise ♻️</h1>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Your Weekly Impact Report</p>
            </div>
            
            <!-- Greeting -->
            <h2 style="color: #333; text-align: center; font-size: 22px;">📊 Hi ${userName}!</h2>
            <p style="color: #555; font-size: 16px; text-align: center; margin-bottom: 25px;">
              Here's your environmental impact this week
            </p>
            
            <!-- Badge & Points Card -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px; color: white;">
              <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${stats.currentBadge}</div>
              <div style="font-size: 18px; opacity: 0.9;">${stats.currentPoints} Total Points</div>
              ${stats.pointsEarnedThisWeek > 0 ? `
                <div style="background-color: rgba(255,255,255,0.2); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 14px;">
                  +${stats.pointsEarnedThisWeek} points earned this week! 🎉
                </div>
              ` : ''}
            </div>

            <!-- Progress to Next Badge -->
            ${pointsToNext > 0 ? `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                  Progress to <strong style="color: #2E7D32;">${nextBadge}</strong>
                </div>
                <div style="background-color: #e0e0e0; height: 10px; border-radius: 10px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%); height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 12px; color: #888; margin-top: 5px; text-align: right;">
                  ${pointsToNext} points to go
                </div>
              </div>
            ` : `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <span style="font-size: 20px;">👑</span>
                <div style="color: #856404; font-weight: bold; margin-top: 5px;">You've reached the maximum level!</div>
              </div>
            `}
            
            <!-- This Week's Stats -->
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #1976d2; margin-top: 0; font-size: 18px; margin-bottom: 15px;">📈 This Week's Activity</h3>
              <table class="stats-table" style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                  <td style="padding: 12px 0; color: #555; font-size: 15px;">
                    <span style="margin-right: 8px;">🗑️</span>Reports Submitted
                  </td>
                  <td style="text-align: right; font-weight: bold; color: #2E7D32; font-size: 18px;">
                    ${stats.reportsSubmitted}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.1);">
                  <td style="padding: 12px 0; color: #555; font-size: 15px;">
                    <span style="margin-right: 8px;">✅</span>Reports Resolved
                  </td>
                  <td style="text-align: right; font-weight: bold; color: #2E7D32; font-size: 18px;">
                    ${stats.reportsResolved}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #555; font-size: 15px;">
                    <span style="margin-right: 8px;">⭐</span>Impact Points
                  </td>
                  <td style="text-align: right; font-weight: bold; color: #2E7D32; font-size: 18px;">
                    ${stats.impactPoints}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Motivational Message -->
            ${stats.reportsSubmitted > 0 ? `
              <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px; color: white;">
                <div style="font-size: 32px; margin-bottom: 10px;">🎉</div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">Amazing Work!</div>
                <div style="font-size: 14px; opacity: 0.9;">You're making Navi Mumbai cleaner, one report at a time!</div>
              </div>
            ` : `
              <div style="background-color: #fff3e0; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                <div style="font-size: 32px; margin-bottom: 10px;">🌱</div>
                <div style="color: #e65100; font-size: 16px; margin-bottom: 5px;">No reports this week?</div>
                <div style="color: #666; font-size: 14px;">Help us keep Navi Mumbai clean - submit a report today!</div>
              </div>
            `}

            <!-- Quick Stats Summary -->
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 120px; padding: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #2E7D32;">${stats.currentPoints}</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Total Points</div>
                </div>
                <div style="flex: 1; min-width: 120px; padding: 10px;">
                  <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${stats.totalReportsAllTime || 0}</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Reports Ever</div>
                </div>
                ${stats.leaderboardRank ? `
                  <div style="flex: 1; min-width: 120px; padding: 10px;">
                    <div style="font-size: 24px; font-weight: bold; color: #f57c00;">#${stats.leaderboardRank}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">Leaderboard</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Quick Tip -->
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f57c00;">
              <h4 style="color: #f57c00; margin: 0 0 10px 0; font-size: 16px;">💡 Quick Tip</h4>
              <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.5;">
                Remember to segregate waste at source! Dry waste (plastic, paper) and wet waste (food scraps) should be kept separate for better recycling.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;">WasteWise Navi Mumbai</p>
              <p style="margin: 5px 0;">Keep making a difference! ♻️</p>
              <p style="margin: 15px 0 0 0; font-size: 11px;">
                <a href="#" style="color: #aaa; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
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