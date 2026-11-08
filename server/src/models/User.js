import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },          // stored hashed
  role:     { type: String, enum: ['student', 'admin'], default: 'student' },
  clubName: { type: String, default: '' },             // only for admins
}, { timestamps: true });

export default mongoose.model('User', userSchema);