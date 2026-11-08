import express from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { protect, adminOnly, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/registrations/mine  (student) - "My Events"
router.get('/mine', protect, studentOnly, async (req, res) => {
  const regs = await Registration.find({ student: req.user._id })
    .populate({ path: 'event', populate: { path: 'createdBy', select: 'clubName name' } })
    .sort({ createdAt: -1 });
  res.json(regs.filter(r => r.event));   // skip any whose event was deleted
});

// POST /api/registrations/:eventId  (student) - RSVP
router.post('/:eventId', protect, studentOnly, async (req, res) => {
  try {
    // Atomic step: take a seat ONLY IF registeredCount < capacity
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!event) {
      const exists = await Event.exists({ _id: req.params.eventId });
      return res.status(exists ? 400 : 404).json({ message: exists ? 'Event is full' : 'Event not found' });
    }

    try {
      const reg = await Registration.create({ event: event._id, student: req.user._id });
      res.status(201).json(reg);
    } catch (err) {
      // Registration failed (e.g. duplicate) -> give the seat back
      await Event.updateOne({ _id: event._id }, { $inc: { registeredCount: -1 } });
      if (err.code === 11000) return res.status(400).json({ message: 'Already registered' });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/registrations/:eventId  (student) - cancel RSVP
router.delete('/:eventId', protect, studentOnly, async (req, res) => {
  const reg = await Registration.findOneAndDelete({ event: req.params.eventId, student: req.user._id });
  if (!reg) return res.status(404).json({ message: 'You are not registered' });
  await Event.updateOne({ _id: req.params.eventId }, { $inc: { registeredCount: -1 } });
  res.json({ message: 'Registration cancelled' });
});

// PATCH /api/registrations/:id/attendance  (admin) - body: { "attended": true }
router.patch('/:id/attendance', protect, adminOnly, async (req, res) => {
  const reg = await Registration.findById(req.params.id).populate('event');
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  if (!reg.event.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Not your event' });

  reg.attended = !!req.body.attended;
  reg.attendedAt = reg.attended ? new Date() : undefined;
  await reg.save();
  res.json(reg);
});

export default router;