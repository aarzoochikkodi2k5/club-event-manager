import express from 'express';
import fs from 'fs';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /api/events?search=hack&upcoming=true&mine=true
router.get('/', protect, async (req, res) => {
  const { search, upcoming, mine } = req.query;
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };   // case-insensitive
  if (upcoming === 'true') filter.date = { $gte: new Date() };
  if (mine === 'true' && req.user.role === 'admin') filter.createdBy = req.user._id;

  const events = await Event.find(filter)
    .populate('createdBy', 'name clubName')   // replace id with name/clubName
    .sort({ date: 1 });
  res.json(events);
});

// GET /api/events/:id
router.get('/:id', protect, async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name clubName');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

// POST /api/events  (admin) - multipart form with optional "poster" file
router.post('/', protect, adminOnly, upload.single('poster'), async (req, res) => {
  try {
    
    const { title, description, date, time, venue, capacity } = req.body;
    const event = await Event.create({
      title, description, date, time, venue, capacity: Number(capacity),
      poster: req.file ? `/uploads/${req.file.filename}` : '',
      createdBy: req.user._id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/events/:id  (admin who owns it)
router.put('/:id', protect, adminOnly, upload.single('poster'), async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Not your event' });

  const { title, description, date, time, venue, capacity } = req.body;
  if (capacity && Number(capacity) < event.registeredCount)
    return res.status(400).json({ message: 'Capacity cannot be below current registrations' });

  Object.assign(event, { title, description, date, time, venue });
  if (capacity) event.capacity = Number(capacity);
  if (req.file) event.poster = `/uploads/${req.file.filename}`;
  await event.save();
  res.json(event);
});

// DELETE /api/events/:id  (admin who owns it)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Not your event' });

  if (event.poster) fs.unlink('.' + event.poster, () => {});   // remove image file
  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});

// GET /api/events/:id/registrations  (admin) - who registered
router.get('/:id/registrations', protect, adminOnly, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Not your event' });

  const regs = await Registration.find({ event: event._id })
    .populate('student', 'name email')
    .sort({ createdAt: 1 });
  res.json(regs);
});

export default router;