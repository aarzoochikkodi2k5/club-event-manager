import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },
  venue:       { type: String, required: true },
  capacity:    { type: Number, required: true, min: 1 },
  registeredCount: { type: Number, default: 0 },
  poster:      { type: String, default: '' },                    // web address of the image
  posterData:  { type: Buffer, select: false },                  // the image itself
  posterType:  { type: String, default: '' },                    // e.g. image/jpeg
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  toJSON: { transform: (doc, ret) => { delete ret.posterData; return ret; } },
});

export default mongoose.model('Event', eventSchema);