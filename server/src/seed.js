import 'dotenv/config';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';

const PASSWORD = 'demo1234';

const admins = [
  { name: 'Tech Club Admin', email: 'techclub@seed.test', clubName: 'Tech Club' },
  { name: 'Cultural Club Admin', email: 'cultural@seed.test', clubName: 'Cultural Club' },
  { name: 'Sports Club Admin', email: 'sports@seed.test', clubName: 'Sports Club' },
];

const studentNames = [
  'Aarav Patil', 'Diya Kulkarni', 'Rohan Naik', 'Sneha Hegde', 'Kiran Joshi', 'Meera Desai',
  'Arjun Shetty', 'Priya Bhat', 'Vikram Rao', 'Ananya Gowda', 'Rahul Kamat', 'Isha Pawar',
];

// days: how many days from today (negative = already happened)
// fill: how many students are registered, attended: how many of them were marked present
const events = [
  { title: 'Hack Night', club: 'Tech Club', days: 5, time: '18:00', venue: 'Seminar Hall',
    capacity: 40, fill: 12, colors: ['#4f46e5', '#7c3aed'],
    description: 'An overnight coding sprint. Form teams of up to four, pick a problem statement and build a working prototype. Snacks provided.' },
  { title: 'Git and GitHub Workshop', club: 'Tech Club', days: 9, time: '15:00', venue: 'Computer Lab 3',
    capacity: 8, fill: 8, colors: ['#0ea5e9', '#2563eb'],
    description: 'Hands-on session on version control: commits, branches, pull requests. Bring your laptop. Very limited seats.' },
  { title: 'Cultural Night', club: 'Cultural Club', days: 14, time: '18:30', venue: 'Open Air Theatre',
    capacity: 200, fill: 12, colors: ['#ec4899', '#f59e0b'],
    description: 'An evening of music, dance and drama performed by students from every department.' },
  { title: 'Dance Fest Auditions', club: 'Cultural Club', days: 7, time: '16:00', venue: 'Main Auditorium',
    capacity: 25, fill: 6, colors: ['#db2777', '#7c3aed'],
    description: 'Auditions for the annual dance fest. Solo and group entries welcome. Prepare a 2 minute routine.' },
  { title: 'Inter-Department Cricket', club: 'Sports Club', days: 12, time: '09:00', venue: 'Main Ground',
    capacity: 60, fill: 9, colors: ['#059669', '#10b981'],
    description: 'Knockout cricket tournament between departments. Register as a player; teams are formed on the day.' },
  { title: 'Chess Tournament', club: 'Sports Club', days: 20, time: '10:00', venue: 'Indoor Stadium',
    capacity: 16, fill: 5, colors: ['#334155', '#0f766e'],
    description: 'A single-elimination chess tournament. Bring your own board if you can. Trophies for the top three.' },
  { title: 'AI Talk Series', club: 'Tech Club', days: -6, time: '17:00', venue: 'Main Auditorium',
    capacity: 50, fill: 11, attended: 8, colors: ['#6366f1', '#ec4899'],
    description: 'Guest talk on practical applications of machine learning, followed by a Q&A session.' },
  { title: 'Open Mic Evening', club: 'Cultural Club', days: -13, time: '18:00', venue: 'Cafeteria Lawn',
    capacity: 40, fill: 10, attended: 7, colors: ['#f97316', '#e11d48'],
    description: 'Poetry, stand-up and live music. Sign up to perform or just come to listen.' },
];

// Today at midnight UTC, shifted by n days (the app displays dates in UTC)
const dayFromNow = (n) => {
  const t = new Date();
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + n));
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Draws a simple poster image as SVG text, so we need no image files
function posterSvg(ev, dateLabel) {
  const [c1, c2] = ev.colors;
  const font = 'font-family="Arial, sans-serif"';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="800" height="450" fill="url(#g)"/>
<circle cx="690" cy="90" r="150" fill="#fff" opacity=".1"/>
<circle cx="110" cy="430" r="120" fill="#fff" opacity=".1"/>
<text x="50" y="90" ${font} font-size="24" font-weight="700" fill="#fff" opacity=".9">${esc(ev.club.toUpperCase())}</text>
<text x="50" y="230" ${font} font-size="42" font-weight="800" fill="#fff">${esc(ev.title)}</text>
<text x="50" y="315" ${font} font-size="24" fill="#fff">${esc(dateLabel)}  |  ${esc(ev.time)}</text>
<text x="50" y="355" ${font} font-size="24" fill="#fff">${esc(ev.venue)}</text>
</svg>`;
}

async function seed() {
  await connectDB();

  // 1. Remove old seed data only (never your own accounts or events)
  const oldUsers = await User.find({ email: /@seed\.test$/ });
  const oldUserIds = oldUsers.map((u) => u._id);
  const oldEvents = await Event.find({ createdBy: { $in: oldUserIds } });
  const oldEventIds = oldEvents.map((e) => e._id);
  await Registration.deleteMany({
    $or: [{ event: { $in: oldEventIds } }, { student: { $in: oldUserIds } }],
  });
  await Event.deleteMany({ _id: { $in: oldEventIds } });
  await User.deleteMany({ _id: { $in: oldUserIds } });

  // 2. Create users (one shared password, hashed once)
  const hashed = await bcrypt.hash(PASSWORD, 10);
  const adminDocs = await User.insertMany(
    admins.map((a) => ({ ...a, password: hashed, role: 'admin' }))
  );
  const students = await User.insertMany(
    studentNames.map((name, i) => ({
      name, email: `student${i + 1}@seed.test`, password: hashed, role: 'student',
    }))
  );

  // 3. Create events, posters and registrations
  fs.mkdirSync('uploads', { recursive: true });
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const admin = adminDocs.find((a) => a.clubName === e.club);
    const date = dayFromNow(e.days);
    const dateLabel = date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    });

    const file = `seed-${i + 1}.svg`;
    fs.writeFileSync(`uploads/${file}`, posterSvg(e, dateLabel));

    const event = await Event.create({
      title: e.title, description: e.description, date, time: e.time, venue: e.venue,
      capacity: e.capacity, registeredCount: e.fill,
      poster: `/uploads/${file}`, createdBy: admin._id,
    });

    const regs = [];
    for (let j = 0; j < e.fill; j++) {
      const attended = j < (e.attended || 0);
      regs.push({
        event: event._id,
        student: students[(i + j) % students.length]._id,
        attended,
        attendedAt: attended ? date : undefined,
      });
    }
    await Registration.insertMany(regs);
  }

  console.log(`Seeded ${adminDocs.length} admins, ${students.length} students, ${events.length} events.`);
  console.log('Logins (password for all: ' + PASSWORD + ')');
  console.log('  Admins:   techclub@seed.test, cultural@seed.test, sports@seed.test');
  console.log('  Students: student1@seed.test ... student12@seed.test');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});