import cron from 'node-cron';
import Report from '../models/reportModel.js';
import { sendAdminReportEmail } from '../utils/sendEmail.js';

const sendDailyAdminReport = async () => {
    try {
        console.log('🕒 Running daily admin report cron job...');
        
        // Find all new reports
        const newReports = await Report.find({ status: 'new' }).populate('user', 'name');
        
        // Skip if no new reports
        if (newReports.length === 0) {
            console.log('✅ No new reports to send. Skipping email.');
            return;
        }

        // Get admin email from environment
        const adminEmail = process.env.ADMIN_EMAIL;
        
        if (!adminEmail) {
            console.error('Admin email is not configured in environment variables.');
            return;
        }

        // Send email
        await sendAdminReportEmail(adminEmail, newReports);
        console.log(`✅ Daily report sent to ${adminEmail} with ${newReports.length} new report(s).`);
        
    } catch (error) {
        console.error('Error in daily admin report cron job:', error);
    }
};

// Schedule cron jobs
export const initCronJobs = () => {
    // Run every day at 9 AM IST
    cron.schedule('0 9 * * *', sendDailyAdminReport, {
        timezone: "Asia/Kolkata"
    });

    console.log('📅 Cron jobs initialized!');
    console.log('   - Daily admin report: Every day at 9:00 AM IST');
};

// Export for manual testing
export { sendDailyAdminReport };