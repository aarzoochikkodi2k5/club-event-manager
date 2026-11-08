import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Copy an uploaded file into the event document
function attachPoster(event, file) {
  event.posterData = file.buffer;
  event.posterType = file.mimetype;
  event.poster = `/api/events/${event._id}/poster?v=${Date.now()}`;   // ?v= makes browsers reload a changed poster
}

// GET /api/events/clubs - club names for the filter buttons (public)
router.get('/clubs', async (req, res) => {
  const clubs = await User.distinct('clubName', { role: 'admin', clubName: { $ne: '' } });
  res.json(clubs.sort());
});

// GET /api/events?search=&upcoming=&club=&mine=  (public)
router.get('/', optionalAuth, async (req, res) => {
  const { search, upcoming, mine, club } = req.query;
  const filter = {};
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: safe, $options: 'i' };
  }
  if (upcoming === 'true') filter.date = { $gte: new Date() };
  if (club) {
    const admins = await User.find({ role: 'admin', clubName: club }).select('_id');
    filter.createdBy = { $in: admins.map((a) => a._id) };
  }
  if (mine === 'true' && req.user?.role === 'admin') filter.createdBy = req.user._id;

  const events = await Event.find(filter)
    .populate('createdBy', 'name clubName')
    .sort({ date: 1 });
  res.json(events);
});

// GET /api/events/:id/poster - serves the image from the database (public)
router.get('/:id/poster', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('+posterData posterType');
    if (!event || !event.posterData) return res.status(404).end();
    res.set('Content-Type', event.posterType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(event.posterData);
  } catch {
    res.status(404).end();
  }
});

// GET /api/events/:id  (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name clubName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch {
    res.status(404).json({ message: 'Event not found' });
  }
});

// POST /api/events  (admin) - multipart form with optional "poster" file
router.post('/', protect, adminOnly, upload.single('poster'), async (req, res) => {
  try {
    const { title, description, date, time, venue, capacity } = req.body;
    const event = new Event({
      title, description, date, time, venue,
      capacity: Number(capacity),
      createdBy: req.user._id,
    });
    if (req.file) attachPoster(event, req.file);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/events/:id  (admin who owns it)
router.put('/:id', protect, adminOnly, upload.single('poster'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Not your event' });

    const { title, description, date, time, venue, capacity } = req.body;
    if (capacity && Number(capacity) < event.registeredCount)
      return res.status(400).json({ message: 'Capacity cannot be below current registrations' });

    Object.assign(event, { title, description, date, time, venue });
    if (capacity) event.capacity = Number(capacity);
    if (req.file) attachPoster(event, req.file);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/events/:id  (admin who owns it)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Not your event' });

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