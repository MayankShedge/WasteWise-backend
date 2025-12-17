import Schedule from '../models/ScheduleModel.js';

const getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({});
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching schedules.' });
    }
};

const createSchedule = async (req, res) => {
    try {
        const newSchedule = new Schedule({
            area: 'New Area (click to edit)',
            collection: 'New collection details (click to edit)',
        });
        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
         res.status(500).json({ message: 'Server error while creating schedule.' });
    }
};

const updateSchedule = async (req, res) => {
    const { area, collection } = req.body;
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (schedule) {
            schedule.area = area || schedule.area;
            schedule.collection = collection || schedule.collection;

            const updatedSchedule = await schedule.save();
            res.json(updatedSchedule);
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating schedule.' });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (schedule) {
            await schedule.deleteOne();
            res.json({ message: 'Schedule removed' });
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
         res.status(500).json({ message: 'Server error while deleting schedule.' });
    }
};


export { getSchedules, createSchedule, updateSchedule, deleteSchedule };

