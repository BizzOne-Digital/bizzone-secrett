const mongoose = require('mongoose');

// Flexible schema — stores all business hub data for a user
// Mirrors the 5 localStorage keys from the original HTML:
//   CFG (settings), UE (unit economics), OP (rate card), PAY (payroll), BIZ (P&L model)

const businessDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // CFG — Settings / exchange rates
  cfg: {
    usdcad: { type: Number, default: 1.38 },
    pkrusd: { type: Number, default: 283 },
    hrs: { type: Number, default: 160 }
  },

  // UE — Unit Economics
  ue: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      price: 0, uprice: 0, upsell: 20, vol: 0, meta: 0, ai: 0, oads: 0,
      overhead: 0, other: 0, cpr: 0, closeRate: 0, goal: 0,
      sales: [{ id: 1, name: 'Sales Rep', cur: 'PKR', salary: 0, comp: 'bonus', bonusPKR: 0, sites: 0 }],
      devs: [{ id: 2, name: 'Developer', cur: 'PKR', salary: 0, comp: 'bonus', bonusPKR: 0, sites: 0 }],
      pms: [{ id: 3, name: 'Project Manager', commPKR: 0, sites: 0 }]
    }
  },

  // OP — Rate Card / Agency operations
  op: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      markup: 50,
      clients: 0,
      roleLoads: {
        'Graphic Designer': 10, 'Meta Ads': 10, 'Google Ads': 10,
        'Coordinator + QA': 10, 'Content Strategist & Writer': 10,
        'Developer': 5, 'Video Editor': 10, 'Scheduler': 10,
        'HR': 20, 'Automations': 15, 'Sales': 20
      },
      svcs: [
        { id: 50, name: 'Social Media Management', roleName: 'Scheduler', markup: null, pt: 'salary' },
        { id: 51, name: 'Website Design & Development', roleName: 'Developer', markup: null, pt: 'salary' },
        { id: 52, name: 'SEO', roleName: 'Content Strategist & Writer', markup: null, pt: 'salary' },
        { id: 53, name: 'Content Strategy', roleName: 'Content Strategist & Writer', markup: null, pt: 'salary' },
        { id: 54, name: 'Graphic Designing', roleName: 'Graphic Designer', markup: null, pt: 'salary' },
        { id: 55, name: 'Google Paid Advertising', roleName: 'Google Ads', markup: null, pt: 'salary' },
        { id: 56, name: 'Meta Paid Advertising', roleName: 'Meta Ads', markup: null, pt: 'salary' },
        { id: 57, name: 'TikTok Paid Advertising', roleName: 'Meta Ads', markup: null, pt: 'salary' },
        { id: 58, name: 'Videography', roleName: '', markup: null, pt: 'hourly', hr: 75, hpc: 3 },
        { id: 59, name: 'Video Editing', roleName: 'Video Editor', markup: null, pt: 'salary' },
        { id: 60, name: 'AI Automation', roleName: 'Automations', markup: null, pt: 'salary' }
      ],
      pkg: {}
    }
  },

  // PAY — Payroll
  pay: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      currentMonth: '',
      employees: [],
      months: {},
      compliance: {},
      roles: [
        'Graphic Designer', 'Meta Ads', 'Google Ads', 'Coordinator + QA',
        'Content Strategist & Writer', 'Developer', 'Video Editor', 'Scheduler',
        'HR', 'Automations', 'Sales', 'Videographer', 'TikTok Ads'
      ],
      depts: ['Client Delivery', 'Development', 'Automation & Sales', 'Management', 'QA', 'HR']
    }
  },

  // BIZ — P&L Model (monthly snapshots + global data)
  biz: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      mkt: [{ label: 'Meta Ads (own)', value: 0, currency: 'USD' }],
      varCosts: [],
      clients: [],
      months: {}
    }
  }

}, { timestamps: true, minimize: false });

module.exports = mongoose.model('BusinessData', businessDataSchema);