import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, clubName, adminCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Fill all fields' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already used' });

    let finalRole = 'student';
    if (role === 'admin') {
      if (adminCode !== process.env.ADMIN_CODE)
        return res.status(403).json({ message: 'Wrong admin code' });
      finalRole = 'admin';
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, role: finalRole, clubName: clubName || '',
    });

    res.status(201).json({
      token: makeToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, clubName: user.clubName },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Wrong email or password' });

    res.json({
      token: makeToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, clubName: user.clubName },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  (used by React to restore login on page refresh)
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

export default router;