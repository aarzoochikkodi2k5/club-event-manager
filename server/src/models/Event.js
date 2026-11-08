import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },       // e.g. "17:30"
  venue:       { type: String, required: true },
  capacity:    { type: Number, required: true, min: 1 },
  registeredCount: { type: Number, default: 0 },       // seats taken so far
  poster:      { type: String, default: '' },          // file path
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);