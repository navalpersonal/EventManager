import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const EVENTS_FILE = './data/events.json';
const META_FILE = './data/meta.json';
const JWT_SECRET = 'your_jwt_secret';

function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
function readEvents() {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(EVENTS_FILE));
}
function writeEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}
function readMeta() {
  if (!fs.existsSync(META_FILE)) return { dressCodes: [], venues: [] };
  return JSON.parse(fs.readFileSync(META_FILE));
}
function writeMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

router.get('/', authMiddleware, (req, res) => {
  const events = readEvents().filter(e => e.username === req.user.username);
  res.json(events);
});

router.post('/', authMiddleware, (req, res) => {
  const events = readEvents();
  const { date, time, eventName, dressCode, venue, remarks } = req.body;
  const srNo = events.length + 1;
  events.push({ srNo, date, time, eventName, dressCode, venue, remarks, username: req.user.username });
  writeEvents(events);
  res.json({ message: 'Event added' });
});

router.put('/:srNo', authMiddleware, (req, res) => {
  const events = readEvents();
  const idx = events.findIndex(e => e.srNo == req.params.srNo && e.username === req.user.username);
  if (idx === -1) return res.status(404).json({ message: 'Event not found' });
  events[idx] = { ...events[idx], ...req.body };
  writeEvents(events);
  res.json({ message: 'Event updated' });
});

router.delete('/:srNo', authMiddleware, (req, res) => {
  let events = readEvents();
  events = events.filter(e => !(e.srNo == req.params.srNo && e.username === req.user.username));
  writeEvents(events);
  res.json({ message: 'Event deleted' });
});

router.get('/meta', authMiddleware, (req, res) => {
  res.json(readMeta());
});

router.post('/meta', authMiddleware, (req, res) => {
  const meta = readMeta();
  const { dressCode, venue } = req.body;
  if (dressCode && !meta.dressCodes.includes(dressCode)) meta.dressCodes.push(dressCode);
  if (venue && !meta.venues.includes(venue)) meta.venues.push(venue);
  writeMeta(meta);
  res.json(meta);
});

export default router;
