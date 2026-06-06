import Report from '../models/reportModel.js';
import { sendAdminReportEmail } from '../utils/sendEmail.js';
import { getIO } from '../utils/socket.js';

const createReport = async (req, res) => {
  try {
    const { description, location } = req.body;
    const imageUrl = req.file.path; 
    const parsedLocation = JSON.parse(location);
    if (!description || !imageUrl || !parsedLocation) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const newReport = new Report({
      description,
      imageUrl,
      location: parsedLocation,
      user: req.user._id
    });
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error while creating report.' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching reports.' });
  }
};

const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findById(req.params.id);
        if (report) {
            report.status = status || report.status;
            const updatedReport = await report.save();

            try {
      const io = getIO();
      const targetUserId = updatedReport.user.toString();

      io.to(targetUserId).emit('reportStatusUpdated', {
        reportId: updatedReport._id,
        status:   updatedReport.status,
        message:  getStatusMessage(updatedReport.status),
      });

      console.log(`📡 Emitted status update to user ${targetUserId}`);
      } catch (socketError) {
        console.error('Socket emit error:', socketError.message);
      }
      
            res.json(updatedReport);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating report.' });
    }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      await report.deleteOne();
      res.json({ message: 'Report removed' });
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting report.' });
  }
};

const emailReportSummary = async (req, res) => {
    try {
        const newReports = await Report.find({ status: 'new' }).populate('user', 'name');
        
        if (newReports.length === 0) {
            return res.status(400).json({ message: 'No new reports to send.' });
        }

        const adminEmail = process.env.ADMIN_EMAIL; 
        
        if (!adminEmail) {
            return res.status(500).json({ message: 'Admin email is not configured.' });
        }

        await sendAdminReportEmail(adminEmail, newReports);

        res.json({ message: `Report summary sent to ${adminEmail}` });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ message: 'Server error while sending email summary.' });
    }
};

const getStatusMessage = (status) => {
  const messages = {
    new:         'Your report has been received.',
    'in-progress': 'Your report is being reviewed by our team.',
    resolved:    'Your report has been resolved. Thank you!',
  };
  return messages[status] || `Status updated to: ${status}`;
};

export { createReport, getReports, updateReportStatus, deleteReport, emailReportSummary };