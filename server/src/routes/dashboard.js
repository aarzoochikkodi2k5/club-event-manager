import express from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard  (admin) - stats for THIS admin's events
router.get('/', protect, adminOnly, async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id }).select('title date capacity registeredCount');
  const ids = events.map(e => e._id);

  const totalRegistrations = await Registration.countDocuments({ event: { $in: ids } });
  const totalAttended = await Registration.countDocuments({ event: { $in: ids }, attended: true });

  res.json({
    totalEvents: events.length,
    totalRegistrations,
    totalAttended,
    attendanceRate: totalRegistrations ? Math.round((totalAttended / totalRegistrations) * 100) : 0,
    perEvent: events.map(e => ({
      id: e._id, title: e.title, date: e.date,
      capacity: e.capacity, registered: e.registeredCount,
    })),
  });
});

export default router;