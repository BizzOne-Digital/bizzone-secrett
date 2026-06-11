const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'bizz1_fallback_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// Cached mongoose connection for serverless
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };
async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Models ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin','user'], default: 'user' }
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(p) { return bcrypt.compare(p, this.password); };
const User = mongoose.models.User || mongoose.model('User', userSchema);

const bdSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cfg: { type: mongoose.Schema.Types.Mixed, default: { usdcad:1.38, pkrusd:283, hrs:160 } },
  ue: { type: mongoose.Schema.Types.Mixed, default: null },
  op: { type: mongoose.Schema.Types.Mixed, default: null },
  pay: { type: mongoose.Schema.Types.Mixed, default: null },
  biz: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true, minimize: false });
const BusinessData = mongoose.models.BusinessData || mongoose.model('BusinessData', bdSchema);

// ── Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

async function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      return next();
    } catch(e) { return res.status(401).json({ message: 'Not authorized' }); }
  }
  return res.status(401).json({ message: 'No token' });
}

// ── Auth ─────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const { name, email, password } = req.body;
    if (!name||!email||!password) return res.status(400).json({ message: 'All fields required' });
    if (password.length<6) return res.status(400).json({ message: 'Password min 6 chars' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const now=new Date(), cm=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
    await BusinessData.create({ user: user._id, pay: { currentMonth:cm, employees:[], months:{}, compliance:{},
      roles:['Graphic Designer','Meta Ads','Google Ads','Coordinator + QA','Content Strategist & Writer','Developer','Video Editor','Scheduler','HR','Automations','Sales','Videographer','TikTok Ads'],
      depts:['Client Delivery','Development','Automation & Sales','Management','QA','HR'] } });
    res.status(201).json({ _id:user._id, name:user.name, email:user.email, role:user.role, token:genToken(user._id) });
  } catch(e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id:user._id, name:user.name, email:user.email, role:user.role, token:genToken(user._id) });
  } catch(e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json({ _id:req.user._id, name:req.user.name, email:req.user.email, role:req.user.role });
});

// ── Data ─────────────────────────────────────────────────────────────────
app.get('/api/data', protect, async (req, res) => {
  await connectDB();
  try {
    let d = await BusinessData.findOne({ user: req.user._id });
    if (!d) d = await BusinessData.create({ user: req.user._id });
    res.json(d);
  } catch(e) { console.error(e); res.status(500).json({ message: 'Failed to load' }); }
});

app.put('/api/data', protect, async (req, res) => {
  await connectDB();
  try {
    const { cfg,ue,op,pay,biz } = req.body;
    const u = {};
    if (cfg!==undefined) u.cfg=cfg;
    if (ue!==undefined) u.ue=ue;
    if (op!==undefined) u.op=op;
    if (pay!==undefined) u.pay=pay;
    if (biz!==undefined) u.biz=biz;
    const d = await BusinessData.findOneAndUpdate({ user:req.user._id },{ $set:u },{ new:true, upsert:true, runValidators:false });
    res.json({ message:'Saved', updatedAt:d.updatedAt });
  } catch(e) { console.error(e); res.status(500).json({ message: 'Failed to save' }); }
});

app.patch('/api/data/:section', protect, async (req, res) => {
  await connectDB();
  try {
    const { section } = req.params;
    if (!['cfg','ue','op','pay','biz'].includes(section)) return res.status(400).json({ message: 'Invalid section' });
    const d = await BusinessData.findOneAndUpdate({ user:req.user._id },{ $set:{ [section]:req.body } },{ new:true, upsert:true, runValidators:false });
    res.json({ message:'Saved '+section, updatedAt:d.updatedAt });
  } catch(e) { console.error(e); res.status(500).json({ message: 'Failed to save' }); }
});

app.delete('/api/data', protect, async (req, res) => {
  await connectDB();
  try {
    await BusinessData.findOneAndDelete({ user:req.user._id });
    const d = await BusinessData.create({ user:req.user._id });
    res.json({ message:'Reset complete', data:d });
  } catch(e) { console.error(e); res.status(500).json({ message: 'Failed to reset' }); }
});

app.get('/api/health', (req, res) => res.json({ status:'ok', time:new Date().toISOString() }));

module.exports = app;