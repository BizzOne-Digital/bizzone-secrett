const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ── ENV ─────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'bizz1_fallback_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// ── Mongoose connection (cached for serverless) ─────────────────────────
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Models ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function (p) {
  return await bcrypt.compare(p, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const businessDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cfg: { type: mongoose.Schema.Types.Mixed, default: { usdcad: 1.38, pkrusd: 283, hrs: 160 } },
  ue: { type: mongoose.Schema.Types.Mixed, default: null },
  op: { type: mongoose.Schema.Types.Mixed, default: null },
  pay: { type: mongoose.Schema.Types.Mixed, default: null },
  biz: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true, minimize: false });

const BusinessData = mongoose.models.BusinessData || mongoose.model('BusinessData', businessDataSchema);

// ── Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

async function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }
  if (!token) return res.status(401).json({ message: 'No token' });
}

// ── Auth Routes ─────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 chars' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });

    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    await BusinessData.create({
      user: user._id,
      pay: {
        currentMonth,
        employees: [], months: {}, compliance: {},
        roles: ['Graphic Designer','Meta Ads','Google Ads','Coordinator + QA','Content Strategist & Writer','Developer','Video Editor','Scheduler','HR','Automations','Sales','Videographer','TikTok Ads'],
        depts: ['Client Delivery','Development','Automation & Sales','Management','QA','HR']
      }
    });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
});

// ── Data Routes ─────────────────────────────────────────────────────────
app.get('/api/data', protect, async (req, res) => {
  await connectDB();
  try {
    let data = await BusinessData.findOne({ user: req.user._id });
    if (!data) data = await BusinessData.create({ user: req.user._id });
    res.json(data);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to load' }); }
});

app.put('/api/data', protect, async (req, res) => {
  await connectDB();
  try {
    const { cfg, ue, op, pay, biz } = req.body;
    const update = {};
    if (cfg !== undefined) update.cfg = cfg;
    if (ue !== undefined) update.ue = ue;
    if (op !== undefined) update.op = op;
    if (pay !== undefined) update.pay = pay;
    if (biz !== undefined) update.biz = biz;

    const data = await BusinessData.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true, runValidators: false }
    );
    res.json({ message: 'Saved', updatedAt: data.updatedAt });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to save' }); }
});

app.patch('/api/data/:section', protect, async (req, res) => {
  await connectDB();
  try {
    const { section } = req.params;
    if (!['cfg','ue','op','pay','biz'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }
    const data = await BusinessData.findOneAndUpdate(
      { user: req.user._id },
      { $set: { [section]: req.body } },
      { new: true, upsert: true, runValidators: false }
    );
    res.json({ message: 'Saved ' + section, updatedAt: data.updatedAt });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to save' }); }
});

app.delete('/api/data', protect, async (req, res) => {
  await connectDB();
  try {
    await BusinessData.findOneAndDelete({ user: req.user._id });
    const data = await BusinessData.create({ user: req.user._id });
    res.json({ message: 'Reset complete', data });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to reset' }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

module.exports = app;