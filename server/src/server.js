import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(cors());                          // allow the React app to call us
app.use(express.json());                  // parse JSON request bodies
   

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.send('Club Event Manager API running'));
// Turns upload errors (like "File too large") into a clean message
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

connectDB()
  .then(() => app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`)))
  .catch(err => { console.error('DB connection failed:', err.message); process.exit(1); });