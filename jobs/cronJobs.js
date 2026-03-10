import cron from 'node-cron';
import Report from '../models/reportModel.js';
import Schedule from '../models/scheduleModel.js';
import User from '../models/userModel.js';
import { 
    sendAdminReportEmail, 
    sendPickupReminderEmail,
    sendWeeklySummaryEmail 
} from '../utils/sendEmail.js';

// 1. Daily Admin Report
const sendDailyAdminReport = async () => {
    try {
        console.log('Running daily admin report cron job...');
        
        const newReports = await Report.find({ status: 'new' }).populate('user', 'name');
        
        if (newReports.length === 0) {
            console.log('No new reports to send. Skipping email.');
            return;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        
        if (!adminEmail) {
            console.error('Admin email is not configured in environment variables.');
            return;
        }

        await sendAdminReportEmail(adminEmail, newReports);
        console.log(`Daily report sent to ${adminEmail} with ${newReports.length} new report(s).`);
        
    } catch (error) {
        console.error('Error in daily admin report cron job:', error);
    }
};

// 2. Pickup Schedule Reminders
const sendPickupReminders = async () => {
    try {
        console.log('Running pickup reminder cron job...');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
        
        const schedules = await Schedule.find({ 
            day: tomorrowDay
        }).populate('location');
        
        if (schedules.length === 0) {
            console.log('No pickups scheduled for tomorrow.');
            return;
        }
        
        let remindersSent = 0;
        
        for (const schedule of schedules) {
            const users = await User.find({ isVerified: true });
            
            for (const user of users) {
                try {
                    await sendPickupReminderEmail(
                        user.email,
                        schedule.wasteType,
                        schedule.time,
                        schedule.location ? schedule.location.area : 'Your area'
                    );
                    remindersSent++;
                } catch (error) {
                    console.error(`Failed to send reminder to ${user.email}:`, error.message);
                }
            }
        }
        
        console.log(`Sent ${remindersSent} pickup reminder(s).`);
        
    } catch (error) {
        console.error('Error in pickup reminder cron job:', error);
    }
};

// 3. Auto-Close Old Reports
const autoCloseOldReports = async () => {
    try {
        console.log('Running auto-close old reports cron job...');
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result = await Report.updateMany(
            {
                status: 'new',
                createdAt: { $lt: thirtyDaysAgo }
            },
            {
                $set: { 
                    status: 'closed',
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`Auto-closed ${result.modifiedCount} old report(s).`);
        } else {
            console.log('No old reports to close.');
        }
        
    } catch (error) {
        console.error('Error in auto-close old reports cron job:', error);
    }
};

// 4. Weekly User Summary
const sendWeeklyUserSummaries = async () => {
    try {
        console.log('Running weekly user summary cron job...');
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const users = await User.find({ isVerified: true });
        
        let summariesSent = 0;
        
        for (const user of users) {
            try {
                const reportsSubmitted = await Report.countDocuments({
                    user: user._id,
                    createdAt: { $gte: oneWeekAgo }
                });
                
                const reportsResolved = await Report.countDocuments({
                    user: user._id,
                    status: 'resolved',
                    updatedAt: { $gte: oneWeekAgo }
                });
                
                const stats = {
                    reportsSubmitted,
                    reportsResolved,
                    impactPoints: reportsSubmitted * 10 + reportsResolved * 5
                };
                
                await sendWeeklySummaryEmail(user.email, user.name, stats);
                summariesSent++;
                
            } catch (error) {
                console.error(`Failed to send summary to ${user.email}:`, error.message);
            }
        }
        
        console.log(`Sent ${summariesSent} weekly summary email(s).`);
        
    } catch (error) {
        console.error('Error in weekly user summary cron job:', error);
    }
};

// Initialize all cron jobs
export const initCronJobs = () => {
    cron.schedule('0 9 * * *', sendDailyAdminReport, { timezone: "Asia/Kolkata" });
    cron.schedule('0 18 * * *', sendPickupReminders, { timezone: "Asia/Kolkata" });
    cron.schedule('0 0 * * 0', autoCloseOldReports, { timezone: "Asia/Kolkata" });
    cron.schedule('0 8 * * 1', sendWeeklyUserSummaries, { timezone: "Asia/Kolkata" });
    
    console.log('Cron jobs initialized!');
    console.log('   - Daily admin report: Every day at 9:00 AM IST');
    console.log('   - Pickup reminders: Every day at 6:00 PM IST');
    console.log('   - Auto-close old reports: Every Sunday at 12:00 AM IST');
    console.log('   - Weekly user summary: Every Monday at 8:00 AM IST');
};

export { sendDailyAdminReport, sendPickupReminders, autoCloseOldReports, sendWeeklyUserSummaries };