import React, { useEffect, useRef, useState } from 'react'
import { loadAllData, saveAllData, resetAllData, logout, getUser } from '../api'

// The original HTML body content (sidebar + main area)
// Injected via innerHTML to preserve exact original structure
function getHtmlContent(userName) {
  return `
<!-- SIDEBAR -->
<aside class="sb">
  <div class="sb-logo">
    <div class="logo">Bizz<span>1</span></div>
    <div class="logo-sub">Business Hub</div>
  </div>
  <nav class="sb-nav">
    <div class="nav-sec">Overview</div>
    <div class="ni on" onclick="goView('ov')"><span class="ico">🏠</span>Home</div>
    <div class="nav-sec">Finance</div>
    <div class="ni" onclick="goView('ue')"><span class="ico">📊</span>Unit Economics</div>
    <div class="ni" onclick="goView('op')"><span class="ico">💼</span>Rate Card</div>
    <div class="ni" onclick="goView('pay')"><span class="ico">👥</span>Payroll</div>
    <div class="nav-sec">Intelligence</div>
    <div class="ni" onclick="goView('ai')"><span class="ico">🤖</span>AI Advisor</div>
    <div class="ni" onclick="goView('biz')"><span class="ico">💰</span>P&amp;L Model</div>
    <div class="nav-sec">System</div>
    <div class="ni" onclick="goView('cfg')"><span class="ico">⚙️</span>Settings</div>
  </nav>
  <div class="sb-bottom">
    <div class="sb-badge" id="sb-badge">● Saved</div>
  </div>
</aside>

<!-- MAIN AREA -->
<div class="main">
  <div class="topbar">
    <span class="tb-title" id="tb-title">Overview</span>
    <div class="tb-right">
      <span class="tb-badge" id="tb-badge">● Saved</span>
      <button class="rst" onclick="doReset()">Reset all</button>
    </div>
  </div>
  <div class="content" id="content">

    <!-- ══ OVERVIEW ══ -->
    <div class="view on" id="view-ov">
      <div class="ov-cards">
        <div class="ovc blue" onclick="goView('ue')">
          <div class="ovc-ico">📊</div><div class="ovc-title">Unit Economics</div>
          <div class="ovc-desc">Website pricing · P&L · Break-even</div>
          <div class="ovc-stats" id="ov-ue"></div><div class="ovc-link">Open →</div>
        </div>
        <div class="ovc green" onclick="goView('op')">
          <div class="ovc-ico">💼</div><div class="ovc-title">Agency Rate Card</div>
          <div class="ovc-desc">Service pricing · Markup · Packages</div>
          <div class="ovc-stats" id="ov-op"></div><div class="ovc-link">Open →</div>
        </div>
        <div class="ovc purple" onclick="goView('pay')">
          <div class="ovc-ico">👥</div><div class="ovc-title">Payroll</div>
          <div class="ovc-desc">Team roster · Salaries · Departments</div>
          <div class="ovc-stats" id="ov-pay"></div><div class="ovc-link">Open →</div>
        </div>
        <div class="ovc pink" onclick="goView('ai')">
          <div class="ovc-ico">🤖</div><div class="ovc-title">AI Advisor</div>
          <div class="ovc-desc">Ask questions about your business data</div>
          <div class="ovc-stats"><div><div class="ovs-v" style="color:var(--pink)">Live</div><div class="ovs-l">Claude-powered</div></div></div>
          <div class="ovc-link">Open →</div>
        </div>
      </div>
      <div class="kpi-row c4" id="ov-kpis"></div>
      <div class="g2">
        <div class="panel"><div class="pt">📊 Website P&L</div><table class="pl-tbl" id="ov-pl"></table></div>
        <div class="panel"><div class="pt">💸 Payroll by Department</div>
          <table class="tbl"><thead><tr><th>Dept</th><th class="r">People</th><th class="r">Total / mo</th></tr></thead><tbody id="ov-pay-body"></tbody></table>
        </div>
      </div>
      <div class="verdict" id="ov-verdict"></div>
    </div>

    <!-- ══ UNIT ECONOMICS ══ -->
    <div class="view" id="view-ue">
      <div style="display:flex;gap:.375rem;margin-bottom:1.25rem;border-bottom:.5px solid var(--bdr2);padding-bottom:.875rem">
        <button class="pay-stab on" id="ue-tab-eco" onclick="ue_setTab('eco')">📊 Economics</button>
        <button class="pay-stab" id="ue-tab-comm" onclick="ue_setTab('comm')">💰 Commission Tracker</button>
      </div>
      <div id="ue-pane-eco">

      <!-- Row 1: Pricing -->
      <div class="cfg-bar">
        <div class="sbox"><div class="sbl">Standard price (CA$)</div><input class="sbi" id="ue-price" type="number" min="0" step="1" value="109"><div class="sbh" id="ue-ph">≈ USD $79</div></div>
        <div class="sbox"><div class="sbl">Upsell price (CA$)</div><input class="sbi" id="ue-uprice" type="number" min="0" step="5" value="207"><div class="sbh" id="ue-uph">≈ USD $150</div></div>
        <div class="sbox"><div class="sbl">Upsell rate</div><div class="rr" style="margin-top:4px"><input type="range" id="ue-usl" min="0" max="60" step="5" value="20"><span class="rv" id="ue-uv">20%</span></div></div>
        <div class="sbox"><div class="sbl">Monthly profit target</div><div style="display:flex;align-items:center;gap:4px;margin-top:2px"><span style="font-family:var(--mono);font-size:11px;color:var(--muted)">CA$</span><input class="sbi" id="ue-goal" type="number" min="0" step="100" value="2000"></div><div class="sbh" id="ue-goal-out" style="color:var(--accent)">calculating…</div></div>
      </div>

      <!-- Row 2: Meta funnel — the missing piece -->
      <div style="background:var(--surf2);border:.5px solid var(--abdr);border-radius:8px;padding:.875rem 1rem;margin-bottom:1.25rem">
        <div style="font-family:var(--mono);font-size:10px;color:var(--accent);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.875rem">📢 Meta Ads Lead Funnel — how your spend turns into sales</div>
        <div class="cfg-bar" style="margin-bottom:0">
          <div class="sbox" style="background:var(--surf3)">
            <div class="sbl">Daily ad spend (CA$)</div>
            <input class="sbi" id="ue-meta" type="number" min="10" step="5" value="83">
            <div class="sbh" id="ue-mh">CA$2,490/mo</div>
          </div>
          <div class="sbox" style="background:var(--surf3)">
            <div class="sbl">CPR — cost per lead (CA$)</div>
            <input class="sbi" id="ue-cpr" type="number" min="1" step="1" value="60">
            <div class="sbh" id="ue-cpr-h">Leads/mo: <span id="ue-leads-mo">~42</span></div>
          </div>
          <div class="sbox" style="background:var(--surf3)">
            <div class="sbl">Lead close rate (%)</div>
            <input class="sbi" id="ue-close" type="number" min="1" max="100" step="1" value="70">
            <div class="sbh" id="ue-close-h">Expected closes: <span id="ue-exp-closes" style="color:var(--accent)">~29</span>/mo</div>
          </div>
          <div class="sbox" style="background:var(--surf3);border-color:var(--accent)">
            <div class="sbl" style="color:var(--accent)">Websites closed this month</div>
            <div class="rr" style="margin-top:4px"><input type="range" id="ue-vsl" min="0" max="300" step="1" value="30"><span class="rv" id="ue-vv">30</span></div>
            <div class="sbh">≈ <span id="ue-pd">1.0</span>/day · <span style="color:var(--dim)">funnel estimate: <span id="ue-exp-closes-hint">—</span></span></div>
          </div>
        </div>
      </div>

      <!-- Row 3: Costs -->
      <div class="cfg-bar">
        <div class="sbox"><div class="sbl">Other ads / mo (CA$)</div><input class="sbi" id="ue-oads" type="number" min="0" step="10" value="0"><div class="sbh">Google, TikTok, SEO…</div></div>
        <div class="sbox"><div class="sbl">AI tools / mo (CA$)</div><input class="sbi" id="ue-ai" type="number" min="0" step="5" value="69"><div class="sbh">Kiro, Claude, etc.</div></div>
        <div class="sbox"><div class="sbl">Software / overhead / mo (CA$)</div><input class="sbi" id="ue-overhead" type="number" min="0" step="10" value="0"><div class="sbh">GHL, subscriptions, etc.</div></div>
        <div class="sbox"><div class="sbl">Other fixed costs / mo (CA$)</div><input class="sbi" id="ue-other" type="number" min="0" step="10" value="0"><div class="sbh">Rent, phone, misc.</div></div>
      </div>
      <div class="kpi-row c5" id="ue-kpis"></div>
      <div class="g2">
        <div>
          <div class="panel">
            <div class="pt">👥 Team</div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Sales</div>
            <div id="ue-sales"></div>
            <button class="add-btn" onclick="ue_add('sales')" style="width:100%;margin-top:.5rem;padding:5px;justify-content:center;display:flex">+ Sales Member</button>
            <div style="height:.75rem"></div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Development</div>
            <div id="ue-devs"></div>
            <button class="add-btn" onclick="ue_add('dev')" style="width:100%;margin-top:.5rem;padding:5px;justify-content:center;display:flex">+ Developer</button>
          </div>
        </div>
        <div>
          <div class="panel"><div class="pt">📊 P&L <span id="ue-pl-n" style="font-weight:400;color:var(--dim);font-size:9px;margin-left:4px"></span></div><table class="pl-tbl" id="ue-pl"></table></div>
          <div class="panel" style="margin-top:1rem"><div class="pt">📈 Volume Sensitivity</div>
            <table class="stbl"><thead><tr><th>Sites/mo</th><th>Revenue</th><th>Costs</th><th>Net</th><th>Margin</th></tr></thead><tbody id="ue-sens"></tbody></table>
          </div>
          <div class="verdict" id="ue-verdict" style="margin-top:1rem"></div>
        </div>
      </div>
      </div><!-- /ue-pane-eco -->

      <!-- ══ COMMISSION TRACKER PANE ══ -->
      <div id="ue-pane-comm" style="display:none">
        <div class="kpi-row c4" id="ue-comm-kpis" style="margin-bottom:1.25rem"></div>
        <div class="g3">
          <div class="panel">
            <div class="pt">🎯 Sales</div>
            <div style="font-size:11px;color:var(--dim);margin-bottom:.875rem">Closes the deal — variable commission per website. Track each rep's monthly closes.</div>
            <div id="ue-comm-sales"></div>
            <button class="add-btn" onclick="ue_add('sales')" style="width:100%;margin-top:.75rem;padding:6px;justify-content:center;display:flex">+ Sales Member</button>
          </div>
          <div class="panel">
            <div class="pt">📋 Project Management</div>
            <div style="font-size:11px;color:var(--dim);margin-bottom:.875rem">Manages GHL pipeline &amp; client comms — commission per website delivered.</div>
            <div id="ue-comm-pms"></div>
            <button class="add-btn" onclick="ue_add('pm')" style="width:100%;margin-top:.75rem;padding:6px;justify-content:center;display:flex">+ Project Manager</button>
          </div>
          <div class="panel">
            <div class="pt">⚙️ Development</div>
            <div style="font-size:11px;color:var(--dim);margin-bottom:.875rem">Builds &amp; delivers the website — commission per website completed.</div>
            <div id="ue-comm-devs"></div>
            <button class="add-btn" onclick="ue_add('dev')" style="width:100%;margin-top:.75rem;padding:6px;justify-content:center;display:flex">+ Developer</button>
          </div>
        </div>
      </div><!-- /ue-pane-comm -->
    </div>

    <!-- ══ RATE CARD ══ -->
    <div class="view" id="view-op">
      <div class="cfg-bar">
        <div class="sbox"><div class="sbl">Default markup %</div><div class="rr" style="margin-top:4px"><input type="range" id="op-msl" min="0" max="200" step="5" value="50"><span class="rv" id="op-mv">50%</span></div><div class="sbh">Cost × (1+markup) = price</div></div>
        <div class="sbox"><div class="sbl">Effective margin</div><div class="rv" id="op-em" style="font-size:16px;margin-top:3px">33.3%</div><div class="sbh">Profit ÷ revenue</div></div>
        <div class="sbox"><div class="sbl">Active projects / mo</div><input class="sbi" id="op-clients" type="number" min="1" step="1" value="10"><div class="sbh">Spreads overhead cost per project</div></div>
        <div class="sbox"><div class="sbl">Working hrs/person/mo</div><input class="sbi" id="op-hrs" type="number" min="1" step="1" value="160"></div>
      </div>
      <div class="kpi-row c4" id="op-kpis"></div>

      <!-- Team section — no more manual entry, reads from Payroll -->
      <div class="sh">
        <span class="st">👥 Team Capacity
          <span style="font-family:var(--sans);font-weight:400;font-size:10px;color:var(--green);margin-left:6px;letter-spacing:0">● live from Payroll</span>
        </span>
        <button class="add-btn" style="background:var(--gbg);color:var(--green);border-color:var(--gbdr)" onclick="goView('pay')">Add / edit staff in Payroll →</button>
      </div>
      <div class="info-box" style="margin-bottom:.75rem">
        Employee salaries come directly from the <strong>Payroll tab</strong>. The only thing to set here is <strong>Sites / person / mo</strong> — how many website projects one person in that role can deliver per month. Cost per project updates automatically.
      </div>
      <div class="panel" style="padding:0;overflow:hidden;margin-bottom:1rem">
        <table class="rc">
          <thead id="rc-rates-head"></thead>
          <tbody id="op-rates"></tbody>
        </table>
      </div>
      <div class="sh"><span class="st">📋 Services & Markup</span><button class="add-btn" onclick="op_addSvc()">+ Add Service</button></div>
      <div class="info-box">
        <strong>Markup:</strong> &nbsp;<code>Price = Cost × (1 + markup%)</code> &nbsp;·&nbsp; 50% markup on CA$100 = CA$150 (33% margin). Leave markup blank to use default.
      </div>
      <div class="panel" style="padding:0;overflow:hidden;margin-bottom:1rem">
        <table class="rc"><thead id="op-svcs-head"></thead><tbody id="op-svcs"></tbody></table>
      </div>
      <div class="g2">
        <div class="panel">
          <div class="pt">📦 Package Builder</div>
          <div id="op-pkg"></div>
          <div class="pkg-tots">
            <div class="pkg-tr"><span class="pkg-tl">Cost to deliver</span><span class="pkg-tv" style="color:var(--muted)" id="op-pc">CA$0</span></div>
            <div class="pkg-tr"><span class="pkg-tl">Your price</span><span class="pkg-tv" style="color:var(--green)" id="op-pp">CA$0</span></div>
            <div class="pkg-tr"><span class="pkg-tl">Profit/client/mo</span><span class="pkg-tv" style="color:var(--accent)" id="op-ppr">CA$0</span></div>
          </div>
        </div>
        <div class="panel"><div class="pt">💸 Payroll by Dept</div><table class="tbl" id="op-pay"></table></div>
      </div>

      <!-- ══ CAPACITY HEALTH ══ -->
      <div class="panel" style="margin-top:1rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.875rem;flex-wrap:wrap;gap:.5rem">
          <div>
            <div class="pt" style="margin-bottom:3px">🚦 Capacity Health &amp; Hire Triggers</div>
            <div style="font-size:11px;color:var(--dim)">When to add headcount per role — Development &amp; QA measured against websites/mo (Unit Economics); all others against active projects/mo (above).</div>
          </div>
        </div>
        <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
          <span style="font-size:11px;padding:2px 9px;border-radius:10px;border:.5px solid var(--gbdr);background:var(--gbg);color:var(--green);font-family:var(--mono)">🟢 &lt;75% — Comfortable</span>
          <span style="font-size:11px;padding:2px 9px;border-radius:10px;border:.5px solid var(--abdr);background:var(--abg);color:var(--accent);font-family:var(--mono)">🟡 75–90% — Plan hire now</span>
          <span style="font-size:11px;padding:2px 9px;border-radius:10px;border:.5px solid rgba(239,68,68,.3);background:var(--rbg);color:var(--red);font-family:var(--mono)">🔴 &gt;90% — Hire immediately</span>
        </div>
        <div id="cap-health-cards"></div>
      </div>
    </div>

    <!-- ══ PAYROLL ══ -->
    <div class="view" id="view-pay">
      <datalist id="pay-roles-dl">
        <option value="Graphic Designer"><option value="Meta Ads"><option value="Google Ads">
        <option value="Coordinator + QA"><option value="Content Strategist & Writer">
        <option value="Developer"><option value="Video Editor"><option value="Scheduler">
        <option value="HR"><option value="Automations"><option value="Sales">
        <option value="Account Manager"><option value="SEO Specialist"><option value="Copywriter">
      </datalist>

      <!-- Month navigation — always visible -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
        <div style="display:flex;align-items:center;gap:.625rem">
          <button onclick="pay_changeMonth(-1)" style="background:var(--surf);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 12px;color:var(--muted);cursor:pointer;font-size:14px">←</button>
          <div style="background:var(--surf);border:.5px solid var(--bdr2);border-radius:7px;padding:.375rem .875rem;min-width:150px;text-align:center">
            <div style="font-family:var(--mono);font-size:14px;font-weight:500;color:var(--text)" id="pay-month-label">May 2026</div>
            <div style="font-size:10px;color:var(--dim)" id="pay-month-status">0 of 26 marked paid</div>
          </div>
          <button onclick="pay_changeMonth(1)" style="background:var(--surf);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 12px;color:var(--muted);cursor:pointer;font-size:14px">→</button>
          <button onclick="pay_copyPrev()" style="font-size:11px;color:var(--blue);background:var(--bbg);border:.5px solid rgba(59,130,246,.25);border-radius:5px;padding:4px 10px;cursor:pointer;font-family:var(--sans)">Copy prev month</button>
          <button onclick="pay_markAllPaid()" style="font-size:11px;color:var(--green);background:var(--gbg);border:.5px solid var(--gbdr);border-radius:5px;padding:4px 10px;cursor:pointer;font-family:var(--sans)">Mark all paid</button>
        </div>
        <div style="display:flex;gap:.5rem;align-items:center">
          <input id="pay-search" type="text" placeholder="Search employee…" style="background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:4px 10px;color:var(--text);font-family:var(--sans);font-size:12px;outline:none;width:155px">
          <button class="add-btn" onclick="pay_add()">+ Employee</button>
          <button onclick="pay_toggleRDS()" style="font-size:12px;background:var(--surf2);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:4px 10px;cursor:pointer;font-family:var(--sans)">⚙ Roles &amp; Depts</button>
        </div>
      </div>

      <!-- Add Employee Panel (hidden by default) -->
      <div id="pay-add-panel" style="display:none;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1rem">
        <div style="font-family:var(--mono);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:.875rem">Add New Employee</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:.75rem;align-items:end">
          <div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500">Full Name *</div>
            <input id="pay-new-name" type="text" placeholder="e.g. Ahmed Ali" onkeydown="if(event.key==='Enter')pay_addConfirm()" style="width:100%;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none">
          </div>
          <div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500">Role</div>
            <input id="pay-new-role-field" type="text" list="pay-roles-dl" placeholder="e.g. Graphic Designer" style="width:100%;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none">
          </div>
          <div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500">Department</div>
            <select id="pay-new-dept" style="width:100%;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none"></select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500">Base Salary (PKR)</div>
            <input id="pay-new-salary" type="number" min="0" step="500" placeholder="e.g. 35000" onkeydown="if(event.key==='Enter')pay_addConfirm()" style="width:100%;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none">
          </div>
          <div style="display:flex;gap:.375rem">
            <button onclick="pay_addConfirm()" style="background:var(--accent);color:#000;border:none;border-radius:5px;padding:8px 16px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:700;white-space:nowrap">Add ✓</button>
            <button onclick="pay_addCancel()" style="background:var(--surf);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:8px 12px;cursor:pointer;font-family:var(--sans);font-size:13px">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Roles & Depts Manager (hidden by default) -->
      <div id="pay-rds-panel" style="display:none;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1rem">
        <div id="pay-rds-body"></div>
      </div>

      <!-- KPIs — always visible -->
      <div class="kpi-row c5" id="pay-kpis"></div>

      <!-- Sub-tab navigation -->
      <div style="display:flex;gap:.375rem;margin-bottom:1rem;border-bottom:.5px solid var(--bdr2);padding-bottom:.875rem">
        <button class="pay-stab on" onclick="pay_switchTab('roster')">👥 Roster</button>
        <button class="pay-stab" onclick="pay_switchTab('capacity')">📊 Capacity</button>
        <button class="pay-stab" onclick="pay_switchTab('compliance')">🔒 Compliance</button>
      </div>

      <!-- ═══ SUB-TAB: ROSTER ═══ -->
      <div id="pay-subtab-roster">
        <!-- Payment status filter -->
        <div style="display:flex;gap:.375rem;margin-bottom:.875rem;align-items:center;flex-wrap:wrap;padding:.625rem .875rem;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:7px">
          <span style="font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-family:var(--mono)">Payment:</span>
          <button class="pay-pf-btn on-all" data-pf="all" onclick="pay_setPayFilter('all')">All</button>
          <button class="pay-pf-btn" data-pf="paid" onclick="pay_setPayFilter('paid')">✓ Paid</button>
          <button class="pay-pf-btn" data-pf="pending" onclick="pay_setPayFilter('pending')">⏳ Pending</button>
          <button class="pay-pf-btn" data-pf="overdue" onclick="pay_setPayFilter('overdue')">🔴 Overdue</button>
          <span id="pay-filter-count" style="margin-left:auto;font-size:11px;color:var(--dim);font-family:var(--mono)"></span>
        </div>
        <div style="overflow-x:auto;margin-bottom:1rem">
          <div class="panel" style="padding:0;min-width:700px">
            <table class="pay-tbl" style="width:100%" id="pay-table">
              <thead id="pay-thead"></thead>
              <tbody id="pay-body"></tbody>
              <tfoot><tr id="pay-foot"></tr></tfoot>
            </table>
          </div>
        </div>
        <div class="g3">
          <div class="panel"><div class="pt">📋 By Role</div><table class="tbl" id="pay-by-role"></table></div>
          <div class="panel"><div class="pt">🏢 By Department</div><table class="tbl" id="pay-by-dept"></table></div>
          <div class="panel"><div class="pt">📅 Year — <span id="pay-year-label" style="color:var(--accent);font-family:var(--mono)">2026</span></div><table class="tbl" id="pay-year"></table></div>
        </div>
      </div>

      <!-- ═══ SUB-TAB: CAPACITY ═══ -->
      <div id="pay-subtab-capacity" style="display:none">
        <!-- Filters -->
        <div style="display:flex;gap:.625rem;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
          <div style="font-size:12px;color:var(--muted);font-weight:500">Filter:</div>
          <select id="cap-filter-role" onchange="pay_renderCapacity()" style="background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 10px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none">
            <option value="">All Roles</option>
          </select>
          <select id="cap-filter-dept" onchange="pay_renderCapacity()" style="background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 10px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none">
            <option value="">All Departments</option>
          </select>
          <div style="display:flex;align-items:center;gap:.375rem">
            <span style="font-size:12px;color:var(--muted)">Min clients/person:</span>
            <input id="cap-filter-min" type="number" min="0" max="50" value="0" onchange="pay_renderCapacity()" style="width:60px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;text-align:right">
          </div>
          <label style="display:flex;align-items:center;gap:5px;cursor:pointer;margin-left:auto">
            <input type="checkbox" id="cap-filter-billable" checked onchange="pay_renderCapacity()" style="accent-color:var(--accent);width:13px;height:13px">
            <span style="font-size:12px;color:var(--muted)">Client-facing only</span>
          </label>
          <div style="font-size:11px;color:var(--dim)">Edit Clients/person to update Rate Card pricing</div>
        </div>
        <div class="kpi-row c4" id="cap-kpis"></div>
        <div class="panel" style="padding:0;overflow:hidden">
          <table class="tbl" style="width:100%">
            <thead><tr>
              <th style="min-width:160px">Employee</th>
              <th style="min-width:150px">Role</th>
              <th style="min-width:110px">Department</th>
              <th class="r" style="min-width:110px">Clients / Person</th>
              <th class="r" style="min-width:90px">Cost / Client</th>
              <th class="r" style="min-width:100px">Monthly Cost</th>
              <th class="r" style="min-width:80px">CA$ / mo</th>
            </tr></thead>
            <tbody id="cap-body"></tbody>
            <tfoot><tr id="cap-foot"></tr></tfoot>
          </table>
        </div>
      </div>

      <!-- ═══ SUB-TAB: COMPLIANCE ═══ -->
      <div id="pay-subtab-compliance" style="display:none">
        <!-- Compliance filters -->
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;align-items:center">
          <div style="font-size:12px;color:var(--muted);font-weight:500">Filter:</div>
          <button class="pay-comp-filter on" onclick="pay_filterComp('all')" style="font-size:12px;background:var(--abg);color:var(--accent);border:.5px solid var(--abdr);border-radius:5px;padding:4px 12px;cursor:pointer;font-family:var(--sans)">All</button>
          <button class="pay-comp-filter" onclick="pay_filterComp('warning')" style="font-size:12px;background:var(--surf2);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:4px 12px;cursor:pointer;font-family:var(--sans)">⚠ Warning</button>
          <button class="pay-comp-filter" onclick="pay_filterComp('atrisk')" style="font-size:12px;background:var(--surf2);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:4px 12px;cursor:pointer;font-family:var(--sans)">🔴 At-Risk</button>
          <button class="pay-comp-filter" onclick="pay_filterComp('replacement')" style="font-size:12px;background:var(--surf2);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:4px 12px;cursor:pointer;font-family:var(--sans)">🚨 Replacement</button>
          <button class="pay-comp-filter" onclick="pay_filterComp('clean')" style="font-size:12px;background:var(--surf2);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:4px 12px;cursor:pointer;font-family:var(--sans)">✓ Clean</button>
          <div style="margin-left:auto;font-size:11px;color:var(--dim)">1st warning · 2nd deduction · 3rd formal · 4th replacement</div>
        </div>
        <div class="kpi-row c5" id="pay-comp-kpis" style="margin-bottom:1rem"></div>
        <div class="panel" style="padding:0;overflow:hidden">
          <table class="pay-tbl" style="width:100%">
            <thead><tr>
              <th style="min-width:130px">Employee</th>
              <th style="min-width:130px">Role</th>
              <th style="min-width:90px">Dept</th>
              <th style="min-width:110px">Status</th>
              <th class="r" style="min-width:55px">Count</th>
              <th>Violations</th>
              <th style="min-width:110px">Action</th>
            </tr></thead>
            <tbody id="pay-comp-body"></tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ══ AI ADVISOR ══ -->
    <div class="view" id="view-ai">
      <div class="g2" style="margin-bottom:1rem">
        <div>
          <div class="panel" style="margin-bottom:.75rem">
            <div class="pt">💡 Suggested Questions</div>
            <div class="suggestions" id="ai-suggs"></div>
          </div>
          <div class="panel">
            <div class="pt">📡 Live Data Context</div>
            <div style="font-size:11px;color:var(--muted);line-height:1.8" id="ai-ctx-summary"></div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column">
          <div class="panel" style="flex:1;display:flex;flex-direction:column;padding:0;overflow:hidden">
            <div style="padding:.625rem 1rem;border-bottom:.5px solid var(--bdr)"><div class="pt" style="margin-bottom:0">🤖 AI Business Advisor</div></div>
            <div class="chat-msgs" id="ai-msgs"></div>
            <div class="chat-footer">
              <button class="chat-clear" onclick="ai_clear()">Clear</button>
              <textarea class="chat-input" id="ai-input" placeholder="Ask about pricing, profitability, team costs…" rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();ai_send()}"></textarea>
              <button class="send-btn" id="ai-send-btn" onclick="ai_send()">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ P&L MODEL ══ -->
    <div class="view" id="view-biz">
      <div class="biz-month-bar">
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Month</div>
        <input type="month" class="biz-month-pick" id="biz-month" value="2026-05">
        <div style="font-size:11px;color:var(--dim)">Each month saves separately · retainer roster & costs are global</div>
        <button onclick="bizExportPDF()" style="margin-left:auto;font-size:11px;color:var(--muted);background:var(--surf2);border:.5px solid var(--bdr2);border-radius:6px;padding:4px 12px;cursor:pointer;font-family:var(--sans)">↓ PDF</button>
      </div>

      <div class="bkpi-strip" id="biz-kpi-strip"></div>

      <div class="bslabel">Revenue streams</div>
      <div class="biz-two-col">
        <div class="bcard">
          <div class="bcard-title">
            <div class="bcard-title-left"><span class="bcard-dot" style="background:#4aadff"></span>Websites & Retainers</div>
            <div class="bcard-total" id="biz-rev-total">CA$0</div>
          </div>
          <div class="bsubsection">Website sales</div>
          <div class="birow">
            <span class="birow-label">Standard (CA$<input class="bnum-input sm" type="number" id="biz-ws-price" value="109" min="0">)</span>
            <input class="bnum-input sm" type="number" id="biz-ws-qty" value="0" min="0">
            <span style="font-size:11px;color:var(--dim)">closes</span>
            <span class="birow-eq" id="biz-ws-total">CA$0</span>
          </div>
          <div class="birow">
            <span class="birow-label">Upsell (CA$<input class="bnum-input sm" type="number" id="biz-wu-price" value="207" min="0">)</span>
            <input class="bnum-input sm" type="number" id="biz-wu-qty" value="0" min="0">
            <span style="font-size:11px;color:var(--dim)">closes</span>
            <span class="birow-eq" id="biz-wu-total">CA$0</span>
          </div>
          <div class="bsubsection">Retainer clients <span id="biz-ret-badge"></span></div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:.5rem;line-height:1.5">Each client has their own monthly price. These carry over every month.</div>
          <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:4px;padding:.2rem 0 .3rem;border-bottom:.5px solid var(--bdr2);margin-bottom:.2rem">
            <span style="font-size:10px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.05em">Client</span>
            <span style="font-size:10px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.05em">Curr</span>
            <span style="font-size:10px;font-weight:600;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;text-align:right;min-width:90px">Monthly</span>
            <span></span>
          </div>
          <div id="biz-client-rows"></div>
          <button class="badd-row-btn" onclick="bAddClientRow()">+ Add retainer client</button>
          <div class="birow" style="margin-top:.5rem">
            <span class="birow-label">New retainer clients added this month</span>
            <input class="bnum-input sm" type="number" id="biz-ret-new" value="0" min="0">
            <span class="birow-eq" style="font-size:10px">for CAC</span>
          </div>
        </div>
        <div class="bcard">
          <div class="bcard-title">
            <div class="bcard-title-left"><span class="bcard-dot" style="background:#a78bfa"></span>Extra / One-time Income</div>
            <div class="bcard-total" id="biz-proj-total">CA$0</div>
          </div>
          <p style="font-size:11px;color:var(--dim);margin-bottom:.75rem;line-height:1.6">One-time jobs this month — custom builds, brand kits, rush design, one-off campaigns. Resets each month.</p>
          <div id="biz-proj-rows"></div>
          <button class="badd-row-btn" onclick="bAddProjRow()">+ Add extra income</button>
        </div>
      </div>

      <div class="bslabel">Costs</div>
      <div class="biz-three-col">
        <div class="bcard">
          <div class="bcard-title">
            <div class="bcard-title-left"><span class="bcard-dot" style="background:#f0ab38"></span>Cost summaries</div>
            <div class="bcard-total" id="biz-fixed-total">CA$0</div>
          </div>
          <p style="font-size:11px;color:var(--dim);margin-bottom:.875rem;line-height:1.5">Pull totals from the Payroll tab. All CA$.</p>
          <div class="birow"><span class="birow-label bold">Team payroll</span><span style="font-size:11px;color:var(--dim)">CA$</span><input class="bnum-input" type="number" id="biz-payroll" value="0" min="0"></div>
          <div class="birow"><span class="birow-label bold">Subscriptions & tools</span><span style="font-size:11px;color:var(--dim)">CA$</span><input class="bnum-input" type="number" id="biz-subs" value="0" min="0"></div>
          <div class="birow" style="border-bottom:none"><span class="birow-label bold">Videographer</span><span style="font-size:11px;color:var(--dim)">CA$</span><input class="bnum-input" type="number" id="biz-vid" value="0" min="0"></div>
        </div>
        <div class="bcard">
          <div class="bcard-title">
            <div class="bcard-title-left"><span class="bcard-dot" style="background:#00c9b1"></span>Marketing spend</div>
            <div class="bcard-total" id="biz-mkt-total">CA$0</div>
          </div>
          <div id="biz-mkt-rows"></div>
          <button class="badd-row-btn" onclick="bAddCostRow('biz-mkt')">+ Add channel</button>
          <div class="birow" style="margin-top:.5rem;padding-top:.5rem;border-top:.5px solid var(--bdr)">
            <span class="birow-label" style="font-size:11px;color:var(--dim)">New clients from ads this month</span>
            <input class="bnum-input sm" type="number" id="biz-new-clients" value="30" min="1">
          </div>
        </div>
        <div class="bcard">
          <div class="bcard-title">
            <div class="bcard-title-left"><span class="bcard-dot" style="background:#ff7c40"></span>Other costs</div>
            <div class="bcard-total" id="biz-var-total">CA$0</div>
          </div>
          <div id="biz-var-rows"></div>
          <button class="badd-row-btn" onclick="bAddCostRow('biz-var')">+ Add other cost</button>
        </div>
      </div>

      <div class="bslabel">CAC & lifetime value</div>
      <div class="biz-two-col" style="margin-bottom:14px">
        <div class="bmetric-card">
          <div class="bmetric-hdr">Customer Acquisition Cost</div>
          <div class="bmetric-big c-amber" id="biz-cac-val">CA$0</div>
          <div class="bmetric-sub" id="biz-cac-sub">per new client</div>
          <div class="bmetric-breakdown">
            <div class="bmb-row"><span class="bmb-label">Total marketing spend</span><span class="bmb-val c-amber" id="biz-cac-spend">CA$0</span></div>
            <div class="bmb-row"><span class="bmb-label">New clients this month</span><span class="bmb-val" id="biz-cac-clients">0</span></div>
            <div class="bmb-row"><span class="bmb-label">Website CAC</span><span class="bmb-val" id="biz-cac-web">CA$0</span></div>
            <div class="bmb-row"><span class="bmb-label">Retainer CAC</span><span class="bmb-val" id="biz-cac-ret">—</span></div>
          </div>
          <div class="binsight" id="biz-cac-insight"></div>
        </div>
        <div class="bmetric-card">
          <div class="bmetric-hdr">Lifetime Value (LTV)</div>
          <div class="bmetric-big c-teal" id="biz-ltv-val">CA$0</div>
          <div class="bmetric-sub">blended LTV per acquired client</div>
          <div class="bslider-row"><div class="bslider-top"><span class="bslider-lbl">Avg retainer retention</span><span class="bslider-val" id="biz-ret-months-lbl">12 months</span></div><input type="range" id="biz-ret-months" min="1" max="36" step="1" value="12"></div>
          <div class="bslider-row"><div class="bslider-top"><span class="bslider-lbl">Website → retainer conversion</span><span class="bslider-val" id="biz-conv-lbl">20%</span></div><input type="range" id="biz-conv" min="0" max="80" step="5" value="20"></div>
          <div class="bslider-row" style="border-bottom:none"><div class="bslider-top"><span class="bslider-lbl">Retainer churn / month</span><span class="bslider-val" id="biz-churn-lbl">10%</span></div><input type="range" id="biz-churn" min="0" max="50" step="5" value="10"></div>
        </div>
      </div>

      <div class="bmetric-card" style="margin-bottom:14px">
        <div class="bmetric-hdr">LTV : CAC Ratio — the single most important number</div>
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:2rem;align-items:center">
          <div><div class="bratio-badge" id="biz-ratio-badge">0:1</div><div class="bratio-zone" id="biz-ratio-zone"></div><div style="font-size:11px;color:var(--dim);margin-top:4px">Target: 3:1 or higher</div></div>
          <div>
            <div class="bgauge-wrap"><div class="bgauge-track"><div class="bgauge-marker" id="biz-gauge-marker" style="left:0%"></div></div><div class="bgauge-labels"><span>0</span><span>1:1</span><span>3:1</span><span>5:1</span><span>10:1+</span></div></div>
            <div class="bmetric-breakdown" style="margin-top:.75rem">
              <div class="bmb-row"><span class="bmb-label">Website-only LTV</span><span class="bmb-val c-blue" id="biz-ltv-web">CA$0</span></div>
              <div class="bmb-row"><span class="bmb-label">Retainer client LTV</span><span class="bmb-val c-teal" id="biz-ltv-ret">CA$0</span></div>
              <div class="bmb-row"><span class="bmb-label">Blended LTV</span><span class="bmb-val" id="biz-ltv-blended">CA$0</span></div>
            </div>
            <div class="binsight" id="biz-ratio-insight"></div>
          </div>
        </div>
      </div>

      <div class="bslabel">Revenue breakdown & unit economics</div>
      <div class="bcard" style="margin-bottom:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem">
          <div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--dim);margin-bottom:.75rem">Revenue contribution</div><div id="biz-svc-bars"></div></div>
          <div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--dim);margin-bottom:.75rem">Per-client margin</div><div id="biz-unit-econ"></div></div>
        </div>
      </div>

      <div class="bverdict" id="biz-verdict"></div>
      <div style="margin-top:1.5rem;padding-top:.875rem;border-top:.5px solid var(--bdr);font-size:11px;color:var(--dim);display:flex;justify-content:space-between">
        <span>Auto-saved · each month stored separately</span>
        <span id="biz-footer-r"></span>
      </div>
    </div>

    <!-- ══ SETTINGS ══ -->
    <div class="view" id="view-cfg">
      <div class="g3">
        <div class="panel">
          <div class="pt">💱 Exchange Rates</div>
          <div style="margin-bottom:.75rem"><div class="lbl">USD → CAD</div><input class="num-in" id="cfg-usdcad" type="number" min="1" step="0.01" value="1.38"></div>
          <div><div class="lbl">PKR per 1 USD</div><input class="num-in" id="cfg-pkrusd" type="number" min="1" step="1" value="283"><div class="hint" id="cfg-pkr-hint">1 CAD ≈ 205 PKR</div></div>
        </div>
        <div class="panel">
          <div class="pt">⏰ Work Schedule</div>
          <div class="lbl">Working hours / person / month</div>
          <input class="num-in" id="cfg-hrs" type="number" min="1" step="1" value="160">
          <div class="hint">Standard = 160 (8h × 5d × 4wk)</div>
        </div>
        <div class="panel">
          <div class="pt">📌 About this Hub</div>
          <div style="font-size:11.5px;color:var(--muted);line-height:1.8">
            All dashboards share exchange rates from Settings. Data auto-saves in your browser.<br><br>
            <strong style="color:var(--text)">Unit Economics</strong> — website pricing P&L<br>
            <strong style="color:var(--text)">Rate Card</strong> — service cost & markup pricing<br>
            <strong style="color:var(--text)">Payroll</strong> — full employee roster & salary tracking<br>
            <strong style="color:var(--text)">AI Advisor</strong> — Claude reads all your data live
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
<div class="biz-toast" id="biz-toast">✓ Saved</div>
`;
}

export default function Dashboard({ user, onLogout }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      try {
        // 1. Load data from API
        const serverData = await loadAllData()

        // 2. Inject HTML into the container (which is always mounted)
        containerRef.current.innerHTML = getHtmlContent(user?.name || 'User')

        // 3. Add user info to topbar
        const tbRight = containerRef.current.querySelector('.tb-right')
        if (tbRight) {
          const userBar = document.createElement('div')
          userBar.className = 'login-user-bar'
          userBar.innerHTML = `<span class="login-user-name">${esc(user?.name || '')}</span><button class="login-logout-btn" id="logout-btn">Logout</button>`
          tbRight.prepend(userBar)
          document.getElementById('logout-btn')?.addEventListener('click', () => {
            logout()
            onLogout()
          })
        }

        // 4. Run the original panel logic with API data
        runPanelLogic(serverData)

        setLoading(false)
      } catch (err) {
        console.error('Init error:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    init()
  }, [])

  // Error screen
  if (error) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-error">{error}</div>
          <button className="login-btn" onClick={() => { logout(); onLogout() }}>Back to Login</button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Loading overlay — shown on top while data loads */}
      {loading && (
        <div className="login-page" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="login-logo">Bizz<span>1</span></div>
            <div style={{ color: 'var(--muted)', marginTop: '1rem', fontSize: '14px' }}>Loading your data…</div>
          </div>
        </div>
      )}
      {/* Container div — ALWAYS mounted so innerHTML works before loading finishes */}
      <div ref={containerRef} />
    </>
  )
}

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

// ═══════════════════════════════════════════════════════════════════════════
// ALL ORIGINAL PANEL LOGIC — adapted for API persistence
// ═══════════════════════════════════════════════════════════════════════════
function runPanelLogic(serverData) {

// ── In-memory localStorage replacement with auto API sync ────────────────
// Every _ls.set() triggers a debounced sync to MongoDB.
var _store = {};
var _apiSyncTimer = null;

function _syncToAPI() {
  clearTimeout(_apiSyncTimer);
  _apiSyncTimer = setTimeout(function() {
    var payload = {};
    try { if(_store['b1cfg2']) payload.cfg = JSON.parse(_store['b1cfg2']); } catch(e) {}
    try { if(_store['b1ue2']) payload.ue = JSON.parse(_store['b1ue2']); } catch(e) {}
    try { if(_store['b1op2']) payload.op = JSON.parse(_store['b1op2']); } catch(e) {}
    try { if(_store['b1pay2']) payload.pay = JSON.parse(_store['b1pay2']); } catch(e) {}
    try { if(_store['b1_biz_v1']) payload.biz = JSON.parse(_store['b1_biz_v1']); } catch(e) {}

    var token = localStorage.getItem('bizz1_token');
    if (!token) return;

    fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload)
    }).then(function(res) {
      if (res.ok) {
        ['tb-badge','sb-badge'].forEach(function(id){
          var b=document.getElementById(id);
          if(b){b.className=b.className.replace('saving','');b.textContent='● Synced';}
        });
      } else {
        console.error('API save status:', res.status);
      }
    }).catch(function(err) {
      console.error('API sync error:', err);
    });
  }, 1200);
}

var _ls = {
  get: function(k) { return _store[k] !== undefined ? _store[k] : null; },
  set: function(k, v) { _store[k] = v; _syncToAPI(); },
  rm: function(k) { delete _store[k]; }
};

// Pre-populate in-memory store from server data
if (serverData) {
  if (serverData.cfg) _store['b1cfg2'] = JSON.stringify(serverData.cfg);
  if (serverData.ue) _store['b1ue2'] = JSON.stringify(serverData.ue);
  if (serverData.op) _store['b1op2'] = JSON.stringify(serverData.op);
  if (serverData.pay) _store['b1pay2'] = JSON.stringify(serverData.pay);
  if (serverData.biz) _store['b1_biz_v1'] = JSON.stringify(serverData.biz);
}


var SKC='b1cfg2',SKU='b1ue2',SKO='b1op2',SKP='b1pay2';
var idc=300,saveT=null;
var CFG={usdcad:1.38,pkrusd:283,hrs:160};
var VIEWS={ov:'Overview',ue:'Unit Economics',op:'Agency Rate Card',pay:'Payroll',biz:'P&L Model',ai:'AI Advisor',cfg:'Settings'};

// Dept categorisation: client-facing (billable) vs overhead (internal)
var OP_CLIENT_DEPTS=['Client Delivery','Development','QA'];
function op_isClientFacing(dept){return OP_CLIENT_DEPTS.indexOf(dept)>-1;}
// Abbreviated dept labels for chips
var OP_DEPT_SHORT={'Client Delivery':'Delivery','Automation & Sales':'Auto & Sales','Development':'Dev','QA':'QA','HR':'HR','Management':'Mgmt'};
function deptShort(dept){return OP_DEPT_SHORT[dept]||dept;}

var OP_DEPTS=['Client Delivery','Development','Automation & Sales','Management','QA','HR'];
var OP_DCOLS={'Client Delivery':'#00d68f','Development':'#38bdf8','Automation & Sales':'#fbbf24','Management':'#c084fc','QA':'#fb7185','HR':'#fb923c'};
var OP_TIERS=['','Junior','Mid','Senior','Lead'];
var PAY_ROLES=['Graphic Designer','Meta Ads','Google Ads','Coordinator + QA','Content Strategist & Writer','Developer','Video Editor','Scheduler','HR','Automations','Sales','Videographer','TikTok Ads'];
var PAY_DEPTS=['Client Delivery','Development','Automation & Sales','Management','QA','HR'];
var PAY_TYPES=['Full-time','Part-time','Contractor'];

function pkrCad(){return CFG.pkrusd/CFG.usdcad;}
function fC(n){var a=Math.abs(n),neg=n<0;var s=a>=10000?'CA$'+(a/1000).toFixed(1)+'k':a>=1?'CA$'+Math.round(a):'CA$'+a.toFixed(2);return neg?'-'+s:s;}
function fPKR(n){var a=Math.abs(n);var s=a>=100000?'PKR '+(a/1000).toFixed(0)+'k':'PKR '+Math.round(a).toLocaleString();return n<0?'-'+s:s;}

// ── Sort state for each table ──────────────────────────────────────────
var _S = {
  pay: {c:'',d:1}, cap: {c:'',d:1},
  comp: {c:'violations',d:-1},
  rc: {c:'',d:1}, svc: {c:'',d:1}
};
function _stgl(s,c){if(s.c===c)s.d=-s.d;else{s.c=c;s.d=1;}}
function _ssort(arr,s,fns){
  if(!s.c||!fns[s.c])return arr;
  return arr.slice().sort(function(a,b){
    var va=fns[s.c](a)||0,vb=fns[s.c](b)||0;
    if(va===undefined)va='';if(vb===undefined)vb='';
    var cmp=typeof va==='string'?va.toLowerCase().localeCompare(vb.toLowerCase()):(va-vb);
    return s.d*cmp;
  });
}
function _sth(lbl,col,s,fn,cls){
  var on=s.c===col,arr=on?(s.d===1?'↑':'↓'):'↕';
  var c=on?'var(--accent)':'inherit';
  return '<th class="sth'+(on?' son':'')+(cls?' '+cls:'')+'" onclick="'+fn+'(\'' +col+'\')" style="color:'+c+'">'+esc(lbl)+'<span class="sa">'+arr+'</span></th>';
}

function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}
function setText(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}

function cfgLoad(){try{var p=JSON.parse(_ls.get(SKC)||'{}');Object.assign(CFG,p);}catch(e){}}
function scheduleSave(){
  clearTimeout(saveT);
  ['tb-badge','sb-badge'].forEach(function(id){var b=document.getElementById(id);if(b){b.className=b.className.replace('saving','')+' saving';b.textContent='○ Saving…';}});
  saveT=setTimeout(function(){
    try{_ls.set(SKC,JSON.stringify(CFG));ue_save();op_save();pay_save();}catch(e){}
    ['tb-badge','sb-badge'].forEach(function(id){var b=document.getElementById(id);if(b){b.className=b.className.replace('saving','');b.textContent='● Saved';}});
  },700);
}
function doReset(){
  if(!confirm('Reset ALL dashboards? This clears all entered data.'))return;
  // Clear localStorage
  [SKC,SKU,SKO,SKP].forEach(function(k){try{_ls.rm(k);}catch(e){}});
  // Reset in-memory objects to blank state
  Object.assign(UE,{price:0,uprice:0,upsell:20,vol:0,meta:0,ai:0,oads:0,overhead:0,other:0,
    cpr:0,closeRate:0,goal:0,
    sales:[{id:1,name:'Sales Rep',cur:'PKR',salary:0,comp:'bonus',bonusPKR:0,sites:0}],
    devs:[{id:2,name:'Developer',cur:'PKR',salary:0,comp:'bonus',bonusPKR:0,sites:0}],
    pms:[{id:3,name:'Project Manager',commPKR:0,sites:0}]});
  PAY.employees=[];PAY.months={};PAY.compliance={};
  Object.assign(OP,{markup:50,clients:0,pkg:{},
    svcs:[
      {id:50,name:'Social Media Management',roleName:'Scheduler',markup:null,pt:'salary'},
      {id:51,name:'Website Design & Development',roleName:'Developer',markup:null,pt:'salary'},
      {id:52,name:'SEO',roleName:'Content Strategist & Writer',markup:null,pt:'salary'},
      {id:53,name:'Content Strategy',roleName:'Content Strategist & Writer',markup:null,pt:'salary'},
      {id:54,name:'Graphic Designing',roleName:'Graphic Designer',markup:null,pt:'salary'},
      {id:55,name:'Google Paid Advertising',roleName:'Google Ads',markup:null,pt:'salary'},
      {id:56,name:'Meta Paid Advertising',roleName:'Meta Ads',markup:null,pt:'salary'},
      {id:57,name:'TikTok Paid Advertising',roleName:'Meta Ads',markup:null,pt:'salary'},
      {id:58,name:'Videography',roleName:'',markup:null,pt:'hourly',hr:0,hpc:0},
      {id:59,name:'Video Editing',roleName:'Video Editor',markup:null,pt:'salary'},
      {id:60,name:'AI Automation',roleName:'Automations',markup:null,pt:'salary'}
    ]});
  location.reload();
}

function goView(k){
  document.querySelectorAll('.ni').forEach(function(n,i){n.classList.toggle('on',['ov','ue','op','pay','ai','biz','cfg'][i]===k);});
  document.querySelectorAll('.view').forEach(function(v){v.classList.remove('on');});
  document.getElementById('view-'+k).classList.add('on');
  setText('tb-title',VIEWS[k]||k);
  renderAll();
  if(k==='ai')ai_initSuggestions();
}

function renderAll(){ov_render();ue_render();op_renderAll();pay_render();}

function mkKpi(l,v,c,s){return'<div class="kpi"><div class="kpi-l">'+l+'</div><div class="kpi-v '+c+'">'+v+'</div><div class="kpi-s">'+(s||'')+'</div></div>';}
function plR(nm,val,mx,bold,total,ind){var pct=Math.min(100,Math.abs(val)/mx*100),col=val>=0?'#10b981':'#ef4444';var ac=total?'n':val>=0?'pos':'neg';var nc='pl-n'+(bold?' b':'')+(ind?' i':'');return'<tr class="pl-tr"><td class="'+nc+'">'+nm+'</td><td class="pl-bc"><div class="btrk"><div class="bfill" style="width:'+pct.toFixed(1)+'%;background:'+col+'"></div></div></td><td class="pl-a '+ac+'">'+fC(val)+'</td></tr>';}
function plD(){return'<tr class="pl-sep"><td colspan="3"><div class="pl-sl"></div></td></tr>';}

var UE={price:0,uprice:0,upsell:20,vol:0,meta:0,ai:0,oads:0,overhead:0,other:0,
  cpr:0,closeRate:0,goal:0,
  sales:[{id:1,name:'Sales Rep',cur:'PKR',salary:0,comp:'bonus',bonusPKR:0,sites:0}],
  devs:[{id:2,name:'Developer',cur:'PKR',salary:0,comp:'bonus',bonusPKR:0,sites:0}],
  pms:[{id:3,name:'Project Manager',commPKR:0,sites:0}]};
function ue_load(){try{var p=JSON.parse(_ls.get(SKU)||'null');if(!p)return;Object.assign(UE,p);if(p.sales)UE.sales=p.sales;if(p.devs)UE.devs=p.devs;if(p.pms)UE.pms=p.pms;}catch(e){}}
function ue_save(){try{_ls.set(SKU,JSON.stringify(UE));}catch(e){}}
function ue_toCAD(m){return m.cur==='PKR'?m.salary/pkrCad():m.salary;}

function ue_leadsPerMonth(){ return UE.cpr>0?Math.round((UE.meta*30)/UE.cpr):0; }
function ue_expectedCloses(){ return Math.round(ue_leadsPerMonth()*(UE.closeRate/100)); }

function ue_calc(vol){
  vol=vol!==undefined?vol:UE.vol;
  var uf=UE.upsell/100,uc=Math.round(vol*uf),sc=vol-uc;
  var rev=sc*UE.price+uc*UE.uprice,blend=vol>0?rev/vol:0;
  var sV=0;UE.sales.forEach(function(m){if(m.comp==='bonus')sV+=(m.bonusPKR||0)/pkrCad();});
  var dV=0;UE.devs.forEach(function(m){if(m.comp==='bonus')dV+=(m.bonusPKR||0)/pkrCad();});
  var pmV=0;UE.pms.forEach(function(m){pmV+=(m.commPKR||0)/pkrCad();});
  var varPS=sV+dV+pmV,tVar=varPS*vol;
  var sF=0;UE.sales.forEach(function(m){sF+=ue_toCAD(m);});
  var dF=0;UE.devs.forEach(function(m){dF+=ue_toCAD(m);});
  var adsMo=(UE.meta*30)+(UE.oads||0);
  var toolsMo=(UE.ai||0)+(UE.overhead||0)+(UE.other||0);
  var tFix=sF+dF+adsMo+toolsMo;
  var contrib=blend-varPS;
  
  var cac=vol>0?adsMo/vol:0;
  
  var cacCPR=(UE.closeRate>0)?(UE.cpr/(UE.closeRate/100)):0;
  var net=rev-tVar-tFix,margin=rev>0?net/rev*100:0;
  var be=contrib>0?Math.ceil(tFix/contrib):Infinity;
  return{vol,rev,blend,sV,dV,pmV,varPS,tVar,sF,dF,adsMo,toolsMo,tFix,
    contrib,cac,cacCPR,net,margin,be};
}
function ue_render(){
  var r=ue_calc(),pc=pkrCad();
  var leadsPerMo=ue_leadsPerMonth(), expCloses=ue_expectedCloses();
  
  document.getElementById('ue-price').value=UE.price;
  document.getElementById('ue-uprice').value=UE.uprice;
  document.getElementById('ue-usl').value=UE.upsell;
  document.getElementById('ue-uv').textContent=UE.upsell+'%';
  document.getElementById('ue-vsl').value=UE.vol;
  document.getElementById('ue-vv').textContent=UE.vol;
  document.getElementById('ue-meta').value=UE.meta;
  document.getElementById('ue-ai').value=UE.ai;
  document.getElementById('ue-oads').value=UE.oads||0;
  document.getElementById('ue-overhead').value=UE.overhead||0;
  document.getElementById('ue-other').value=UE.other||0;
  document.getElementById('ue-cpr').value=UE.cpr||60;
  document.getElementById('ue-close').value=UE.closeRate||70;
  document.getElementById('ue-goal').value=UE.goal;
  document.getElementById('ue-pd').textContent=(UE.vol/30).toFixed(1);
  var _hint=document.getElementById('ue-exp-closes-hint');if(_hint)_hint.textContent='~'+expCloses+' from ads';
  document.getElementById('ue-ph').textContent='≈ USD $'+Math.round(UE.price/CFG.usdcad);
  document.getElementById('ue-uph').textContent='≈ USD $'+Math.round(UE.uprice/CFG.usdcad);
  document.getElementById('ue-mh').textContent=fC(UE.meta*30)+'/mo';
  document.getElementById('ue-pl-n').textContent='('+UE.vol+' sites)';
  
  document.getElementById('ue-leads-mo').textContent='~'+leadsPerMo;
  document.getElementById('ue-exp-closes').textContent='~'+expCloses;
  document.getElementById('ue-cpr-h').innerHTML='Leads/mo: <span id="ue-leads-mo" style="color:var(--blue)">~'+leadsPerMo+'</span>';
  document.getElementById('ue-close-h').innerHTML='Expected closes: <span id="ue-exp-closes" style="color:var(--accent)">~'+expCloses+'</span>/mo';
  
  var gOut=document.getElementById('ue-goal-out');
  if(r.contrib>0){var need=Math.ceil((r.tFix+(UE.goal||0))/r.contrib);gOut.textContent=need+' sites/mo needed';gOut.style.color=UE.vol>=need?'var(--green)':'var(--accent)';}
  else{gOut.textContent='∞';gOut.style.color='var(--red)';}
  
  var nC=r.net>400?'g':r.net>0?'a':'r';
  var cRat=r.cac/(r.contrib||1);
  var cacCPRvsContrib=r.cacCPR/(r.contrib||1);
  document.getElementById('ue-kpis').innerHTML=
    mkKpi('Blended rev/site',fC(r.blend),'n',UE.upsell+'% upsells at CA$'+UE.uprice)+
    mkKpi('Contribution margin',fC(r.contrib),r.contrib>0?'g':'r',Math.round(r.contrib/(r.blend||1)*100)+'% of price')+
    mkKpi('Ad CAC (spend÷closes)',fC(r.cac),cRat>0.85?'r':cRat>0.6?'a':'g','CA$'+UE.meta+'/day, '+UE.vol+' closes')+
    mkKpi('CPR-based CAC',fC(r.cacCPR),cacCPRvsContrib>0.85?'r':cacCPRvsContrib>0.6?'a':'g','CA$'+UE.cpr+' CPR ÷ '+UE.closeRate+'% close rate')+
    mkKpi('Break-even',isFinite(r.be)?r.be+'/mo':'∞',UE.vol>=r.be?'g':'a',UE.vol+' closing now')+
    mkKpi('Monthly net',fC(r.net),nC,r.margin.toFixed(1)+'% margin');
  
  var kpiEl=document.getElementById('ue-kpis');
  if(kpiEl) kpiEl.className='kpi-row c6';
  
  ue_renderTeam();
  
  var mx=Math.max(r.rev,1),rows='';
  rows+=plR('Revenue',r.rev,mx,true);rows+=plD();
  if(r.sV>0)rows+=plR('Sales commissions',-r.sV*r.vol,mx,false,false,true);
  if(r.dV>0)rows+=plR('Dev commissions',-r.dV*r.vol,mx,false,false,true);
  if(r.pmV>0)rows+=plR('PM commissions',-r.pmV*r.vol,mx,false,false,true);
  rows+=plD();
  if(r.sF>0)rows+=plR('Sales salaries',-r.sF,mx,false,false,true);
  if(r.dF>0)rows+=plR('Dev salaries',-r.dF,mx,false,false,true);
  rows+=plR('Meta ads (CA$'+UE.meta+'/day)',-(UE.meta*30),mx,false,false,true);
  if(UE.oads>0)rows+=plR('Other ads',-UE.oads,mx,false,false,true);
  if(UE.ai>0)rows+=plR('AI tools',-UE.ai,mx,false,false,true);
  if(UE.overhead>0)rows+=plR('Software & overhead',-UE.overhead,mx,false,false,true);
  if(UE.other>0)rows+=plR('Other fixed costs',-UE.other,mx,false,false,true);
  rows+=plD();rows+=plR('Net profit',r.net,mx,true,true);
  document.getElementById('ue-pl').innerHTML=rows;
  
  var vols=[0,10,r.be,UE.vol,50,100,150,200,250,300].filter(function(v,i,a){return Number.isFinite(v)&&v>=0&&v<=300&&a.indexOf(v)===i;}).sort(function(a,b){return a-b;});
  var sb='';
  vols.forEach(function(v){var cr=ue_calc(v),ic=v===UE.vol,ib=v===r.be&&!ic;var nc=cr.net>0?'tg':cr.net<0?'tr2':'';var mc=cr.margin>15?'tg':cr.margin>0?'ta':'tr2';sb+='<tr class="'+(ic?'cur':'')+'"><td>'+v+(ic?' ← you':ib?' ← BE':'')+'</td><td>'+fC(cr.rev)+'</td><td>'+fC(cr.tFix+cr.tVar)+'</td><td class="'+nc+'">'+fC(cr.net)+'</td><td class="'+mc+'">'+cr.margin.toFixed(1)+'%</td></tr>';});
  document.getElementById('ue-sens').innerHTML=sb;
  
  var dot,title,body,tips=[];
  if(r.net<0){dot='var(--red)';title='Loss-making at '+UE.vol+' sites/mo';body='Need <strong>'+(isFinite(r.be)?r.be:'∞')+' sites/mo</strong> to break even. CAC <strong>'+fC(r.cac)+'</strong> vs contribution <strong>'+fC(r.contrib)+'</strong>.';tips.push('Upsells add CA$'+(UE.uprice-UE.price)+' per sale at near-zero extra cost');}
  else if(r.net<500){dot='var(--accent)';title='Marginal — '+fC(r.net)+'/mo';body='<strong>'+(UE.vol-r.be)+' sites above break-even</strong>. One slow week removes it.';tips.push('CA$10 price increase → +'+fC(10*UE.vol)+'/mo');}
  else{dot='var(--green)';title='Profitable · '+fC(r.net)+'/mo';body='<strong>'+r.margin.toFixed(1)+'% net margin</strong>. At 300 sites/mo → <strong>'+fC(ue_calc(300).net)+'/mo</strong>.';}
  document.getElementById('ue-verdict').innerHTML='<div class="vhd"><div class="vdot" style="background:'+dot+';box-shadow:0 0 6px '+dot+'55"></div><div class="vtitle">'+title+'</div></div><div class="vbody">'+body+'</div>'+(tips.length?'<div class="vtips">'+tips.map(function(t){return'<div class="vtip">'+t+'</div>';}).join('')+'</div>':'');
}
function ue_renderTeam(){
  var pc=pkrCad();
  ['sales','devs'].forEach(function(type){
    var arr=type==='sales'?UE.sales:UE.devs;
    var html='';
    arr.forEach(function(m){
      var cadV=ue_toCAD(m),hint=m.cur==='PKR'?'≈ CA$'+cadV.toFixed(0)+'/mo':'≈ PKR '+Math.round(cadV*pc).toLocaleString()+'/mo';
      var isSal=m.comp==='salary';
      html+='<div class="rcard"><div class="rc-top"><input class="txt-in" type="text" value="'+esc(m.name)+'" placeholder="Name" data-ue="'+type+'" data-id="'+m.id+'" data-f="name"><button class="del-btn" data-ue="'+type+'" data-id="'+m.id+'" data-f="del">×</button></div>'+
        '<div class="r3">'+
        '<div><div class="lbl">Salary</div><div class="sal-wrap"><button class="cur-btn '+(m.cur==='PKR'?'on':'')+'" data-ue="'+type+'" data-id="'+m.id+'" data-f="cur">'+m.cur+'</button><input class="num-in" type="number" min="0" step="100" value="'+m.salary+'" data-ue="'+type+'" data-id="'+m.id+'" data-f="salary" style="border-radius:0 5px 5px 0;border-left:none"></div><div class="hint" id="ue-hint-'+type+'-'+m.id+'">'+hint+'</div></div>'+
        '<div><div class="lbl">Type</div><div style="display:flex;gap:4px;margin-top:2px"><button style="flex:1;font-size:10px;padding:3px 4px;border-radius:4px;border:.5px solid var(--bdr2);background:'+(isSal?'var(--surf3)':'var(--abg)')+';color:'+(isSal?'var(--muted)':'var(--accent)')+';cursor:pointer;font-family:var(--sans)" data-ue="'+type+'" data-id="'+m.id+'" data-f="comp" data-val="bonus">+Bonus</button><button style="flex:1;font-size:10px;padding:3px 4px;border-radius:4px;border:.5px solid var(--bdr2);background:'+(isSal?'var(--abg)':'var(--surf3)')+';color:'+(isSal?'var(--accent)':'var(--muted)')+';cursor:pointer;font-family:var(--sans)" data-ue="'+type+'" data-id="'+m.id+'" data-f="comp" data-val="salary">Fixed</button></div></div>'+
        '<div><div class="lbl">Commission / site (PKR)</div>'+
        (!isSal?'<input class="num-in" type="number" min="0" step="100" value="'+(m.bonusPKR||0)+'" data-ue="'+type+'" data-id="'+m.id+'" data-f="bonusPKR">'
        :'<div class="hint" style="margin-top:6px">Fixed only</div>')+
        '</div></div></div>';
    });
    document.getElementById('ue-'+type).innerHTML=html;
  });
}
function ue_add(type){
  idc++;
  if(type==='sales')UE.sales.push({id:idc,name:'Sales Rep',cur:'PKR',salary:20000,comp:'bonus',bonusPKR:280000,sites:0});
  else if(type==='pm')UE.pms.push({id:idc,name:'Project Manager',commPKR:1960,sites:0});
  else UE.devs.push({id:idc,name:'Developer',cur:'PKR',salary:25000,comp:'bonus',bonusPKR:1960,sites:0});
  var cPane=document.getElementById('ue-pane-comm');
  if(cPane&&cPane.style.display!=='none'){ue_renderCommission();}else{ue_render();}
  scheduleSave();
}
function ue_getM(type,id){
  if(type==='pm')return UE.pms.find(function(x){return x.id===id;})||null;
  return(type==='sales'?UE.sales:UE.devs).find(function(x){return x.id===id;})||null;
}

/* ── UE Sub-tab switcher ── */
function ue_setTab(t){
  document.getElementById('ue-pane-eco').style.display=t==='eco'?'':'none';
  document.getElementById('ue-pane-comm').style.display=t==='comm'?'':'none';
  document.getElementById('ue-tab-eco').className=t==='eco'?'pay-stab on':'pay-stab';
  document.getElementById('ue-tab-comm').className=t==='comm'?'pay-stab on':'pay-stab';
  if(t==='comm')ue_renderCommission();
}

/* ── Commission Tracker ── */
function ue_renderCommission(){
  var pc=pkrCad();
  function commCard(m,type){
    var commPKR=(type==='pm')?(m.commPKR||0):(m.bonusPKR||0);
    var sites=m.sites||0,total=commPKR*sites,totalCAD=total/pc;
    var earnColor=total>0?'var(--green)':'var(--dim)';
    var commStep=(type==='sales')?'1000':'100';
    var commField='<input class="num-in" type="number" min="0" step="'+commStep+'" value="'+commPKR+'" data-ue="'+type+'" data-id="'+m.id+'" data-f="'+(type==='pm'?'commPKR':'bonusPKR')+'" title="Commission per site (PKR)">';
    return '<div class="rcard" style="margin-bottom:.625rem">'+
      '<div class="rc-top"><input class="txt-in" type="text" value="'+esc(m.name)+'" placeholder="Name" data-ue="'+type+'" data-id="'+m.id+'" data-f="name">'+
      '<button class="del-btn" data-ue="'+type+'" data-id="'+m.id+'" data-f="del">×</button></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">'+
        '<div><div class="lbl">Commission / site (PKR)</div>'+commField+'</div>'+
        '<div><div class="lbl">Sites this month</div><input class="num-in" type="number" min="0" step="1" value="'+sites+'" data-ue="'+type+'" data-id="'+m.id+'" data-f="sites"></div>'+
      '</div>'+
      '<div style="margin-top:.5rem;padding:.5rem .625rem;background:var(--surf3);border-radius:5px;display:flex;justify-content:space-between;align-items:center">'+
        '<span id="ue-csub-'+type+'-'+m.id+'" style="font-size:10px;color:var(--muted)">'+sites+' site'+(sites===1?'':'s')+' × PKR '+commPKR.toLocaleString()+'</span>'+
        '<span id="ue-ctot-'+type+'-'+m.id+'" style="font-family:var(--mono);font-size:13px;font-weight:700;color:'+earnColor+'">PKR '+total.toLocaleString()+'&nbsp;<span style="font-size:10px;font-weight:400;color:var(--dim)">≈ '+fC(totalCAD)+'</span></span>'+
      '</div>'+
    '</div>';
  }
  var sH=''; UE.sales.forEach(function(m){sH+=commCard(m,'sales');});
  var pH=''; UE.pms.forEach(function(m){pH+=commCard(m,'pm');});
  var dH=''; UE.devs.forEach(function(m){dH+=commCard(m,'dev');});
  document.getElementById('ue-comm-sales').innerHTML=sH||'<div style="font-size:11px;color:var(--dim)">No sales members yet.</div>';
  document.getElementById('ue-comm-pms').innerHTML=pH||'<div style="font-size:11px;color:var(--dim)">No project managers yet.</div>';
  document.getElementById('ue-comm-devs').innerHTML=dH||'<div style="font-size:11px;color:var(--dim)">No developers yet.</div>';
  var tS=0,tP=0,tD=0;
  UE.sales.forEach(function(m){tS+=(m.bonusPKR||0)*(m.sites||0);});
  UE.pms.forEach(function(m){tP+=(m.commPKR||0)*(m.sites||0);});
  UE.devs.forEach(function(m){tD+=(m.bonusPKR||0)*(m.sites||0);});
  var tAll=tS+tP+tD;
  document.getElementById('ue-comm-kpis').innerHTML=
    mkKpi('Total commissions','PKR '+Math.round(tAll).toLocaleString(),tAll>0?'g':'n',fC(tAll/pc)+' CA$')+
    mkKpi('Sales payout','PKR '+Math.round(tS).toLocaleString(),'a',UE.sales.length+' rep'+(UE.sales.length===1?'':'s'))+
    mkKpi('PM payout','PKR '+Math.round(tP).toLocaleString(),'b',UE.pms.length+' PM'+(UE.pms.length===1?'':'s'))+
    mkKpi('Dev payout','PKR '+Math.round(tD).toLocaleString(),'p',UE.devs.length+' dev'+(UE.devs.length===1?'':'s'));
}

// ═══════════════════════════════════════════════════════════
// RATE CARD — fully driven by Payroll employees
// ═══════════════════════════════════════════════════════════
var OP={
  markup:50, clients:0,
  // Client load per role (how many clients can one person in this role serve)
  roleLoads:{
    'Graphic Designer':10,'Meta Ads':10,'Google Ads':10,
    'Coordinator + QA':10,'Content Strategist & Writer':10,
    'Developer':5,'Video Editor':10,'Scheduler':10,
    'HR':20,'Automations':15,'Sales':20
  },
  svcs:[
    {id:50,name:'Social Media Management',     roleName:'Scheduler',                    markup:null,pt:'salary'},
    {id:51,name:'Website Design & Development',roleName:'Developer',                    markup:null,pt:'salary'},
    {id:52,name:'SEO',                         roleName:'Content Strategist & Writer',  markup:null,pt:'salary'},
    {id:53,name:'Content Strategy',            roleName:'Content Strategist & Writer',  markup:null,pt:'salary'},
    {id:54,name:'Graphic Designing',           roleName:'Graphic Designer',             markup:null,pt:'salary'},
    {id:55,name:'Google Paid Advertising',     roleName:'Google Ads',                   markup:null,pt:'salary'},
    {id:56,name:'Meta Paid Advertising',       roleName:'Meta Ads',                     markup:null,pt:'salary'},
    {id:57,name:'TikTok Paid Advertising',     roleName:'Meta Ads',                     markup:null,pt:'salary'},
    {id:58,name:'Videography',                 roleName:'',                             markup:null,pt:'hourly',hr:75,hpc:3},
    {id:59,name:'Video Editing',               roleName:'Video Editor',                 markup:null,pt:'salary'},
    {id:60,name:'AI Automation',               roleName:'Automations',                  markup:null,pt:'salary'},
  ],
  pkg:{}
};

function op_load(){
  try{
    var p=JSON.parse(_ls.get(SKO)||'null');
    if(!p)return;
    if(p.markup!=null)OP.markup=p.markup;
    if(p.clients!=null)OP.clients=p.clients;
    if(p.pkg)OP.pkg=p.pkg;
    // Migrate old roleLoads
    if(p.roleLoads)Object.assign(OP.roleLoads,p.roleLoads);
    // Migrate old OP.roles loads → roleLoads
    if(p.roles&&Array.isArray(p.roles)&&!p.roleLoads){
      p.roles.forEach(function(r){
        var key=r.payrollRole||r.title;
        if(key&&r.load)OP.roleLoads[key]=r.load;
      });
    }
    // Load services — migrate old roleId → roleName if needed
    if(p.svcs&&Array.isArray(p.svcs)){
      OP.svcs=p.svcs.map(function(s){
        if(!s.roleName&&s.roleId&&p.roles){
          var old=p.roles.find(function(x){return x.id===s.roleId;});
          if(old)s.roleName=old.payrollRole||old.title||'';
        }
        if(!s.pt)s.pt='salary';
        return s;
      });
    }
  }catch(e){}
}
function op_save(){
  try{_ls.set(SKO,JSON.stringify({
    markup:OP.markup,clients:OP.clients,
    roleLoads:OP.roleLoads,svcs:OP.svcs,pkg:OP.pkg
  }));}catch(e){}
}

// Group active PAY employees by role — the core of the unified system
function op_roleGroups(){
  var g={};
  PAY.employees.filter(function(e){return e.status==='active';}).forEach(function(e){
    var role=e.role||'(no role)';
    if(!g[role])g[role]={dept:e.dept||'',people:[],totalPKR:0};
    g[role].people.push(e.name);
    g[role].totalPKR+=(e.baseSalary||0);
  });
  return g;
}

// Total cost in CA$ for all employees with a given role
function op_roleCAD(roleName){
  var g=op_roleGroups();
  return g[roleName]?(g[roleName].totalPKR/pkrCad()):0;
}

// Cost per client for a role (total role cost ÷ clients served)
function op_roleCPC(roleName){
  var load=(OP.roleLoads[roleName]||10);
  return load>0?op_roleCAD(roleName)/load:0;
}

// Service cost — reads directly from payroll via role name
function op_svcCost(s){if(s.pt==='hourly')return(s.hr||0)*(s.hpc||1);return op_roleCPC(s.roleName||'');}
function op_mu(s){return(s.markup!==null&&s.markup!==undefined&&s.markup!=='')?+s.markup:OP.markup;}
function op_price(s){return op_svcCost(s)*(1+op_mu(s)/100);}
function op_getS(id){return OP.svcs.find(function(x){return x.id===id;})||null;}
function op_renderCapHealth(){
  var groups=op_roleGroups();
  var DEV_DEPTS=['Development','QA'];
  var DEPT_ORDER=['Client Delivery','QA','Development','Automation & Sales','HR','Management'];
  var roles=Object.keys(groups).filter(function(r){return groups[r].people.length>0;});
  var el=document.getElementById('cap-health-cards');if(!el)return;
  if(!roles.length){el.innerHTML='<div style="font-size:11px;color:var(--dim);padding:1rem">No employees in Payroll yet.</div>';return;}
  roles.sort(function(a,b){
    var da=groups[a].dept||'',db=groups[b].dept||'';
    var ia=DEPT_ORDER.indexOf(da),ib=DEPT_ORDER.indexOf(db);
    if(ia<0)ia=99;if(ib<0)ib=99;return ia-ib;
  });
  var html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem">';
  roles.forEach(function(role){
    var g=groups[role];
    var isDev=DEV_DEPTS.indexOf(g.dept||'')>=0;
    var demand=isDev?UE.vol:OP.clients;
    var dLabel=isDev?'websites/mo':'projects/mo';
    var load=OP.roleLoads[role]||10;
    var hc=g.people.length,cap=hc*load;
    var util=cap>0?(demand/cap)*100:0;
    var col=OP_DCOLS[g.dept||'']||'#6b7280';
    var status,sCol,sBg,action;
    if(util<75){status='Comfortable';sCol='var(--green)';sBg='var(--gbg)';action='No action needed.';}
    else if(util<90){status='Plan Hire';sCol='var(--accent)';sBg='var(--abg)';action='Begin recruiting — hiring takes 2–4 weeks.';}
    else{status='Hire Immediately';sCol='var(--red)';sBg='var(--rbg)';action='Overloaded — delivery quality at risk.';}
    var bW=Math.min(100,util).toFixed(1),bCol=util<75?'var(--green)':util<90?'var(--accent)':'var(--red)';
    var nameList=g.people.slice(0,3).join(', ')+(g.people.length>3?' +'+(g.people.length-3)+' more':'');
    html+=
      '<div style="background:var(--surf2);border:.5px solid var(--bdr2);border-left:3px solid '+col+';border-radius:6px;padding:.875rem">'+
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.625rem">'+
          '<div><div style="font-size:13px;font-weight:600;color:var(--text)">'+esc(role)+'</div>'+
          '<span style="font-size:10px;padding:1px 7px;border-radius:3px;background:'+col+'18;color:'+col+'">'+esc(g.dept||'—')+'</span></div>'+
          '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+sBg+';color:'+sCol+'">'+status+'</span>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.375rem;margin-bottom:.625rem;text-align:center">'+
          '<div style="background:var(--surf3);border-radius:4px;padding:.375rem"><div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.04em">People</div><div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--text)">'+hc+'</div></div>'+
          '<div style="background:var(--surf3);border-radius:4px;padding:.375rem"><div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.04em">Capacity</div><div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--blue)">'+cap+'</div><div style="font-size:9px;color:var(--dim)">'+dLabel+'</div></div>'+
          '<div style="background:var(--surf3);border-radius:4px;padding:.375rem"><div style="font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.04em">Demand</div><div style="font-family:var(--mono);font-size:18px;font-weight:700;color:'+bCol+'">'+demand+'</div><div style="font-size:9px;color:var(--dim)">'+dLabel+'</div></div>'+
        '</div>'+
        '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.375rem">'+
          '<div style="flex:1;height:6px;background:var(--surf4);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+bW+'%;background:'+bCol+';border-radius:3px"></div></div>'+
          '<span style="font-family:var(--mono);font-size:12px;font-weight:700;color:'+bCol+';min-width:42px;text-align:right">'+util.toFixed(0)+'%</span>'+
        '</div>'+
        '<div style="font-size:11px;color:'+sCol+'">'+esc(action)+'</div>'+
        '<div style="font-size:10px;color:var(--dim);margin-top:.25rem">'+esc(nameList)+'</div>'+
      '</div>';
  });
  html+='</div><div style="margin-top:.875rem;padding:.625rem 1rem;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:6px;font-size:11px;color:var(--muted)">'+
    '<strong style="color:var(--text)">Hire Rule:</strong> Start recruiting at <strong style="color:var(--accent)">75%</strong>. '+
    'Never exceed <strong style="color:var(--red)">90%</strong> on any delivery role for 2+ consecutive weeks. '+
    'Hiring takes 2–4 weeks, onboarding another 2–4 weeks — always hire ahead of the crunch.</div>';
  el.innerHTML=html;
}
function op_addSvc(){idc++;OP.svcs.push({id:idc,name:'New Service',roleName:PAY_ROLES[0]||'',markup:null,pt:'salary'});op_renderAll();scheduleSave();}

function op_renderAll(){
  var groups=op_roleGroups();
  var allRoles=Object.keys(groups);
  // Add PAY_ROLES not yet in groups so user can see/configure them
  PAY_ROLES.forEach(function(r){if(!groups[r])groups[r]={dept:'',people:[],totalPKR:0};});

  var em=OP.markup/(1+OP.markup/100);
  document.getElementById('op-msl').value=OP.markup;
  document.getElementById('op-mv').textContent=OP.markup+'%';
  document.getElementById('op-clients').value=OP.clients;
  document.getElementById('op-em').textContent=em.toFixed(1)+'%';

  // KPIs — derive from actual payroll
  var activeEmp=PAY.employees.filter(function(e){return e.status==='active';});
  var tPay=activeEmp.reduce(function(a,e){return a+(e.baseSalary||0)/pkrCad();},0);
  var tPpl=activeEmp.length;
  document.getElementById('op-kpis').innerHTML=
    mkKpi('Active staff',tPpl,'n','from Payroll roster')+
    mkKpi('Total payroll/mo',fC(tPay),'g','all active employees')+
    mkKpi('Markup',OP.markup+'%','a','Price = cost × '+(1+OP.markup/100).toFixed(2))+
    mkKpi('Eff. margin',em.toFixed(1)+'%','b','Profit ÷ revenue');

  // ── Team table — grouped by department ──
  // Build dept-grouped structure from actual employees only
  var DEPT_ORDER=['Client Delivery','QA','Development','Automation & Sales','HR','Management'];
  var deptGroups={};
  Object.keys(groups).forEach(function(role){
    var g=groups[role];
    if(!g.people.length)return; // skip roles with no staff
    var dept=g.dept||'Unknown';
    if(!deptGroups[dept])deptGroups[dept]={roles:[],totalPKR:0,people:0,col:OP_DCOLS[dept]||'#6b7280',clientFacing:op_isClientFacing(dept)};
    deptGroups[dept].roles.push(role);
    deptGroups[dept].totalPKR+=g.totalPKR;
    deptGroups[dept].people+=g.people.length;
  });
  // Render depts in order (client-facing first)
  var orderedDepts=DEPT_ORDER.filter(function(d){return deptGroups[d]&&deptGroups[d].roles.length>0;});
  Object.keys(deptGroups).forEach(function(d){if(orderedDepts.indexOf(d)<0)orderedDepts.push(d);});

  var rh='';
  // Sortable header
  var rcHead=document.getElementById('rc-rates-head');
  if(rcHead)rcHead.innerHTML='<tr>'+
    _sth('Role','role',_S.rc,'rc_sortBy','')+''+
    _sth('Employees','staff',_S.rc,'rc_sortBy','r')+''+
    '<th>Dept</th>'+
    _sth('Salary/mo (PKR)','pkr',_S.rc,'rc_sortBy','r')+''+
    _sth('CA$/mo','cad',_S.rc,'rc_sortBy','r')+''+
    '<th class="r">Sites / person / mo</th>'+
    _sth('Cost/client','cpc',_S.rc,'rc_sortBy','r')+'</tr>';
  orderedDepts.forEach(function(dept){
    var dg=deptGroups[dept];
    if(!dg||!dg.roles.length)return;
    var col=dg.col;
    var isOH=!dg.clientFacing;
    var deptTotalCAD=dg.totalPKR/pkrCad();

    // ── Dept section header ──
    rh+='<tr style="background:'+col+'0e">'+
      '<td colspan="7" style="padding:.5rem 1rem;border-left:3px solid '+col+';border-bottom:.5px solid '+col+'28">'+
        '<div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">'+
          '<span style="font-weight:700;font-size:12px;color:'+col+';text-transform:uppercase;letter-spacing:.04em">'+esc(dept)+'</span>'+
          '<span style="font-size:11px;color:var(--dim)">'+dg.people+' staff &nbsp;·&nbsp; '+fC(deptTotalCAD)+'/mo</span>'+
          (isOH?'<span style="font-size:10px;background:rgba(107,114,128,.12);color:var(--muted);padding:1px 8px;border-radius:10px;border:.5px solid var(--bdr2)">Overhead — cost spread across all clients</span>':
                '<span style="font-size:10px;background:'+col+'18;color:'+col+';padding:1px 8px;border-radius:10px">Client-facing</span>')+
        '</div>'+
      '</td>'+
    '</tr>';

    // ── Role rows ──
    // Sort roles within dept
    var deptRoles=_ssort(dg.roles.map(function(r){return{role:r,g:groups[r]};}),_S.rc,{
      role:function(x){return x.role;},
      staff:function(x){return x.g.people.length;},
      pkr:function(x){return x.g.totalPKR;},
      cad:function(x){return x.g.totalPKR/pkrCad();},
      cpc:function(x){var l=OP.roleLoads[x.role]||10;return x.g.totalPKR>0?x.g.totalPKR/pkrCad()/l:0;},
    }).map(function(x){return x.role;});
    deptRoles.forEach(function(role){
      var g=groups[role];
      var load=OP.roleLoads[role]||10;
      var roleCAD=g.totalPKR/pkrCad();
      var cpc=(!isOH&&load>0)?roleCAD/load:0;
      var ohCPC=isOH&&OP.clients>0?roleCAD/OP.clients:0;
      var cnt=g.people.length;
      var hasSalary=g.totalPKR>0;
      var nameList=g.people.slice(0,2).join(', ')+(g.people.length>2?' +'+(g.people.length-2):'');

      rh+='<tr>'+
        // Role name
        '<td style="font-weight:600;font-size:13px;padding-left:1.5rem;color:var(--text)">'+esc(role)+'</td>'+
        // Staff count + names
        '<td class="r">'+
          '<span style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--green)">'+cnt+'</span>'+
          '<div style="font-size:10px;color:var(--dim);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(g.people.join(', '))+'">'+esc(nameList)+'</div>'+
        '</td>'+
        // Dept chip (full name, colored)
        '<td>'+
          '<span style="font-size:11px;font-weight:500;color:'+col+';background:'+col+'18;padding:2px 8px;border-radius:4px;white-space:nowrap">'+esc(dept)+'</span>'+
        '</td>'+
        // PKR salary
        '<td class="r" style="font-family:var(--mono);font-size:12px;color:var(--muted)">'+(hasSalary?fPKR(g.totalPKR):'—')+'</td>'+
        // CA$ salary
        '<td class="r" style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--text)">'+(hasSalary?fC(roleCAD):'—')+'</td>'+
        // Clients / person input (or overhead indicator)
        '<td class="r">'+
          (!isOH
            ? '<input type="number" min="1" max="50" step="1" value="'+load+'" data-rl="'+esc(role)+'"'+
              ' style="width:50px;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:4px;padding:3px 6px;color:var(--accent);font-family:var(--mono);font-size:12px;text-align:right;outline:none">'
            : '<span style="font-size:11px;color:var(--dim);font-style:italic">÷ all projects</span>')+
        '</td>'+
        // Cost per client (or overhead per-client spread)
        '<td class="r" style="font-family:var(--mono);font-size:13px;font-weight:700;color:'+
          ((!isOH&&hasSalary)?'var(--green)':( isOH&&hasSalary?'var(--muted)':'var(--dim)'))+
        '">'+
          ((!isOH&&hasSalary)?fC(cpc):( isOH&&hasSalary?'<span title="Spread across '+OP.clients+' clients">'+fC(ohCPC)+'<span style=\'font-size:9px;font-weight:400\'>/ client</span></span>':'—'))+
        '</td>'+
      '</tr>';
    });
  });

  if(!rh)rh='<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--dim);font-size:13px">No employees in Payroll yet — add staff in the 👥 Payroll tab.</td></tr>';
  document.getElementById('op-rates').innerHTML=rh;

    // ── Services ──
  // Services dropdown: only show roles that actually have employees
  var rolesForSelect=Object.keys(groups).filter(function(r){return groups[r].people.length>0;}).sort();
  // ── Services ──────────────────────────────────────────────────────────
  // Build role options once — clean names only, no counts/dept labels
  var roleOpts='<option value="">— select role —</option>'+
    rolesForSelect.map(function(r){return'<option value="'+esc(r)+'">'+esc(r)+'</option>';}).join('');

  // Sortable header
  var svcHead=document.getElementById('op-svcs-head');
  if(svcHead)svcHead.innerHTML='<tr>'+
    _sth('Service','name',_S.svc,'svc_sortBy','')+''+
    '<th style="min-width:160px">Delivered by / Rate</th>'+
    _sth('Est. cost/client','cost',_S.svc,'svc_sortBy','r')+''+
    '<th class="r" style="min-width:80px">Markup %</th>'+
    _sth('Price/client','price',_S.svc,'svc_sortBy','r')+''+
    _sth('Margin','margin',_S.svc,'svc_sortBy','r')+''+
    '<th style="width:28px"></th></tr>';

  var sortedSvcs=_ssort(OP.svcs.slice(),_S.svc,{
    name:function(s){return s.name||'';},
    cost:function(s){return op_svcCost(s);},
    price:function(s){return op_price(s);},
    profit:function(s){return op_price(s)-op_svcCost(s);},
    margin:function(s){var p=op_price(s);return p>0?(p-op_svcCost(s))/p*100:0;},
  });

  var sh='';
  sortedSvcs.forEach(function(s){
    var cost=op_svcCost(s),price=op_price(s),profit=price-cost;
    var margin=price>0?profit/price*100:0;
    var dispMu=s.markup!==null&&s.markup!==undefined&&s.markup!==''?s.markup:'';
    var isHourly=s.pt==='hourly';

    // "Delivered by" cell
    var deliverCell;
    if(isHourly){
      // Videography: show hourly rate + hours inputs
      deliverCell=
        '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">'+
          '<span style="font-size:11px;color:var(--muted)">CA$</span>'+
          '<input class="ci mo" type="number" min="0" step="5" value="'+(s.hr||75)+'" data-os="'+s.id+'" data-f="hr" style="width:52px;font-size:13px;text-align:right">'+
          '<span style="font-size:11px;color:var(--dim)">/hr ×</span>'+
          '<input class="ci mo" type="number" min="1" step="1" value="'+(s.hpc||3)+'" data-os="'+s.id+'" data-f="hpc" style="width:38px;font-size:13px;text-align:right">'+
          '<span style="font-size:11px;color:var(--dim)">hrs</span>'+
        '</div>'+
        '<div style="font-size:10px;color:var(--dim);margin-top:2px">per client · CAD only</div>';
    } else {
      var g2=groups[s.roleName];
      var col=g2?OP_DCOLS[g2.dept]||'#6b7280':'#6b7280';
      deliverCell=
        '<select class="csel" data-os="'+s.id+'" data-f="roleName" style="width:100%;min-width:150px">'+
          roleOpts.replace(' value="'+esc(s.roleName)+'"',' value="'+esc(s.roleName)+'" selected')+
        '</select>'+
        (g2&&g2.dept?'<div style="margin-top:3px"><span style="font-size:10px;padding:1px 7px;border-radius:3px;background:'+col+'18;color:'+col+'">'+esc(g2.dept)+'</span></div>':'');
    }

    sh+='<tr>'+
      '<td style="min-width:170px">'+
        '<input class="ci" type="text" value="'+esc(s.name)+'" data-os="'+s.id+'" data-f="name" style="font-size:13px;font-weight:500">'+
        (isHourly?'<div style="font-size:10px;color:var(--accent);margin-top:2px">⏱ Hourly · CAD</div>':'')+
      '</td>'+
      '<td style="min-width:160px">'+deliverCell+'</td>'+
      '<td class="r"><span class="tag a" style="font-size:12px">'+fC(cost)+'</span></td>'+
      '<td class="r">'+
        '<div style="display:flex;align-items:center;justify-content:flex-end;gap:3px">'+
          (isHourly?'<span style="font-size:11px;color:var(--dim)">included</span>':
            '<input class="ci mo r" type="number" min="0" step="5" value="'+dispMu+'" placeholder="'+OP.markup+'" data-os="'+s.id+'" data-f="markup" style="width:48px;font-size:13px"><span style="font-size:10px;color:var(--dim)">%</span>')+
        '</div>'+
      '</td>'+
      '<td class="r"><span class="tag g" style="font-size:12px">'+fC(price)+'</span>'+(isHourly?'<div style="font-size:10px;color:var(--dim)">per client</div>':'')+'</td>'+
      '<td class="r" style="font-family:var(--mono);font-size:12px">'+
        '<div style="color:var(--green)">'+fC(profit)+'</div>'+
        '<div style="color:var(--muted);font-size:10px">'+margin.toFixed(1)+'%</div>'+
      '</td>'+
      '<td><button class="del-btn" data-os="'+s.id+'" data-f="del">×</button></td>'+
    '</tr>';
  });
  document.getElementById('op-svcs').innerHTML=sh;

  // ── Package builder ──
  var ph='';
  OP.svcs.forEach(function(s){
    var on=!!OP.pkg[s.id];
    var g4=groups[s.roleName];
    var roleDesc=s.pt==='hourly'?('CA$'+(s.hr||75)+'/hr × '+(s.hpc||3)+' hrs (hourly)'):(s.roleName?(s.roleName+(g4?(' · '+g4.people.length+' staff'):'')):'No role assigned');
    ph+='<div class="pkg-row"><input type="checkbox" class="pkg-ck" '+(on?'checked':'')+' data-pkg="'+s.id+'">'+
      '<span class="pkg-nm'+(on?' on':'')+'">'+esc(s.name)+'<span class="pkg-sub">'+esc(roleDesc)+' · '+op_mu(s)+'% markup</span></span>'+
      '<span class="pkg-p'+(on?' on':'')+'">'+fC(op_price(s))+'/mo</span></div>';
  });
  document.getElementById('op-pkg').innerHTML=ph||'<div style="font-size:11px;color:var(--dim)">Add services first.</div>';
  var tc=0,tp=0;OP.svcs.forEach(function(s){if(OP.pkg[s.id]){tc+=op_svcCost(s);tp+=op_price(s);}});
  document.getElementById('op-pc').textContent=fC(tc);
  document.getElementById('op-pp').textContent=fC(tp);
  document.getElementById('op-ppr').textContent=fC(tp-tc);

  // ── Payroll by dept (from actual PAY) ──
  var byD={};
  activeEmp.forEach(function(e){
    var d=e.dept||'Unknown';
    if(!byD[d])byD[d]={col:OP_DCOLS[d]||'#6b7280',tot:0,cnt:0};
    byD[d].tot+=(e.baseSalary||0)/pkrCad();
    byD[d].cnt++;
  });
  var gt=0,gp=0,dh='<thead><tr><th>Dept</th><th class="r">People</th><th class="r">Total/mo</th><th class="r">Per client</th></tr></thead><tbody>';
  Object.keys(byD).forEach(function(d){var v=byD[d];gt+=v.tot;gp+=v.cnt;dh+='<tr><td><span class="dchip" style="background:'+v.col+'1a;color:'+v.col+'">'+esc(d)+'</span></td><td class="r">'+v.cnt+'</td><td class="r">'+fC(v.tot)+'</td><td class="r" style="color:var(--green)">'+fC(OP.clients>0?v.tot/OP.clients:0)+'</td></tr>';});
  dh+='<tr class="tf"><td>Total</td><td class="r">'+gp+'</td><td class="r">'+fC(gt)+'</td><td class="r" style="color:var(--green)">'+fC(OP.clients>0?gt/OP.clients:0)+'</td></tr></tbody>';
  document.getElementById('op-pay').innerHTML=dh;
  op_renderCapHealth();
}
function op_addSvc(){idc++;OP.svcs.push({id:idc,name:'New Service',roleName:PAY_ROLES[0]||'',markup:null});op_renderAll();scheduleSave();}
function op_getS(id){return OP.svcs.find(function(x){return x.id===id;})||null;}

var PAY={
  currentMonth:(function(){var d=new Date();var m=d.getMonth()+1;return d.getFullYear()+'-'+(m<10?'0':'')+m;}()),
  employees:[],
  months:{},
  compliance:{},
  roles:['Graphic Designer','Meta Ads','Google Ads','Coordinator + QA','Content Strategist & Writer','Developer','Video Editor','Scheduler','HR','Automations','Sales','Videographer','TikTok Ads'],
  depts:['Client Delivery','Development','Automation & Sales','Management','QA','HR']
};

function pay_load(){
  try{
    var p=JSON.parse(_ls.get(SKP)||'null');
    if(!p)return;
    if(p.employees)PAY.employees=p.employees;
    if(p.months)PAY.months=p.months;
    if(p.compliance)PAY.compliance=p.compliance;
    if(p.currentMonth)PAY.currentMonth=p.currentMonth;
    if(p.roles&&Array.isArray(p.roles)){PAY.roles=p.roles;}
    if(p.depts&&Array.isArray(p.depts)){PAY.depts=p.depts;}
  }catch(e){}
}

function pay_save(){try{_ls.set(SKP,JSON.stringify(PAY));}catch(e){}}

function pay_getME(month,empId){
  if(!PAY.months[month])PAY.months[month]={};
  var key=String(empId);
  if(!PAY.months[month][key])PAY.months[month][key]={bonus:0,advanceDeduct:0,absenceDays:0,otherDeduct:0,paid:false};
  return PAY.months[month][key];
}

function pay_calcEmp(emp,month){
  var me=pay_getME(month,emp.id);
  var base=emp.baseSalary||0;
  var bonus=me.bonus||0;
  var absDeduct=base>0?Math.round(base/30*(me.absenceDays||0)):0;
  var advDeduct=me.advanceDeduct||0;
  var othDeduct=me.otherDeduct||0;
  var gross=base+bonus;
  var totalDeduct=absDeduct+advDeduct+othDeduct;
  var net=gross-totalDeduct;
  return{base:base,bonus:bonus,absDeduct:absDeduct,advDeduct:advDeduct,othDeduct:othDeduct,
    gross:gross,totalDeduct:totalDeduct,net:net,netCAD:net/pkrCad(),paid:!!me.paid};
}

function pay_monthLabel(ym){
  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var p=ym.split('-');return MONTHS[parseInt(p[1],10)-1]+' '+p[0];
}
function pay_shortMonth(ym){
  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var p=ym.split('-');return MONTHS[parseInt(p[1],10)-1];
}

function pay_changeMonth(delta){
  var p=PAY.currentMonth.split('-');
  var d=new Date(+p[0],+p[1]-1+delta,1);
  var m=d.getMonth()+1;
  PAY.currentMonth=d.getFullYear()+'-'+(m<10?'0':'')+m;
  pay_render();scheduleSave();
}

function pay_copyPrev(){
  var p=PAY.currentMonth.split('-');
  var d=new Date(+p[0],+p[1]-2,1);
  var m=d.getMonth()+1;
  var prev=d.getFullYear()+'-'+(m<10?'0':'')+m;
  if(!PAY.months[prev]){alert('No data in '+pay_monthLabel(prev)+' to copy from.');return;}
  if(!PAY.months[PAY.currentMonth])PAY.months[PAY.currentMonth]={};
  var src=PAY.months[prev];
  Object.keys(src).forEach(function(id){
    if(!PAY.months[PAY.currentMonth][id])
      PAY.months[PAY.currentMonth][id]=Object.assign({},src[id],{paid:false});
  });
  pay_render();scheduleSave();
}

function pay_markAllPaid(){
  PAY.employees.filter(function(e){return e.status==='active';}).forEach(function(e){
    pay_getME(PAY.currentMonth,e.id).paid=true;
  });
  pay_render();scheduleSave();
}



// ── Roles & Departments management ──────────────────────────────────────
function pay_syncLists(){
  // Mutate the arrays in-place so all existing references stay valid
  PAY_ROLES.length=0;
  PAY.roles.forEach(function(r){PAY_ROLES.push(r);});
  PAY_DEPTS.length=0;
  PAY.depts.forEach(function(d){PAY_DEPTS.push(d);});
  // Refresh datalist
  var dl=document.getElementById('pay-roles-dl');
  if(dl)dl.innerHTML=PAY.roles.map(function(r){return'<option value="'+esc(r)+'">';}).join('');
  // Refresh dept selects in expanded rows
  document.querySelectorAll('[data-f="dept"]').forEach(function(el){
    if(el.tagName==='SELECT'){
      var cur=el.value;
      el.innerHTML=PAY.depts.map(function(d){return'<option value="'+esc(d)+'"'+(d===cur?' selected':'')+'>'+esc(d)+'</option>';}).join('');
    }
  });
  // Refresh new-employee dept dropdown
  var nd=document.getElementById('pay-new-dept');
  if(nd){var cur2=nd.value;nd.innerHTML=PAY.depts.map(function(d){return'<option value="'+esc(d)+'"'+(d===cur2?' selected':'')+'>'+esc(d)+'</option>';}).join('');}
}

function pay_addRole(){
  var inp=document.getElementById('pay-new-role-inp');
  var val=(inp&&inp.value||'').trim();
  if(!val)return;
  if(PAY.roles.indexOf(val)>=0){inp.value='';return;}
  PAY.roles.push(val);
  pay_syncLists();
  pay_renderRDS();
  scheduleSave();
  if(inp)inp.value='';
}

function pay_delRole(r){
  PAY.roles=PAY.roles.filter(function(x){return x!==r;});
  pay_syncLists();
  pay_renderRDS();
  scheduleSave();
}

function pay_addDept(){
  var inp=document.getElementById('pay-new-dept-inp');
  var val=(inp&&inp.value||'').trim();
  if(!val)return;
  if(PAY.depts.indexOf(val)>=0){inp.value='';return;}
  PAY.depts.push(val);
  
  pay_syncLists();
  pay_renderRDS();
  scheduleSave();
  if(inp)inp.value='';
}

function pay_delDept(d){
  PAY.depts=PAY.depts.filter(function(x){return x!==d;});
  pay_syncLists();
  pay_renderRDS();
  scheduleSave();
}

function pay_toggleRDS(){
  var p=document.getElementById('pay-rds-panel');
  if(p){p.style.display=p.style.display==='none'?'':'none';if(p.style.display!=='none')pay_renderRDS();}
}

function pay_renderRDS(){
  var el=document.getElementById('pay-rds-body');
  if(!el)return;
  function pill(label,delFn){
    return'<span style="display:inline-flex;align-items:center;gap:4px;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:5px;padding:3px 9px;font-size:12px;color:var(--text)">'+esc(label)+'<button onclick="'+delFn+'(\'' +label.replace(/'/g,"\\'")+'\')" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 3px" title="Delete">×</button></span>';
  }
  el.innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">'+
      '<div>'+
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:.625rem">Roles</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:.375rem;margin-bottom:.75rem" id="pay-roles-pills">'+
          PAY.roles.map(function(r){return pill(r,'pay_delRole');}).join('')+
        '</div>'+
        '<div style="display:flex;gap:.375rem">'+
          '<input id="pay-new-role-inp" type="text" placeholder="New role name…" list="pay-roles-dl" '+
          'style="flex:1;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 9px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none" '+
          'onkeydown="if(event.key===\'Enter\')pay_addRole()">'+
          '<button onclick="pay_addRole()" style="background:var(--gbg);color:var(--green);border:.5px solid var(--gbdr);border-radius:5px;padding:5px 12px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600;white-space:nowrap">+ Add</button>'+
        '</div>'+
      '</div>'+
      '<div>'+
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:.625rem">Departments</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:.375rem;margin-bottom:.75rem">'+
          PAY.depts.map(function(d){return pill(d,'pay_delDept');}).join('')+
        '</div>'+
        '<div style="display:flex;gap:.375rem">'+
          '<input id="pay-new-dept-inp" type="text" placeholder="New department name…" '+
          'style="flex:1;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 9px;color:var(--text);font-family:var(--sans);font-size:13px;outline:none" '+
          'onkeydown="if(event.key===\'Enter\')pay_addDept()">'+
          '<button onclick="pay_addDept()" style="background:var(--gbg);color:var(--green);border:.5px solid var(--gbdr);border-radius:5px;padding:5px 12px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600;white-space:nowrap">+ Add</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div style="margin-top:.75rem;font-size:11px;color:var(--dim)">⚠ Deleting a role or department removes it from suggestions only. Employees who already have that value keep it.</div>';
}

// ── Add Employee form ────────────────────────────────────────────────────
function pay_add(){
  var p=document.getElementById('pay-add-panel');
  if(p){
    p.style.display='';
    // Populate dept dropdown with current depts
    var nd=document.getElementById('pay-new-dept');
    if(nd)nd.innerHTML=PAY.depts.map(function(d){return'<option value="'+esc(d)+'">'+esc(d)+'</option>';}).join('');
    setTimeout(function(){var n=document.getElementById('pay-new-name');if(n)n.focus();},50);
  }
}

function pay_addCancel(){
  var p=document.getElementById('pay-add-panel');if(p)p.style.display='none';
  ['pay-new-name','pay-new-role-field','pay-new-salary'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
}

function pay_addConfirm(){
  var name=(document.getElementById('pay-new-name')||{value:''}).value.trim();
  var role=(document.getElementById('pay-new-role-field')||{value:''}).value.trim();
  var dept=(document.getElementById('pay-new-dept')||{value:''}).value;
  var salary=+(document.getElementById('pay-new-salary')||{value:0}).value||0;
  if(!name){document.getElementById('pay-new-name').style.borderColor='var(--red)';return;}
  idc++;
  PAY.employees.push({id:idc,name:name,role:role||PAY.roles[0]||'',dept:dept||PAY.depts[0]||'',baseSalary:salary,type:'Full-time',status:'active'});
  pay_addCancel();
  pay_render();
  op_renderAll();
  scheduleSave();
}

function pay_sortBy(c){_stgl(_S.pay,c);pay_render();}
function cap_sortBy(c){_stgl(_S.cap,c);pay_renderCapacity();}
function comp_sortBy(c){_stgl(_S.comp,c);pay_renderCompliance();}
function rc_sortBy(c){_stgl(_S.rc,c);op_renderAll();}
function svc_sortBy(c){_stgl(_S.svc,c);op_renderAll();}

function pay_toggleEditRow(empId){
  var el=document.getElementById("pay-edit-"+empId);
  if(el){el.style.display=el.style.display==="none"?"table-row":"none";}
}

function pay_getE(id){return PAY.employees.find(function(x){return x.id===id;})||null;}
function pay_getMEById(id){return pay_getME(PAY.currentMonth,id);}

function pay_render(){
  var mo=PAY.currentMonth;
  var search=(document.getElementById('pay-search')||{}).value||'';
  var active=PAY.employees.filter(function(e){return e.status==='active';});
  var today=new Date();var nowYM=today.getFullYear()+'-'+(String(today.getMonth()+1).padStart(2,'0'));
  var isPastMo=mo<nowYM;
  var filtered=PAY.employees.filter(function(e){
    if(!search)return true;
    var q=search.toLowerCase();
    return (e.name||'').toLowerCase().includes(q)||(e.role||'').toLowerCase().includes(q)||(e.dept||'').toLowerCase().includes(q);
  });
  // Payment status filter
  if(_payFilter!=='all'){
    filtered=filtered.filter(function(e){
      var paid=pay_getME(mo,e.id).paid;
      if(_payFilter==='paid')return paid;
      if(_payFilter==='pending')return !paid&&!isPastMo;
      if(_payFilter==='overdue')return !paid&&isPastMo;
      return true;
    });
  }
  // Update filter count badge
  var fcEl=document.getElementById('pay-filter-count');
  if(fcEl)fcEl.textContent=_payFilter==='all'?'':filtered.length+' showing';

  
  var paidCnt=active.filter(function(e){return pay_getME(mo,e.id).paid;}).length;
  setText('pay-month-label',pay_monthLabel(mo));
  setText('pay-month-status',paidCnt+' of '+active.length+' marked paid');
  setText('pay-year-label',mo.split('-')[0]);

  
  var totBase=0,totBonus=0,totAbsD=0,totAdvD=0,totOthD=0,totGross=0,totNet=0;
  active.forEach(function(e){
    var c=pay_calcEmp(e,mo);
    totBase+=c.base;totBonus+=c.bonus;totAbsD+=c.absDeduct;
    totAdvD+=c.advDeduct;totOthD+=c.othDeduct;totGross+=c.gross;totNet+=c.net;
  });

  
  var _kpiRow=document.getElementById('pay-kpis');
  if(_kpiRow){
    _kpiRow.innerHTML=
      mkKpi('Active employees',active.length,'n',PAY.employees.length+' total')+
      '<div class="kpi" style="border-top:2px solid #38bdf8;background:#38bdf80d"><div class="kpi-l">Total gross / mo</div><div class="kpi-v b" style="font-size:20px">'+fPKR(totGross)+'</div><div class="kpi-s">CA$'+Math.round(totGross/pkrCad())+'</div></div>'+
      '<div class="kpi" style="border-top:2px solid #fb7185;background:#fb71850d"><div class="kpi-l">Total deductions</div><div class="kpi-v r" style="font-size:20px">'+fPKR(totAbsD+totAdvD+totOthD)+'</div><div class="kpi-s">Abs + Adv + Other</div></div>'+
      '<div class="kpi" style="border-top:2px solid #00d68f;background:#00d68f0d"><div class="kpi-l">Total net pay</div><div class="kpi-v g" style="font-size:20px">'+fPKR(totNet)+'</div><div class="kpi-s">CA$'+Math.round(totNet/pkrCad())+'</div></div>'+
      mkKpi('Paid status',paidCnt+' / '+active.length,'p',paidCnt===active.length?'✓ All paid':'Pending');
  }

  
  // Generate sortable header
  var thEl=document.getElementById('pay-thead');
  if(thEl)thEl.innerHTML='<tr>'+
    _sth('Employee','name',_S.pay,'pay_sortBy','')+''+
    _sth('Base (PKR)','base',_S.pay,'pay_sortBy','r')+''+
    _sth('Adjustments','adj',_S.pay,'pay_sortBy','')+''+
    _sth('Net Pay (PKR)','net',_S.pay,'pay_sortBy','r')+''+
    _sth('Net (CA$)','cad',_S.pay,'pay_sortBy','r')+''+
    '<th style="min-width:88px">Status</th>'+
    '<th style="min-width:75px">Compliance</th>'+
    '<th style="width:28px"></th>'+
  '</tr>';

  // Sort filtered employees
  filtered=_ssort(filtered,_S.pay,{
    name:function(e){return e.name||'';},
    role:function(e){return e.role||'';},
    dept:function(e){return e.dept||'';},
    base:function(e){return e.baseSalary||0;},
    net:function(e){return pay_calcEmp(e,mo).net;},
    cad:function(e){return pay_calcEmp(e,mo).netCAD;},
    adj:function(e){var c=pay_calcEmp(e,mo);return c.bonus-c.totalDeduct;},
    status:function(e){return pay_getME(mo,e.id).paid?0:1;},
  });

  var html='';
  filtered.forEach(function(e){
    var me=pay_getME(mo,e.id);
    var c=pay_calcEmp(e,mo);
    var dim=e.status!=='active'?'opacity:0.4;':'';
    var col=OP_DCOLS[e.dept]||'#6b7280';
    // Adjustments summary
    var adjB=c.bonus>0?'<span style="color:var(--green);font-weight:600">+'+c.bonus.toLocaleString()+'</span>':'';
    var adjD=c.totalDeduct>0?'<span style="color:var(--red)"> &minus;('+c.totalDeduct.toLocaleString()+')</span>':'';
    var adjSummary=(adjB||adjD)?adjB+adjD:'<span style="color:var(--dim)">—</span>';
    var netColor=c.net>=c.base?'var(--green)':'var(--accent)';
    // Main compact row
    html+=
      '<tr style="'+dim+'">'+
      '<td>'+
        '<div style="font-weight:700;font-size:13px;margin-bottom:4px">'+esc(e.name)+'</div>'+
        '<div style="display:flex;gap:4px;flex-wrap:wrap">'+
          '<span style="font-size:10px;padding:1px 7px;border-radius:3px;background:rgba(255,255,255,.06);color:var(--muted)">'+esc(e.role||'—')+'</span>'+
          '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:'+col+'1a;color:'+col+'">'+esc(e.dept||'—')+'</span>'+
        '</div>'+
      '</td>'+
      '<td class="r">'+
        '<input class="pay-ci mo r" type="number" min="0" step="500" value="'+(e.baseSalary||0)+'" data-pe="'+e.id+'" data-f="baseSalary" style="width:85px;font-size:14px">'+
        '<div style="font-size:11px;color:var(--dim);margin-top:2px;text-align:right">≈ CA$'+Math.round((e.baseSalary||0)/pkrCad())+'</div>'+
      '</td>'+
      '<td>'+
        '<div style="font-family:var(--mono);font-size:12px;margin-bottom:5px">'+adjSummary+'</div>'+
        '<button onclick="pay_toggleEditRow('+e.id+')" style="font-size:11px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:4px;padding:3px 9px;color:var(--muted);cursor:pointer;font-family:var(--sans)">✎ edit</button>'+
      '</td>'+
      '<td class="r">'+
        '<div style="font-family:var(--mono);font-size:15px;font-weight:700;color:'+netColor+'">'+c.net.toLocaleString()+'</div>'+
        '<div style="font-size:11px;color:var(--dim);text-align:right;margin-top:1px">PKR</div>'+
      '</td>'+
      '<td class="r" style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--green)">CA$'+Math.round(c.netCAD)+'</td>'+
      '<td>'+
        '<button data-pm="'+e.id+'" data-f="paid" style="border-radius:5px;border:.5px solid var(--bdr2);padding:4px 11px;cursor:pointer;font-family:var(--mono);font-size:11px;font-weight:500;white-space:nowrap;background:'+(c.paid?'var(--gbg)':isPastMo?'var(--rbg)':'rgba(245,158,11,.12)')+';color:'+(c.paid?'var(--green)':isPastMo?'var(--red)':'var(--accent)')+';border-color:'+(c.paid?'var(--gbdr)':isPastMo?'rgba(239,68,68,.3)':'rgba(245,158,11,.3)')+'">'+(c.paid?'✓ Paid':isPastMo?'🔴 Overdue':'⏳ Pending')+'</button>'+
      '</td>'+
      '<td>'+pay_compBadge(e.id)+'</td>'+
      '<td><button class="del-btn" data-pe="'+e.id+'" data-f="del">×</button></td>'+
      '</tr>'+
      // ── Expandable edit row ──
      '<tr id="pay-edit-'+e.id+'" style="display:none">'+
        '<td colspan="8" style="padding:.875rem 1.25rem 1rem;background:var(--surf3);border-bottom:.5px solid var(--bdr2)">'+
          '<div style="display:flex;gap:1rem;align-items:center;margin-bottom:.875rem;padding-bottom:.75rem;border-bottom:.5px solid var(--bdr2)">'+
          '<div style="flex:1">'+
            '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500">Role</div>'+
            '<input class="pay-ci" type="text" list="pay-roles-dl" value="'+esc(e.role||'')+'" placeholder="Type role…" data-pe="'+e.id+'" data-f="role" '+
            'style="width:100%;font-size:13px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:6px 9px;outline:none">'+
          '</div>'+
          '<div style="flex:1">'+
            '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500">Department</div>'+
            '<select class="pay-sel" data-pe="'+e.id+'" data-f="dept" '+
            'style="width:100%;font-size:13px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:6px 9px;color:var(--text);outline:none">'+
            PAY_DEPTS.map(function(d){return'<option value="'+d+'"'+(d===e.dept?' selected':'')+'>'+d+'</option>';}).join('')+
            '</select>'+
          '</div>'+
          '<div style="font-family:var(--mono);font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;align-self:flex-end;padding-bottom:6px">'+esc(e.name)+' — '+pay_monthLabel(mo)+'</div>'+
        '</div>'+
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:1rem;align-items:start">'+
            '<div>'+
              '<div style="font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500">Bonus (PKR)</div>'+
              '<input class="pay-ci mo" type="number" min="0" step="100" value="'+(me.bonus||0)+'" data-pm="'+e.id+'" data-f="bonus" style="width:100%;font-size:14px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:6px 9px;outline:none">'+
            '</div>'+
            '<div>'+
              '<div style="font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500">Absent Days</div>'+
              '<input class="pay-ci mo" type="number" min="0" max="31" step="0.5" value="'+(me.absenceDays||0)+'" data-pm="'+e.id+'" data-f="absenceDays" style="width:100%;font-size:14px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:6px 9px;outline:none">'+
              '<div style="font-size:11px;color:var(--red);margin-top:4px">− PKR '+c.absDeduct.toLocaleString()+' deducted</div>'+
            '</div>'+
            '<div>'+
              '<div style="font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500">Advance Deduction</div>'+
              '<input class="pay-ci mo" type="number" min="0" step="500" value="'+(me.advanceDeduct||0)+'" data-pm="'+e.id+'" data-f="advanceDeduct" style="width:100%;font-size:14px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:6px 9px;outline:none">'+
            '</div>'+
            '<div>'+
              '<div style="font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500">Other Deductions</div>'+
              '<input class="pay-ci mo" type="number" min="0" step="100" value="'+(me.otherDeduct||0)+'" data-pm="'+e.id+'" data-f="otherDeduct" style="width:100%;font-size:14px;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:6px 9px;outline:none">'+
            '</div>'+
            '<div style="display:flex;flex-direction:column;justify-content:flex-end">'+
              '<div style="font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500">Net Pay</div>'+
              '<div style="font-family:var(--mono);font-size:20px;font-weight:700;color:'+netColor+'">'+c.net.toLocaleString()+'</div>'+
              '<div style="font-size:11px;color:var(--dim);margin-top:3px">'+c.gross.toLocaleString()+' gross − '+c.totalDeduct.toLocaleString()+' deductions</div>'+
            '</div>'+
          '</div>'+
          '<div style="margin-top:.875rem;text-align:right">'+
            '<button onclick="pay_toggleEditRow('+e.id+')" style="background:var(--accent);color:#000;border:none;border-radius:5px;padding:6px 18px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600">Done ✓</button>'+
          '</div>'+
        '</td>'+
      '</tr>';
  });
    var _openRows=[];
  document.querySelectorAll('[id^="pay-edit-"]').forEach(function(el){
    if(el.style.display!=='none')_openRows.push(el.id.replace('pay-edit-',''));
  });
  document.getElementById('pay-body').innerHTML=html;
  _openRows.forEach(function(id){var el=document.getElementById('pay-edit-'+id);if(el)el.style.display='table-row';});

  
    var el=document.getElementById('pay-foot');
  if(el){
    var totDed=totAbsD+totAdvD+totOthD;
    el.innerHTML=
      '<td style="font-weight:700;font-size:13px;padding:.5rem .75rem;border-top:.5px solid var(--bdr2)">'+filtered.length+' employees</td>'+
      '<td class="r" style="font-family:var(--mono);font-size:13px;border-top:.5px solid var(--bdr2)">'+totBase.toLocaleString()+'</td>'+
      '<td style="font-family:var(--mono);font-size:12px;border-top:.5px solid var(--bdr2)">'+
        (totBonus>0?'<span style="color:var(--green)">+'+totBonus.toLocaleString()+'</span>':'')+
        (totDed>0?'<span style="color:var(--red)"> &minus;('+totDed.toLocaleString()+')</span>':'')+
      '</td>'+
      '<td class="r" style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--green);border-top:.5px solid var(--bdr2)">'+totNet.toLocaleString()+'</td>'+
      '<td class="r" style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--green);border-top:.5px solid var(--bdr2)">CA$'+Math.round(totNet/pkrCad())+'</td>'+
      '<td colspan="3" style="border-top:.5px solid var(--bdr2)"></td>';
  }
  

  // By role
  var byRole={};
  active.forEach(function(e){var c=pay_calcEmp(e,mo);if(!byRole[e.role])byRole[e.role]={cnt:0,net:0};byRole[e.role].cnt++;byRole[e.role].net+=c.net;});
  var rh='<thead><tr><th>Role</th><th class="r">Count</th><th class="r">Net / mo</th></tr></thead><tbody>';
  Object.keys(byRole).sort().forEach(function(role){var v=byRole[role];rh+='<tr><td>'+esc(role)+'</td><td class="r">'+v.cnt+'</td><td class="r" style="color:var(--green)">'+fPKR(v.net)+'</td></tr>';});
  rh+='</tbody>';
  var byRoleEl=document.getElementById('pay-by-role');if(byRoleEl)byRoleEl.innerHTML=rh;

  // By dept
  var byDept={};
  active.forEach(function(e){var c=pay_calcEmp(e,mo);if(!byDept[e.dept])byDept[e.dept]={col:OP_DCOLS[e.dept]||'#6b7280',cnt:0,net:0};byDept[e.dept].cnt++;byDept[e.dept].net+=c.net;});
  var dh='<thead><tr><th>Dept</th><th class="r">Count</th><th class="r">Net / mo</th></tr></thead><tbody>';
  Object.keys(byDept).sort().forEach(function(dept){var v=byDept[dept];dh+='<tr><td><span class="dchip" style="background:'+v.col+'1a;color:'+v.col+'">'+esc(dept)+'</span></td><td class="r">'+v.cnt+'</td><td class="r" style="color:var(--green)">'+fPKR(v.net)+'</td></tr>';});
  dh+='</tbody>';
  var byDeptEl=document.getElementById('pay-by-dept');if(byDeptEl)byDeptEl.innerHTML=dh;

  // Year overview
  var year=mo.split('-')[0];
  var MSHORT=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var yh='<thead><tr><th>Month</th><th class="r">Gross</th><th class="r">Deductions</th><th class="r">Net Pay</th><th class="r">Paid</th></tr></thead><tbody>';
  for(var mi=1;mi<=12;mi++){
    var mStr=year+'-'+(mi<10?'0':'')+mi;
    var mGross=0,mDeduct=0,mNet=0,mPaid=0;
    active.forEach(function(e){var c=pay_calcEmp(e,mStr);mGross+=c.gross;mDeduct+=c.totalDeduct;mNet+=c.net;if(c.paid)mPaid++;});
    var isCur=mStr===mo;
    var hasData=mGross>0||!!PAY.months[mStr];
    yh+='<tr style="'+(isCur?'background:var(--surf3)':'')+'">'+
      '<td style="color:'+(isCur?'var(--accent)':'var(--muted)')+'">'+MSHORT[mi-1]+(isCur?' ←':'')+'</td>'+
      '<td class="r" style="color:var(--muted)">'+(hasData?mGross.toLocaleString():'—')+'</td>'+
      '<td class="r" style="color:'+(mDeduct>0?'var(--red)':'var(--dim)')+'">'+(mDeduct>0?'('+mDeduct.toLocaleString()+')':'—')+'</td>'+
      '<td class="r" style="color:'+(mNet>0?'var(--green)':'var(--dim)')+'">'+(mNet>0?mNet.toLocaleString():'—')+'</td>'+
      '<td class="r" style="font-size:11px;color:var(--muted)">'+(hasData?mPaid+'/'+active.length:'')+'</td>'+
    '</tr>';
  }
  yh+='</tbody>';
  var pyEl=document.getElementById('pay-year');if(pyEl)pyEl.innerHTML=yh;
  pay_renderCompliance();
}

function ov_render(){
  var r=ue_calc();
  var opTotalPay=PAY.employees.filter(function(e){return e.status==='active';}).reduce(function(a,e){return a+(e.baseSalary||0)/pkrCad();},0);
  var activeEmp=PAY.employees.filter(function(e){return e.status==='active';});
  var payNetPKR=activeEmp.reduce(function(a,e){return a+pay_calcEmp(e,PAY.currentMonth).net;},0);
  var payTotalCAD=payNetPKR/pkrCad();
  var ue_el=document.getElementById('ov-ue');
  if(ue_el)ue_el.innerHTML='<div><div class="ovs-v">'+fC(r.net)+'</div><div class="ovs-l">Net/mo</div></div><div><div class="ovs-v">'+fC(r.blend)+'</div><div class="ovs-l">Avg price</div></div><div><div class="ovs-v">'+(isFinite(r.be)?r.be:'∞')+'</div><div class="ovs-l">Break-even</div></div>';
  var op_el=document.getElementById('ov-op');
  if(op_el)op_el.innerHTML='<div><div class="ovs-v">'+fC(opTotalPay)+'</div><div class="ovs-l">Payroll</div></div><div><div class="ovs-v">'+OP.clients+'</div><div class="ovs-l">Clients</div></div><div><div class="ovs-v">'+OP.markup+'%</div><div class="ovs-l">Markup</div></div>';
  var pay_el=document.getElementById('ov-pay');
  if(pay_el)pay_el.innerHTML='<div><div class="ovs-v">'+activeEmp.length+'</div><div class="ovs-l">Active</div></div><div><div class="ovs-v">'+fC(payTotalCAD)+'</div><div class="ovs-l">Total/mo</div></div>';
  var ov_kpis=document.getElementById('ov-kpis');
  if(ov_kpis)ov_kpis.innerHTML=
    mkKpi('Website net/mo',fC(r.net),r.net>0?'g':'r',r.margin.toFixed(1)+'% margin')+
    mkKpi('Agency payroll',fC(opTotalPay),'n',OP.svcs.length+' services')+
    mkKpi('HR payroll/mo',fC(payTotalCAD),'p',activeEmp.length+' employees')+
    mkKpi('Break-even',isFinite(r.be)?r.be+'/mo':'∞',r.vol>=r.be?'g':'a','Closing '+r.vol+'/mo');
  var mx=Math.max(r.rev,1),rows='';
  rows+=plR('Revenue',r.rev,mx,true);rows+=plD();
  rows+=plR('Variable costs',-r.tVar,mx,false,false,true);
  rows+=plR('Fixed costs',-r.tFix,mx,false,false,true);rows+=plD();
  rows+=plR('Net profit',r.net,mx,true,true);
  var ov_pl=document.getElementById('ov-pl');if(ov_pl)ov_pl.innerHTML=rows;
  var byDeptOv={};
  activeEmp.forEach(function(e){var c=pay_calcEmp(e,PAY.currentMonth);if(!byDeptOv[e.dept])byDeptOv[e.dept]={col:OP_DCOLS[e.dept]||'#6b7280',cnt:0,net:0};byDeptOv[e.dept].cnt++;byDeptOv[e.dept].net+=c.net;});
  var pb='';
  Object.keys(byDeptOv).sort().forEach(function(d){var v=byDeptOv[d];pb+='<tr><td><span class="dchip" style="background:'+v.col+'1a;color:'+v.col+'">'+esc(d)+'</span></td><td class="r">'+v.cnt+'</td><td class="r" style="color:var(--green)">'+fC(v.net/pkrCad())+'</td></tr>';});
  var ov_pb=document.getElementById('ov-pay-body');if(ov_pb)ov_pb.innerHTML=pb;
  var dot,title,body;
  if(r.net<0){dot='var(--red)';title='Website business needs more volume';body='Need <strong>'+(isFinite(r.be)?r.be:'∞')+' sites/mo</strong> to break even (closing '+r.vol+'). Agency payroll <strong>'+fC(opTotalPay)+'/mo</strong>. HR payroll <strong>'+fC(payTotalCAD)+'/mo</strong>.';}
  else{dot='var(--green)';title='Business running — '+activeEmp.length+' people, '+r.vol+' sites/mo';body='Website profit <strong>'+fC(r.net)+'/mo</strong> · Agency payroll <strong>'+fC(opTotalPay)+'/mo</strong> · '+activeEmp.length+' active employees costing <strong>'+fC(payTotalCAD)+'/mo</strong>.';}
  var ov_v=document.getElementById('ov-verdict');if(ov_v)ov_v.innerHTML='<div class="vhd"><div class="vdot" style="background:'+dot+';box-shadow:0 0 6px '+dot+'55"></div><div class="vtitle">'+title+'</div></div><div class="vbody">'+body+'</div>';
}

var AI_HIST=[];
var AI_SUGGESTIONS=[
  'Am I profitable right now?',
  'What should I charge for Social Media + Meta Ads?',
  'How much does my team cost per month in CAD?',
  'What is my break-even number of websites per month?',
  'Which service is most profitable?',
  'How much profit per website at current volume?',
  'If I hire one more developer at PKR 40,000, how does it affect pricing?',
  'What is the cheapest package I can offer and still make money?',
];

function ai_buildContext(){
  var r=ue_calc();
  var opTotalPay=PAY.employees.filter(function(e){return e.status==='active';}).reduce(function(a,e){return a+(e.baseSalary||0)/pkrCad();},0);
  var activeEmp=PAY.employees.filter(function(e){return e.status==='active';});
  var payNetPKR=activeEmp.reduce(function(a,e){return a+pay_calcEmp(e,PAY.currentMonth).net;},0);
  var payTotalCAD=payNetPKR/pkrCad();
  var svcLines=OP.svcs.map(function(s){var c=op_svcCost(s),p=op_price(s);return s.name+': cost '+fC(c)+'/mo, price '+fC(p)+'/mo';}).join('\n');
  var roleLines=Object.entries(op_roleGroups()).map(function(kv){var nm=kv[0],g=kv[1];var load=OP.roleLoads[nm]||10;var cad=g.totalPKR/pkrCad();return nm+' ('+g.people.length+' staff) @ '+fC(cad)+'/mo, '+fC(load>0?cad/load:0)+'/client';}).join('\n');
  var empLines=activeEmp.map(function(e){return e.name+' ('+e.role+', '+e.dept+')';}).join(', ');
  return'You are the AI business advisor for Bizz1 Digital, a Pakistani digital marketing agency serving Canadian clients. Be concise, specific, always reference actual numbers.\n\n'+
    '=== UNIT ECONOMICS ===\n'+
    'Standard website: '+fC(UE.price)+'  Upsell: '+fC(UE.uprice)+'\n'+
    'Meta ads: CA$'+UE.meta+'/day  Websites closed/mo: '+UE.vol+'\n'+
    'Monthly revenue: '+fC(r.rev)+'  Net profit: '+fC(r.net)+' ('+r.margin.toFixed(1)+'%)\n'+
    'Break-even: '+(isFinite(r.be)?r.be+' sites/mo':'∞')+'\n\n'+
    '=== RATE CARD ===\n'+
    'Clients: '+OP.clients+'  Markup: '+OP.markup+'%  Total payroll: '+fC(opTotalPay)+'/mo\n'+
    'Exchange: 1 CAD = '+Math.round(pkrCad())+' PKR  (1 USD = CA$'+CFG.usdcad+')\n'+
    'ROLES:\n'+roleLines+'\n\nSERVICES:\n'+svcLines+'\n\n'+
    '=== HR PAYROLL ===\n'+
    'Active employees: '+activeEmp.length+'  Net payroll: '+fC(payTotalCAD)+'/mo (PKR '+Math.round(payNetPKR).toLocaleString()+')\n'+
    'Team: '+empLines;
}

function ai_initSuggestions(){
  var el=document.getElementById('ai-suggs');
  if(el)el.innerHTML=AI_SUGGESTIONS.map(function(s){return'<button class="sugg" onclick="ai_sendText(\''+s.replace(/'/g,"\\'")+'\')">'+(s.length>45?s.slice(0,45)+'…':s)+'</button>';}).join('');
  var r=ue_calc();
  var activeEmp=PAY.employees.filter(function(e){return e.status==='active';}).length;
  var opPay=PAY.employees.filter(function(e){return e.status==='active';}).reduce(function(a,e){return a+(e.baseSalary||0)/pkrCad();},0);
  var ctx=document.getElementById('ai-ctx-summary');
  if(ctx)ctx.innerHTML='<strong style="color:var(--text)">Live data loaded:</strong><br>'+
    '● Websites: '+fC(r.rev)+'/mo revenue · '+fC(r.net)+'/mo net<br>'+
    '● Rate Card: '+OP.svcs.length+' services · '+fC(opPay)+'/mo payroll<br>'+
    '● Payroll: '+activeEmp+' active employees · 1 CAD ≈ '+Math.round(pkrCad())+' PKR<br>'+
    '<span style="color:var(--dim)">Ask anything — AI reads all your current numbers.</span>';
  if(AI_HIST.length===0){
    ai_appendMsg('ai','👋 Hi! I\'m your Bizz1 business advisor. I have access to all your dashboards right now. Ask me anything about pricing, profitability, or team costs.');
  }
}

function ai_appendMsg(role,text){
  var msgs=document.getElementById('ai-msgs');if(!msgs)return;
  var div=document.createElement('div');
  div.className='msg '+role;
  var time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  div.innerHTML='<div class="msg-bubble">'+text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')+'</div><div class="msg-time">'+(role==='user'?'You':'AI Advisor')+' · '+time+'</div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}

function ai_showTyping(){
  var msgs=document.getElementById('ai-msgs');if(!msgs)return null;
  var div=document.createElement('div');
  div.className='msg ai';div.id='ai-typing';
  div.innerHTML='<div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
  return div;
}

async function ai_send(){
  var input=document.getElementById('ai-input');
  var text=(input.value||'').trim();
  if(!text)return;
  ai_sendText(text);input.value='';
}

async function ai_sendText(text){
  ai_appendMsg('user',text);
  AI_HIST.push({role:'user',content:text});
  var btn=document.getElementById('ai-send-btn');if(btn)btn.disabled=true;
  var typingEl=ai_showTyping();
  try{
    var res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:ai_buildContext(),messages:AI_HIST})
    });
    var data=await res.json();
    var reply=(data.content&&data.content[0]&&data.content[0].text)||'Sorry, could not get a response.';
    if(typingEl)typingEl.remove();
    AI_HIST.push({role:'assistant',content:reply});
    ai_appendMsg('ai',reply);
  }catch(e){
    if(typingEl)typingEl.remove();
    ai_appendMsg('ai','⚠️ Connection error. Host this on a server (Netlify etc.) for the AI to work.');
  }
  if(btn)btn.disabled=false;
}

function ai_clear(){AI_HIST=[];var msgs=document.getElementById('ai-msgs');if(msgs)msgs.innerHTML='';ai_initSuggestions();}

// ── BIZ (P&L Model) ───────────────────────────────────────────────────────
var BIZ_STORE='b1_biz_v1';
var BIZ_DEF_MKT=[{label:'Meta Ads (own)',value:0,currency:'USD'}];
var BIZ_DEF_CLIENTS=[
  {name:'Haven Tint & Tire',price:0,currency:'CAD'},{name:'Haven Customs',price:0,currency:'CAD'},
  {name:'Daana Paani',price:0,currency:'CAD'},{name:'Hands That Heal',price:0,currency:'CAD'},
  {name:'Residential Energy Savings',price:0,currency:'CAD'},{name:'JP Home Comfort',price:0,currency:'CAD'},
  {name:'Phantom Auto Center',price:0,currency:'CAD'},{name:'Royal Pizza and Sub',price:0,currency:'CAD'},
  {name:'CanITSM',price:0,currency:'CAD'},{name:'Horizon Drivers',price:0,currency:'CAD'},
  {name:'UR Aero Tech',price:0,currency:'CAD'},{name:'Elite Sales Partner',price:0,currency:'CAD'},
  {name:'Friends Ampoules',price:0,currency:'CAD'},{name:'CAIF',price:0,currency:'CAD'},
  {name:'Black Trucks',price:0,currency:'CAD'},{name:'Ali Motors',price:0,currency:'CAD'},
  {name:'Global Pardon',price:0,currency:'CAD'},{name:'A1 Furnished Home',price:0,currency:'CAD'},
  {name:'Sunset Retreat',price:0,currency:'CAD'},{name:'Pizzeria N Sub',price:0,currency:'CAD'},
];
var SB={month:'2026-05',mkt:BIZ_DEF_MKT.map(function(x){return Object.assign({},x);}),varCosts:[],clients:BIZ_DEF_CLIENTS.map(function(x){return Object.assign({},x);}),months:{}};
var _bizToastT,_bizSaveT;

function BG(id){return document.getElementById(id);}
function bCad(n,d){var a=Math.abs(n),s;if(d!==undefined){s='CA$'+a.toFixed(d);}else if(a>=10000){s='CA$'+(a/1000).toFixed(1)+'k';}else{s='CA$'+Math.round(a);}return n<0?'-'+s:s;}
function bToCAD(v,curr){if(curr==='USD')return v*CFG.usdcad;if(curr==='PKR')return v/pkrCad();return v;}
function bizGetStore(){try{return JSON.parse(_ls.get(BIZ_STORE))||{};}catch(e){return{};}}
function bizPutStore(s){try{_ls.set(BIZ_STORE,JSON.stringify(s));}catch(e){}}
function bizShowToast(){var t=BG('biz-toast');if(t){t.classList.add('show');clearTimeout(_bizToastT);_bizToastT=setTimeout(function(){t.classList.remove('show');},1800);}}
function bizDSave(){clearTimeout(_bizSaveT);_bizSaveT=setTimeout(bizSave,700);}

function bizCapture(){return{wsPrice:+(BG('biz-ws-price')||{}).value||109,wsQty:+(BG('biz-ws-qty')||{}).value||0,wuPrice:+(BG('biz-wu-price')||{}).value||207,wuQty:+(BG('biz-wu-qty')||{}).value||0,retNew:+(BG('biz-ret-new')||{}).value||0,payroll:+(BG('biz-payroll')||{}).value||0,subs:+(BG('biz-subs')||{}).value||0,vid:+(BG('biz-vid')||{}).value||0,newClients:+(BG('biz-new-clients')||{}).value||30,retMonths:+(BG('biz-ret-months')||{}).value||12,conv:+(BG('biz-conv')||{}).value||20,churn:+(BG('biz-churn')||{}).value||10,proj:bCollectProjRows()};}
function bizRestore(md){
  function sv(id,v){var e=BG(id);if(e&&v!==undefined)e.value=v;}
  sv('biz-ws-price',md.wsPrice);sv('biz-ws-qty',md.wsQty);sv('biz-wu-price',md.wuPrice);sv('biz-wu-qty',md.wuQty);
  sv('biz-ret-new',md.retNew);sv('biz-payroll',md.payroll);sv('biz-subs',md.subs);sv('biz-vid',md.vid);
  sv('biz-new-clients',md.newClients);sv('biz-ret-months',md.retMonths);sv('biz-conv',md.conv);sv('biz-churn',md.churn);
  if(md.proj&&Array.isArray(md.proj))bRenderProjRows(md.proj);else{var e=BG('biz-proj-rows');if(e)e.innerHTML='';}
}
function bizSave(){
  try{
    SB.mkt=bCollectCostRows('biz-mkt');SB.varCosts=bCollectCostRows('biz-var');SB.clients=bCollectClientRows();
    var snap=bizCapture();var store=bizGetStore();
    store.mkt=SB.mkt;store.varCosts=SB.varCosts;store.clients=SB.clients;
    if(!store.months)store.months={};store.months[SB.month]=snap;
    bizPutStore(store);bizShowToast();
  }catch(e){}
}
function bizLoad(){
  try{
    var store=bizGetStore();
    if(store.mkt)SB.mkt=store.mkt;if(store.varCosts)SB.varCosts=store.varCosts;
    if(store.clients)SB.clients=store.clients;if(store.months)SB.months=store.months;
    var md=SB.months[SB.month];if(md)bizRestore(md);
  }catch(e){}
}
function bizSwitchMonth(m){
  bizSave();SB.month=m;var store=bizGetStore();SB.months=store.months||{};
  var md=SB.months[m];
  if(md){bizRestore(md);}
  else{['biz-ws-qty','biz-wu-qty','biz-ret-new','biz-new-clients'].forEach(function(id){var e=BG(id);if(e)e.value=0;});var pr=BG('biz-proj-rows');if(pr)pr.innerHTML='';}
  bizRecalc();
}

function bBuildCostRow(type,label,value,currency){
  currency=currency||'USD';var d=document.createElement('div');d.className='birow '+type+'-row';
  var opts=['USD','CAD','PKR'].map(function(c){return'<option'+(c===currency?' selected':'')+'>'+c+'</option>';}).join('');
  d.innerHTML='<input class="birow-name-input" type="text" value="'+esc(label)+'" placeholder="Label">'+'<select class="birow-curr-sel bcost-curr">'+opts+'</select>'+'<input class="bnum-input bcost-val" type="number" value="'+value+'" min="0" step="1">'+'<span class="birow-eq bcost-eq"></span>'+'<button class="birow-del" onclick="bDelRow(this)">×</button>';
  d.querySelectorAll('input,select').forEach(function(i){i.addEventListener('input',function(){bUpdateCostEq(d);bizRecalc();bizDSave();});});
  bUpdateCostEq(d);return d;
}
function bUpdateCostEq(d){var v=+(d.querySelector('.bcost-val')||{}).value||0;var c=(d.querySelector('.bcost-curr')||{}).value||'CAD';var eq=d.querySelector('.bcost-eq');if(eq)eq.textContent=c!=='CAD'?'≈'+bCad(bToCAD(v,c)):'';}
function bRenderCostRows(type,data){var c=BG(type+'-rows');if(!c)return;c.innerHTML='';data.forEach(function(r){c.appendChild(bBuildCostRow(type,r.label,r.value,r.currency||'USD'));});}
function bAddCostRow(type){var c=BG(type+'-rows');if(c){c.appendChild(bBuildCostRow(type,'',0,'USD'));bizRecalc();bizDSave();}}
function bCollectCostRows(type){return Array.from(document.querySelectorAll('.'+type+'-row')).map(function(r){return{label:(r.querySelector('.birow-name-input')||{}).value||'',value:+(r.querySelector('.bcost-val')||{}).value||0,currency:(r.querySelector('.bcost-curr')||{}).value||'USD'};});}
function bSumCostRows(sel){var t=0;document.querySelectorAll(sel).forEach(function(r){var v=+(r.querySelector('.bcost-val')||{}).value||0;var c=(r.querySelector('.bcost-curr')||{}).value||'CAD';t+=bToCAD(v,c);});return t;}
function bBuildProjRow(label,value,currency){
  currency=currency||'CAD';var d=document.createElement('div');d.className='birow biz-proj-row';
  var opts=['CAD','USD','PKR'].map(function(c){return'<option'+(c===currency?' selected':'')+'>'+c+'</option>';}).join('');
  d.innerHTML='<input class="birow-name-input" type="text" value="'+esc(label)+'" placeholder="Job name">'+'<select class="birow-curr-sel bproj-curr">'+opts+'</select>'+'<input class="bnum-input bproj-val" type="number" value="'+value+'" min="0">'+'<span class="birow-eq bproj-eq"></span>'+'<button class="birow-del" onclick="bDelRow(this)">×</button>';
  d.querySelectorAll('input,select').forEach(function(i){i.addEventListener('input',function(){bUpdateProjEq(d);bizRecalc();bizDSave();});});
  bUpdateProjEq(d);return d;
}
function bUpdateProjEq(d){var v=+(d.querySelector('.bproj-val')||{}).value||0;var c=(d.querySelector('.bproj-curr')||{}).value||'CAD';var eq=d.querySelector('.bproj-eq');if(eq)eq.textContent=c!=='CAD'?'≈'+bCad(bToCAD(v,c)):'';}
function bAddProjRow(){var c=BG('biz-proj-rows');if(c){c.appendChild(bBuildProjRow('',0,'CAD'));bizRecalc();bizDSave();}}
function bRenderProjRows(data){var c=BG('biz-proj-rows');if(!c)return;c.innerHTML='';data.forEach(function(r){c.appendChild(bBuildProjRow(r.label||'',r.value||0,r.currency||'CAD'));});}
function bCollectProjRows(){return Array.from(document.querySelectorAll('.biz-proj-row')).map(function(r){return{label:(r.querySelector('.birow-name-input')||{}).value||'',value:+(r.querySelector('.bproj-val')||{}).value||0,currency:(r.querySelector('.bproj-curr')||{}).value||'CAD'};});}
function bDelRow(btn){btn.closest('.birow').remove();bizRecalc();bizDSave();}
function bBuildClientRow(name,price,currency){
  name=name||'';price=price||0;currency=currency||'CAD';var d=document.createElement('div');d.className='birow bclient-row';
  var opts=['CAD','USD'].map(function(c){return'<option'+(c===currency?' selected':'')+'>'+c+'</option>';}).join('');
  d.innerHTML='<input class="birow-name-input" type="text" value="'+esc(name)+'" placeholder="Client name" style="flex:1;min-width:110px">'+'<select class="birow-curr-sel bclient-curr">'+opts+'</select>'+'<input class="bnum-input bclient-val" type="number" value="'+price+'" min="0" step="50" style="width:100px">'+'<span class="birow-eq bclient-eq" style="min-width:50px;text-align:right;font-size:11px;color:#00c9b1"></span>'+'<button class="birow-del" onclick="bDelRow(this)">×</button>';
  d.querySelectorAll('input,select').forEach(function(i){i.addEventListener('input',function(){bUpdateClientEq(d);bizRecalc();bizDSave();});});
  bUpdateClientEq(d);return d;
}
function bUpdateClientEq(d){var v=+(d.querySelector('.bclient-val')||{}).value||0;var c=(d.querySelector('.bclient-curr')||{}).value||'CAD';var eq=d.querySelector('.bclient-eq');if(!eq)return;eq.textContent=c!=='CAD'?'≈'+bCad(bToCAD(v,c))+'/mo':(v>0?'/mo':'');}
function bAddClientRow(){var c=BG('biz-client-rows');if(c){c.appendChild(bBuildClientRow());bizRecalc();bizDSave();}}
function bRenderClientRows(data){var c=BG('biz-client-rows');if(!c)return;c.innerHTML='';data.forEach(function(r){c.appendChild(bBuildClientRow(r.name||r.label,r.price||r.value,r.currency||'CAD'));});}
function bCollectClientRows(){return Array.from(document.querySelectorAll('.bclient-row')).map(function(r){return{name:(r.querySelector('.birow-name-input')||{}).value||'',price:+(r.querySelector('.bclient-val')||{}).value||0,currency:(r.querySelector('.bclient-curr')||{}).value||'CAD'};});}
function bSumClientRows(){var t=0;document.querySelectorAll('.bclient-row').forEach(function(r){var v=+(r.querySelector('.bclient-val')||{}).value||0;var c=(r.querySelector('.bclient-curr')||{}).value||'CAD';t+=bToCAD(v,c);});return t;}

function bizRecalc(){
  if(!BG('biz-ws-price'))return;
  var wsPrice=+(BG('biz-ws-price')||{}).value||0,wsQty=+(BG('biz-ws-qty')||{}).value||0;
  var wuPrice=+(BG('biz-wu-price')||{}).value||0,wuQty=+(BG('biz-wu-qty')||{}).value||0;
  var retNew=+(BG('biz-ret-new')||{}).value||0;
  var retRev=bSumClientRows(),retCount=document.querySelectorAll('.bclient-row').length;
  var retAvg=retCount>0?retRev/retCount:0;
  var badge=BG('biz-ret-badge');
  if(badge){if(retCount>0)badge.innerHTML='<span style="background:rgba(0,201,177,.12);border:.5px solid rgba(0,201,177,.25);border-radius:4px;padding:1px 7px;font-size:11px">'+retCount+' client'+(retCount>1?'s':'')+' · <strong style="color:#00c9b1">'+bCad(retRev)+'</strong> MRR</span>';else badge.textContent='';}
  document.querySelectorAll('.bclient-row').forEach(bUpdateClientEq);
  var webRev=wsQty*wsPrice+wuQty*wuPrice;
  var projRev=Array.from(document.querySelectorAll('.biz-proj-row')).reduce(function(s,r){return s+bToCAD(+(r.querySelector('.bproj-val')||{}).value||0,(r.querySelector('.bproj-curr')||{}).value||'CAD');},0);
  var totalRev=webRev+retRev+projRev,totalCloses=wsQty+wuQty,avgWebRev=totalCloses>0?webRev/totalCloses:0;
  if(BG('biz-ws-total'))BG('biz-ws-total').textContent='CA$'+Math.round(wsQty*wsPrice);
  if(BG('biz-wu-total'))BG('biz-wu-total').textContent='CA$'+Math.round(wuQty*wuPrice);
  if(BG('biz-rev-total'))BG('biz-rev-total').textContent=bCad(webRev+retRev);
  if(BG('biz-proj-total'))BG('biz-proj-total').textContent=bCad(projRev);
  var payroll=+(BG('biz-payroll')||{}).value||0,subs=+(BG('biz-subs')||{}).value||0,vid=+(BG('biz-vid')||{}).value||0;
  var mktCost=bSumCostRows('.biz-mkt-row'),varCost=bSumCostRows('.biz-var-row');
  document.querySelectorAll('.biz-mkt-row,.biz-var-row').forEach(bUpdateCostEq);
  document.querySelectorAll('.biz-proj-row').forEach(bUpdateProjEq);
  var fixedCost=payroll+subs+vid,totalCost=fixedCost+mktCost+varCost,netProfit=totalRev-totalCost;
  if(BG('biz-fixed-total'))BG('biz-fixed-total').textContent=bCad(fixedCost);
  if(BG('biz-mkt-total'))BG('biz-mkt-total').textContent=bCad(mktCost);
  if(BG('biz-var-total'))BG('biz-var-total').textContent=bCad(varCost);
  var newClients=+(BG('biz-new-clients')||{}).value||1;
  var cac=mktCost/Math.max(newClients,1),cacWeb=totalCloses>0?mktCost/totalCloses:0,cacRet=retNew>0?mktCost/retNew:null;
  if(BG('biz-cac-val'))BG('biz-cac-val').textContent=bCad(cac);
  if(BG('biz-cac-sub'))BG('biz-cac-sub').textContent='per new client ('+newClients+' this month)';
  if(BG('biz-cac-spend'))BG('biz-cac-spend').textContent=bCad(mktCost);
  if(BG('biz-cac-clients'))BG('biz-cac-clients').textContent=newClients;
  if(BG('biz-cac-web'))BG('biz-cac-web').textContent=bCad(cacWeb);
  if(BG('biz-cac-ret'))BG('biz-cac-ret').textContent=cacRet!==null?bCad(cacRet):'—';
  var cacIns=cac<50?'<strong>Very efficient.</strong> '+bCad(cac)+' CAC is low.':cac<150?'<strong>Reasonable CAC</strong> at '+bCad(cac)+'.':'<strong>High CAC</strong> at '+bCad(cac)+'. Review ad spend.';
  if(BG('biz-cac-insight'))BG('biz-cac-insight').innerHTML=cacIns;
  var retMonths=+(BG('biz-ret-months')||{}).value||12,convRate=((+(BG('biz-conv')||{}).value||0)/100),churn=((+(BG('biz-churn')||{}).value||0)/100);
  var adjMonths=churn>0?Math.min(retMonths,1/churn*12):retMonths;
  if(BG('biz-ret-months-lbl'))BG('biz-ret-months-lbl').textContent=retMonths+' months';
  if(BG('biz-conv-lbl'))BG('biz-conv-lbl').textContent=(BG('biz-conv')||{value:20}).value+'%';
  if(BG('biz-churn-lbl'))BG('biz-churn-lbl').textContent=(BG('biz-churn')||{value:10}).value+'%';
  var ltvWebOnly=avgWebRev,ltvRetFull=avgWebRev+retAvg*adjMonths,ltvBlended=ltvWebOnly*(1-convRate)+ltvRetFull*convRate;
  if(BG('biz-ltv-val'))BG('biz-ltv-val').textContent=bCad(ltvBlended);
  if(BG('biz-ltv-web'))BG('biz-ltv-web').textContent=bCad(ltvWebOnly);
  if(BG('biz-ltv-ret'))BG('biz-ltv-ret').textContent=bCad(ltvRetFull);
  if(BG('biz-ltv-blended'))BG('biz-ltv-blended').textContent=bCad(ltvBlended);
  var ratio=cac>0?ltvBlended/cac:0,ratioStr=ratio>=10?'10:1+':ratio.toFixed(1)+':1';
  if(BG('biz-ratio-badge'))BG('biz-ratio-badge').textContent=ratioStr;
  var gaugePos=Math.min(100,(ratio/10)*100);
  if(BG('biz-gauge-marker'))BG('biz-gauge-marker').style.left=gaugePos+'%';
  var rColor,rZone,rIns;
  if(ratio>=5){rColor='#00db88';rZone='🟢 Excellent';rIns='At <strong>'+ratioStr+'</strong>, you get '+ratio.toFixed(1)+'× back per CA$ spent.';}
  else if(ratio>=3){rColor='#00c9b1';rZone='🟡 Healthy — above 3:1';rIns='<strong>'+ratioStr+'</strong> is above the standard benchmark.';}
  else if(ratio>=1){rColor='#f0ab38';rZone='🟠 Marginal — below 3:1';rIns='Increase retainer conversion or reduce CAC.';}
  else{rColor='#ff5252';rZone='🔴 Unsustainable';rIns='Spending more to acquire than clients generate.';}
  if(BG('biz-ratio-badge')){BG('biz-ratio-badge').style.background=rColor+'22';BG('biz-ratio-badge').style.color=rColor;}
  if(BG('biz-ratio-zone')){BG('biz-ratio-zone').style.color=rColor;BG('biz-ratio-zone').textContent=rZone;}
  if(BG('biz-ratio-insight')){BG('biz-ratio-insight').className='binsight'+(ratio<1?' danger':ratio<3?' warn':'');BG('biz-ratio-insight').innerHTML=rIns;}
  var maxRev=Math.max(webRev,retRev,projRev,1);
  if(BG('biz-svc-bars'))BG('biz-svc-bars').innerHTML=[{name:'Websites',val:webRev,color:'#4aadff'},{name:'Retainers',val:retRev,color:'#00c9b1'},{name:'One-time',val:projRev,color:'#a78bfa'}].map(function(s){return'<div class="bsvc-row"><div class="bsvc-dot" style="background:'+s.color+'"></div><div class="bsvc-name">'+s.name+'</div><div class="bsvc-bar-wrap"><div class="bsvc-bar" style="width:'+(s.val/maxRev*100).toFixed(1)+'%;background:'+s.color+'"></div></div><div class="bsvc-val" style="color:'+s.color+'">'+bCad(s.val)+'</div><div class="bsvc-margin">'+(totalRev>0?Math.round(s.val/totalRev*100)+'%':'')+'</div></div>';}).join('');
  var opc=totalCloses+retCount>0?fixedCost/(totalCloses+retCount):0;
  if(BG('biz-unit-econ'))BG('biz-unit-econ').innerHTML=[{name:'Per website close',rev:avgWebRev,cost:opc+cacWeb,margin:avgWebRev-opc-cacWeb,color:'#4aadff'},{name:'Per retainer/month',rev:retAvg,cost:opc,margin:retAvg-opc,color:'#00c9b1'}].map(function(u){return'<div style="margin-bottom:.75rem"><div style="font-size:11px;color:var(--dim);margin-bottom:4px">'+u.name+'</div><div style="display:flex;gap:8px;align-items:baseline"><span style="font-family:var(--mono);font-size:18px;font-weight:600;color:'+(u.margin>=0?u.color:'#ff5252')+'">'+bCad(u.margin)+'</span><span style="font-size:11px;color:var(--muted)">margin</span></div><div style="font-size:11px;color:var(--dim);margin-top:2px">Rev '+bCad(u.rev)+' − costs '+bCad(u.cost)+'</div></div>';}).join('');
  var mrr=retRev;
  if(BG('biz-kpi-strip'))BG('biz-kpi-strip').innerHTML=[{l:'Total Revenue',v:bCad(totalRev),s:'This month',c:'c-tx',hl:'#38bdf8'},{l:'MRR',v:bCad(mrr),s:retCount+' retainer clients',c:'c-teal'},{l:'Net Profit',v:bCad(netProfit),s:(totalRev>0?(netProfit/totalRev*100).toFixed(1)+'% margin':'—'),c:netProfit>=0?'c-green':'c-red',hl:netProfit>=0?'#00d68f':'#fb7185'},{l:'CAC',v:bCad(cac),s:'per new client',c:'c-amber'},{l:'Blended LTV',v:bCad(ltvBlended),s:'per acquired client',c:'c-teal'},{l:'LTV:CAC',v:ratioStr,s:rZone,c:ratio>=3?'c-green':ratio>=1?'c-amber':'c-red'}].map(function(k){var hlStyle=k.hl?'border-top:2px solid '+k.hl+';background:'+k.hl+'0d':'';return'<div class="bkpi" style="'+hlStyle+'"><div class="bkpi-l">'+k.l+'</div><div class="bkpi-v '+k.c+'" style="'+(k.hl?'font-size:24px':'')+'">'+k.v+'</div><div class="bkpi-s">'+k.s+'</div></div>';}).join('');
  if(BG('biz-verdict')){
    var dot,title,body;
    if(netProfit<0){dot='#ff5252';title='Running at a loss';body='Costs ('+bCad(totalCost)+') exceed revenue ('+bCad(totalRev)+') by <strong>'+bCad(Math.abs(netProfit))+'</strong>. Need '+Math.ceil(Math.abs(netProfit)/Math.max(retAvg,1))+' more retainers to break even.';}
    else if(mrr<fixedCost*0.5){dot='#f0ab38';title='Profitable but retainer-thin';body='Net profit <strong>'+bCad(netProfit)+'</strong> but MRR only covers '+Math.round(mrr/Math.max(fixedCost,1)*100)+'% of fixed costs.';}
    else{dot='#00db88';title='Strong model';body='<strong>'+bCad(netProfit)+'</strong> net profit. MRR <strong>'+bCad(mrr)+'</strong> covers '+Math.round(mrr/Math.max(fixedCost,1)*100)+'% of fixed costs. LTV:CAC <strong>'+ratioStr+'</strong>.';}
    BG('biz-verdict').innerHTML='<div class="bverdict-hdr"><div class="bverdict-dot" style="background:'+dot+';box-shadow:0 0 8px '+dot+'55"></div><div class="bverdict-title">'+title+'</div></div><div class="bverdict-body">'+body+'</div>';
  }
  if(BG('biz-footer-r'))BG('biz-footer-r').textContent='1 USD = CA$'+CFG.usdcad+' · 1 CAD = '+Math.round(pkrCad())+' PKR';
}

function bizExportPDF(){alert('PDF export: host this on a server (Netlify etc.) and add html2pdf.js to use this feature.');}

function bizInit(){
  var mv=new Date();var m=mv.getMonth()+1;SB.month=mv.getFullYear()+'-'+(m<10?'0':'')+m;
  var e=BG('biz-month');if(e)e.value=SB.month;
  bizLoad();bRenderCostRows('biz-mkt',SB.mkt);bRenderCostRows('biz-var',SB.varCosts||[]);bRenderClientRows(SB.clients);
  bizRecalc();
  ['biz-ws-price','biz-ws-qty','biz-wu-price','biz-wu-qty','biz-ret-new','biz-payroll','biz-subs','biz-vid','biz-new-clients','biz-ret-months','biz-conv','biz-churn'].forEach(function(id){var el=BG(id);if(el)el.addEventListener('input',function(){bizRecalc();bizDSave();});});
  var bm=BG('biz-month');if(bm)bm.addEventListener('input',function(){bizSwitchMonth(bm.value);});
}

// ── COMPLIANCE ───────────────────────────────────────────────────────────
var COMP_TYPES=['Late Deliverable','Quality Issue','Attendance/Absence','Policy Violation','Communication','Insubordination','Other'];
var COMP_DEDUCTS=[0,2000,3000,5000,5000,7000,0];

function pay_getComp(empId){var key=String(empId);if(!PAY.compliance[key])PAY.compliance[key]={violations:[]};return PAY.compliance[key];}

function pay_compStatus(empId){
  var cnt=pay_getComp(empId).violations.length;
  if(cnt===0)return{level:0,label:'Clean',color:'var(--green)',bg:'var(--gbg)',icon:'✓'};
  if(cnt===1)return{level:1,label:'1st Warning',color:'var(--accent)',bg:'var(--abg)',icon:'⚠'};
  if(cnt===2)return{level:2,label:'2nd Warning',color:'#f97316',bg:'rgba(249,115,22,.12)',icon:'⚠⚠'};
  if(cnt===3)return{level:3,label:'At-Risk',color:'var(--red)',bg:'var(--rbg)',icon:'🔴'};
  return{level:4,label:'Replacement',color:'var(--red)',bg:'rgba(239,68,68,.2)',icon:'🚨'};
}

function pay_compBadge(empId){
  var s=pay_compStatus(empId),cnt=pay_getComp(empId).violations.length;
  return'<span onclick="pay_scrollToComp('+empId+')" title="Compliance — click to view" style="cursor:pointer;display:inline-flex;align-items:center;gap:3px;background:'+s.bg+';color:'+s.color+';font-family:var(--mono);font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap">'+s.icon+(cnt>0?' '+cnt:'')+'</span>';
}

function pay_scrollToComp(empId){
  // Switch to compliance tab first
  pay_switchTab('compliance');
  setTimeout(function(){
    var el=document.getElementById('comp-row-'+empId);
    if(el){el.scrollIntoView({behavior:'smooth',block:'center'});var orig=el.style.background;el.style.background='rgba(245,158,11,.15)';setTimeout(function(){el.style.background=orig;},1500);}
  },200);
}

function pay_toggleAddForm(empId){var el=document.getElementById('comp-form-row-'+empId);if(el)el.style.display=el.style.display==='none'?'table-row':'none';}
function pay_suggestDeduct(typeIdx,empId){var d=COMP_DEDUCTS[+typeIdx];var f=document.getElementById('cv-deduct-'+empId);if(f&&d)f.value=d;}

function pay_submitViolation(empId){
  var typeIdx=+(document.getElementById('cv-type-'+empId)||{value:0}).value;
  var note=(document.getElementById('cv-note-'+empId)||{value:''}).value||'';
  var deduct=+(document.getElementById('cv-deduct-'+empId)||{value:0}).value||0;
  var date=(document.getElementById('cv-date-'+empId)||{value:''}).value||new Date().toISOString().slice(0,10);
  var comp=pay_getComp(empId);
  comp.violations.push({id:Date.now(),date:date,typeIdx:typeIdx,type:COMP_TYPES[typeIdx]||'Other',note:note,deductionPKR:deduct});
  if(deduct>0){var me=pay_getME(PAY.currentMonth,empId);me.otherDeduct=(me.otherDeduct||0)+deduct;}
  pay_renderCompliance();pay_render();scheduleSave();
}

function pay_removeViolation(empId,vid){
  var comp=pay_getComp(empId);
  comp.violations=comp.violations.filter(function(v){return v.id!==vid;});
  pay_renderCompliance();pay_render();scheduleSave();
}

function pay_renderCompliance(){
  var kpiEl=document.getElementById('pay-comp-kpis'),bodyEl=document.getElementById('pay-comp-body');
  if(!kpiEl||!bodyEl)return;
  var active=PAY.employees.filter(function(e){return e.status==='active';});
  var counts=[0,0,0,0,0];
  active.forEach(function(e){counts[Math.min(4,pay_getComp(e.id).violations.length)]++;});
  kpiEl.innerHTML=mkKpi('Clean',counts[0],'g',counts[0]+' employees')+mkKpi('1st Warning',counts[1],'a',counts[1]+' employees')+mkKpi('2nd Warning',counts[2],'n',counts[2]+' employees')+mkKpi('At-Risk (3)',counts[3],'r',counts[3]+' — formal warning')+mkKpi('Replacement (4+)',counts[4],'r',counts[4]+' — start process');
  var compActive=active;
  if(_compFilter==='warning')compActive=active.filter(function(e){var c=pay_getComp(e.id).violations.length;return c>=1&&c<3;});
  else if(_compFilter==='atrisk')compActive=active.filter(function(e){return pay_getComp(e.id).violations.length===3;});
  else if(_compFilter==='replacement')compActive=active.filter(function(e){return pay_getComp(e.id).violations.length>=4;});
  else if(_compFilter==='clean')compActive=active.filter(function(e){return pay_getComp(e.id).violations.length===0;});
  // Build sortable header
  var compThead=document.querySelector('#pay-comp-body');
  if(compThead&&compThead.previousElementSibling&&compThead.previousElementSibling.tagName==='THEAD'){
    compThead.previousElementSibling.innerHTML='<tr>'+
      _sth('Employee','name',_S.comp,'comp_sortBy','')+''+
      _sth('Role','role',_S.comp,'comp_sortBy','')+''+
      _sth('Dept','dept',_S.comp,'comp_sortBy','')+''+
      '<th>Status</th>'+
      _sth('Violations','violations',_S.comp,'comp_sortBy','r')+''+
      '<th>History</th><th>Action</th></tr>';
  }
  var sorted=_ssort(compActive,_S.comp,{
    name:function(e){return e.name||'';},
    role:function(e){return e.role||'';},
    dept:function(e){return e.dept||'';},
    violations:function(e){return pay_getComp(e.id).violations.length;},
  });
  var rows='';
  sorted.forEach(function(e){
    var comp=pay_getComp(e.id),vios=comp.violations,cnt=vios.length,st=pay_compStatus(e.id);
    var history='';
    vios.forEach(function(v,i){
      var vc=i===0?'var(--accent)':i===1?'#f97316':'var(--red)';
      history+=
        '<div style="display:inline-block;background:rgba(239,68,68,.08);border:.5px solid '+vc+'55;border-left:3px solid '+vc+';border-radius:0 5px 5px 0;padding:6px 9px;margin:3px;min-width:150px;max-width:240px;vertical-align:top">'+
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:3px">'+
            '<span style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+vc+'">#'+(i+1)+' '+esc(v.type)+'</span>'+
            '<button onclick="pay_removeViolation('+e.id+','+v.id+')" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:13px;padding:0;line-height:1;flex-shrink:0" title="Remove">×</button>'+
          '</div>'+
          (v.note?'<div style="font-size:11px;color:var(--text);line-height:1.5;margin-bottom:4px;word-break:break-word">'+esc(v.note)+'</div>':'<div style="font-size:11px;color:var(--dim);margin-bottom:4px;font-style:italic">No description added</div>')+
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
            '<span style="font-size:9px;color:var(--dim);font-family:var(--mono)">📅 '+v.date+'</span>'+
            (v.deductionPKR?'<span style="font-size:9px;color:var(--red);font-family:var(--mono);font-weight:700">−PKR '+v.deductionPKR+'</span>':'')+
          '</div>'+
        '</div>';
    });
    var today=new Date().toISOString().slice(0,10);
    var typeOpts=COMP_TYPES.map(function(t,i){return'<option value="'+i+'">'+esc(t)+'</option>';}).join('');
    var form='<tr id="comp-form-row-'+e.id+'" style="display:none"><td colspan="7" style="padding:.75rem 1rem;background:var(--surf3)"><div style="display:grid;grid-template-columns:140px 1fr 1fr 100px auto;gap:.5rem;align-items:end"><div><div style="font-size:10px;color:var(--muted);margin-bottom:3px">Date</div><input id="cv-date-'+e.id+'" type="date" value="'+today+'" style="width:100%;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none"></div><div><div style="font-size:10px;color:var(--muted);margin-bottom:3px">Violation Type</div><select id="cv-type-'+e.id+'" onchange="pay_suggestDeduct(this.value,'+e.id+')" style="width:100%;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 8px;color:var(--text);font-family:var(--sans);font-size:12px;outline:none">'+typeOpts+'</select></div><div><div style="font-size:10px;color:var(--muted);margin-bottom:3px">Notes</div><input id="cv-note-'+e.id+'" type="text" placeholder="Brief description…" style="width:100%;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 8px;color:var(--text);font-family:var(--sans);font-size:12px;outline:none"></div><div><div style="font-size:10px;color:var(--muted);margin-bottom:3px">Deduction (PKR)</div><input id="cv-deduct-'+e.id+'" type="number" min="0" step="500" value="0" style="width:100%;background:var(--surf2);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none"></div><div style="padding-top:18px;display:flex;gap:.375rem"><button onclick="pay_submitViolation('+e.id+')" style="background:var(--rbg);color:var(--red);border:.5px solid rgba(239,68,68,.3);border-radius:5px;padding:5px 12px;cursor:pointer;font-family:var(--sans);font-size:12px;font-weight:600;white-space:nowrap">Add ⚠</button><button onclick="pay_toggleAddForm('+e.id+')" style="background:var(--surf);color:var(--muted);border:.5px solid var(--bdr2);border-radius:5px;padding:5px 10px;cursor:pointer;font-family:var(--sans);font-size:12px">Cancel</button></div></div><div style="margin-top:.5rem;font-size:11px;color:var(--dim)">Deductions auto-added to Other Deductions for <strong style="color:var(--accent)">'+pay_monthLabel(PAY.currentMonth)+'</strong>.</div></td></tr>';
    var actionBtns='<button onclick="pay_toggleAddForm('+e.id+')" style="font-size:11px;background:var(--rbg);color:var(--red);border:.5px solid rgba(239,68,68,.25);border-radius:5px;padding:3px 9px;cursor:pointer;font-family:var(--sans);white-space:nowrap">+ Add ⚠</button>';
    if(cnt>=4)actionBtns+=' <span style="font-size:10px;background:rgba(239,68,68,.2);color:var(--red);border:.5px solid rgba(239,68,68,.45);border-radius:4px;padding:3px 8px;font-weight:700;white-space:nowrap">🚨 REPLACEMENT</span>';
    var col=OP_DCOLS[e.dept]||'#6b7280';
    rows+='<tr id="comp-row-'+e.id+'" style="transition:background .3s"><td style="font-weight:600">'+esc(e.name)+'</td><td style="font-size:12px;color:var(--muted)">'+esc(e.role)+'</td><td><span class="dchip" style="background:'+col+'1a;color:'+col+'">'+esc(e.dept)+'</span></td><td><span style="background:'+st.bg+';color:'+st.color+';font-family:var(--mono);font-size:11px;font-weight:700;padding:3px 9px;border-radius:4px;white-space:nowrap">'+st.icon+' '+st.label+'</span></td><td class="r" style="font-family:var(--mono);font-weight:700;font-size:14px;color:'+st.color+'">'+cnt+'</td><td>'+(cnt>0?'<div style="display:flex;flex-wrap:wrap;gap:0">'+history+'</div>':'<span style="font-size:12px;color:var(--green)">✓ No violations</span>')+'</td><td>'+actionBtns+'</td></tr>'+form;
  });
  bodyEl.innerHTML=rows||'<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--dim)">No active employees</td></tr>';
}

// ── Payroll Sub-tabs ─────────────────────────────────────────────────────
var _payTab='roster',_compFilter='all',_payFilter='all';

function pay_setPayFilter(f){
  _payFilter=f;
  document.querySelectorAll('.pay-pf-btn').forEach(function(b){b.className='pay-pf-btn';});
  var btn=document.querySelector('[data-pf="'+f+'"]');if(btn)btn.className='pay-pf-btn on-'+f;
  pay_render();
}
function pay_switchTab(tab){
  _payTab=tab;
  ['roster','capacity','compliance'].forEach(function(t){var el=document.getElementById('pay-subtab-'+t);if(el)el.style.display=t===tab?'':'none';});
  document.querySelectorAll('.pay-stab').forEach(function(btn,i){var tabs=['roster','capacity','compliance'];btn.classList.toggle('on',tabs[i]===tab);});
  if(tab==='capacity')pay_renderCapacity();
  if(tab==='compliance')pay_renderCompliance();
}

function pay_filterComp(f){
  _compFilter=f;
  document.querySelectorAll('.pay-comp-filter').forEach(function(btn,i){var fs=['all','warning','atrisk','replacement','clean'];var on=fs[i]===f;btn.classList.toggle('on',on);btn.style.background=on?'var(--abg)':'var(--surf2)';btn.style.color=on?'var(--accent)':'var(--muted)';btn.style.borderColor=on?'var(--abdr)':'var(--bdr2)';});
  pay_renderCompliance();
}

function pay_renderCapacity(){
  var roleFilter=(document.getElementById('cap-filter-role')||{value:''}).value||'';
  var deptFilter=(document.getElementById('cap-filter-dept')||{value:''}).value||'';
  var minClients=+(document.getElementById('cap-filter-min')||{value:0}).value||0;
  var roleSel=document.getElementById('cap-filter-role'),deptSel=document.getElementById('cap-filter-dept');
  if(roleSel&&roleSel.options.length<=1){var roles=[...new Set(PAY.employees.filter(function(e){return e.status==='active';}).map(function(e){return e.role;}))].sort();roles.forEach(function(r){var o=document.createElement('option');o.value=r;o.textContent=r;roleSel.appendChild(o);});if(roleFilter)roleSel.value=roleFilter;}
  if(deptSel&&deptSel.options.length<=1){var depts=[...new Set(PAY.employees.filter(function(e){return e.status==='active';}).map(function(e){return e.dept;}))].sort();depts.forEach(function(d){var o=document.createElement('option');o.value=d;o.textContent=d;deptSel.appendChild(o);});if(deptFilter)deptSel.value=deptFilter;}
  var active=PAY.employees.filter(function(e){return e.status==='active';});
  var filtered=active.filter(function(e){if(roleFilter&&e.role!==roleFilter)return false;if(deptFilter&&e.dept!==deptFilter)return false;var load=OP.roleLoads[e.role]||10;if(minClients&&load<minClients)return false;return true;});
  var totCap=filtered.reduce(function(a,e){return a+(OP.roleLoads[e.role]||10);},0);
  var totCostCAD=filtered.reduce(function(a,e){return a+(e.baseSalary||0)/pkrCad();},0);
  var avgCPC=totCap>0?totCostCAD/totCap:0,totPKR=filtered.reduce(function(a,e){return a+(e.baseSalary||0);},0);
  var kpiEl=document.getElementById('cap-kpis');
  if(kpiEl)kpiEl.innerHTML=mkKpi('Employees',filtered.length,'n',active.length+' total')+mkKpi('Client capacity',totCap,'b','clients collectively')+mkKpi('Total payroll',fPKR(totPKR),'g',fC(totCostCAD)+'/mo')+mkKpi('Avg cost/client',fC(avgCPC),'a','all roles');
  // Build sortable header
  var capThead=document.querySelector('#cap-body');
  if(capThead&&capThead.previousElementSibling&&capThead.previousElementSibling.tagName==='THEAD'){
    capThead.previousElementSibling.innerHTML='<tr>'+
      _sth('Employee','name',_S.cap,'cap_sortBy','')+''+
      _sth('Role','role',_S.cap,'cap_sortBy','')+''+
      _sth('Department','dept',_S.cap,'cap_sortBy','')+''+
      _sth('Clients/person','clients',_S.cap,'cap_sortBy','r')+''+
      _sth('Cost/client','cpc',_S.cap,'cap_sortBy','r')+''+
      _sth('Salary (PKR)','salary',_S.cap,'cap_sortBy','r')+''+
      _sth('CA$/mo','cad',_S.cap,'cap_sortBy','r')+'</tr>';
  }
  // Sort
  filtered=_ssort(filtered,_S.cap,{
    name:function(e){return e.name||'';},
    role:function(e){return e.role||'';},
    dept:function(e){return e.dept||'';},
    clients:function(e){return OP.roleLoads[e.role]||10;},
    cpc:function(e){var l=OP.roleLoads[e.role]||10;return l>0?(e.baseSalary||0)/pkrCad()/l:0;},
    salary:function(e){return e.baseSalary||0;},
    cad:function(e){return(e.baseSalary||0)/pkrCad();},
  });
  var rows='',totCap2=0,totCostPKR2=0,totCostCAD2=0;
  filtered.forEach(function(e){
    var load=OP.roleLoads[e.role]||10,salPKR=e.baseSalary||0,salCAD=salPKR/pkrCad(),cpc=load>0?salCAD/load:0;
    var col=OP_DCOLS[e.dept]||'#6b7280';
    totCap2+=load;totCostPKR2+=salPKR;totCostCAD2+=salCAD;
    rows+='<tr><td style="font-weight:600;font-size:13px">'+esc(e.name)+'</td><td style="font-size:12px;color:var(--muted)">'+esc(e.role)+'</td><td><span class="dchip" style="background:'+col+'22;color:'+col+';border:.5px solid '+col+'44;font-size:11px;padding:2px 8px;border-radius:4px">'+esc(deptShort(e.dept))+'</span></td><td class="r"><div style="display:flex;align-items:center;justify-content:flex-end;gap:5px"><input type="number" min="1" max="50" step="1" value="'+load+'" data-rl="'+esc(e.role)+'" style="width:48px;background:var(--surf3);border:.5px solid var(--bdr2);border-radius:4px;padding:3px 6px;color:var(--accent);font-family:var(--mono);font-size:13px;text-align:right;outline:none"><span style="font-size:11px;color:var(--dim)">clients</span></div></td><td class="r" style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--green)">'+fC(cpc)+'</td><td class="r"><div style="font-family:var(--mono);font-size:13px">'+fPKR(salPKR)+'</div><div style="font-family:var(--mono);font-size:11px;color:var(--muted)">'+fC(salCAD)+'</div></td><td class="r" style="font-family:var(--mono);font-size:13px;font-weight:600">'+fC(salCAD)+'</td></tr>';
  });
  if(!rows)rows='<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--dim)">No employees match filters.</td></tr>';
  var bodyEl=document.getElementById('cap-body');if(bodyEl)bodyEl.innerHTML=rows;
  var footEl=document.getElementById('cap-foot');
  if(footEl)footEl.innerHTML='<td colspan="3" style="font-weight:600;font-size:13px;padding:.5rem .75rem;border-top:.5px solid var(--bdr2)">'+filtered.length+' employees</td><td class="r" style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--blue);border-top:.5px solid var(--bdr2)">'+totCap2+' total</td><td style="border-top:.5px solid var(--bdr2)"></td><td class="r" style="font-family:var(--mono);font-size:13px;border-top:.5px solid var(--bdr2)">'+fPKR(totCostPKR2)+'</td><td class="r" style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--green);border-top:.5px solid var(--bdr2)">'+fC(totCostCAD2)+'</td>';
}

// ── Event Listeners ──────────────────────────────────────────────────────
document.addEventListener('input',function(e){
  var el=e.target,id=el.id;
  var rl=el.getAttribute('data-rl');
  if(rl!==null&&rl!==undefined){OP.roleLoads[rl]=Math.max(1,+el.value||10);op_renderAll();scheduleSave();return;}
  if(id==='cfg-usdcad'){CFG.usdcad=+el.value;document.getElementById('cfg-pkr-hint').textContent='1 CAD ≈ '+Math.round(CFG.pkrusd/CFG.usdcad)+' PKR';renderAll();bizRecalc();scheduleSave();return;}
  if(id==='cfg-pkrusd'){CFG.pkrusd=+el.value;document.getElementById('cfg-pkr-hint').textContent='1 CAD ≈ '+Math.round(CFG.pkrusd/CFG.usdcad)+' PKR';renderAll();bizRecalc();scheduleSave();return;}
  if(id==='cfg-hrs'){CFG.hrs=+el.value;op_renderAll();scheduleSave();return;}
  if(id==='ue-price'){UE.price=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-uprice'){UE.uprice=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-usl'){UE.upsell=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-meta'){UE.meta=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-vsl'){UE.vol=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-ai'){UE.ai=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-oads'){UE.oads=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-overhead'){UE.overhead=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-other'){UE.other=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-cpr'){UE.cpr=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-close'){UE.closeRate=+el.value;ue_render();scheduleSave();return;}
  if(id==='ue-goal'){UE.goal=+el.value;ue_render();scheduleSave();return;}
  if(id==='op-msl'){OP.markup=+el.value;op_renderAll();scheduleSave();return;}
  if(id==='op-clients'){OP.clients=+el.value;op_renderAll();scheduleSave();return;}
  if(id==='op-hrs'){CFG.hrs=+el.value;op_renderAll();scheduleSave();return;}
  if(id==='pay-search'){pay_render();return;}
  var osId=parseInt(el.getAttribute('data-os'),10),osF=el.getAttribute('data-f');
  if(osId&&osF){var s=op_getS(osId);if(!s)return;
    if(osF==='name')s.name=el.value;
    else if(osF==='markup')s.markup=el.value===''?null:+el.value;
    else if(osF==='hr'){s.hr=+el.value||0;}
    else if(osF==='hpc'){s.hpc=+el.value||1;}
    op_renderAll();scheduleSave();return;}
  var peId=parseInt(el.getAttribute('data-pe'),10),peF=el.getAttribute('data-f');
  if(peId&&peF){var emp=pay_getE(peId);if(!emp)return;if(peF==='name')emp.name=el.value;else if(peF==='role'){emp.role=el.value;op_renderAll();}else if(peF==='baseSalary')emp.baseSalary=+el.value;scheduleSave();return;}
  var pmId=parseInt(el.getAttribute('data-pm'),10),pmF=el.getAttribute('data-f');
  if(pmId&&pmF){var me=pay_getME(PAY.currentMonth,pmId);if(pmF==='bonus')me.bonus=+el.value;else if(pmF==='absenceDays')me.absenceDays=+el.value;else if(pmF==='advanceDeduct')me.advanceDeduct=+el.value;else if(pmF==='otherDeduct')me.otherDeduct=+el.value;scheduleSave();return;}
  // UE team member field edits — no innerHTML re-render on input (preserves focus)
  var ueTI=el.getAttribute('data-ue'),ueIdI=parseInt(el.getAttribute('data-id'),10),ueFI=el.getAttribute('data-f');
  if(ueTI&&ueIdI&&ueFI){
    var ueMI=ue_getM(ueTI,ueIdI);if(!ueMI)return;
    if(ueFI==='name')ueMI.name=el.value;
    else if(ueFI==='salary'){
      ueMI.salary=+el.value;
      var hEl=document.getElementById('ue-hint-'+ueTI+'-'+ueIdI);
      if(hEl){var cVh=ueMI.cur==='PKR'?ueMI.salary/pkrCad():ueMI.salary;hEl.textContent=ueMI.cur==='PKR'?'≈ CA$'+cVh.toFixed(0)+'/mo':'≈ PKR '+Math.round(cVh*pkrCad()).toLocaleString()+'/mo';}
    }
    else if(ueFI==='bonusPKR')ueMI.bonusPKR=+el.value;
    else if(ueFI==='bonusCAD')ueMI.bonusCAD=+el.value;
    else if(ueFI==='commPKR')ueMI.commPKR=+el.value;
    else if(ueFI==='sites'){ueMI.sites=Math.max(0,+el.value);}
    // Live-update commission total spans in-place (no DOM rebuild = no focus loss)
    if(ueFI==='commPKR'||ueFI==='bonusPKR'||ueFI==='sites'){
      var cP3=(ueTI==='pm')?(ueMI.commPKR||0):(ueMI.bonusPKR||0);
      var s3=ueMI.sites||0,t3=cP3*s3,tC3=t3/pkrCad();
      var ec3=t3>0?'var(--green)':'var(--dim)';
      var tEl3=document.getElementById('ue-ctot-'+ueTI+'-'+ueIdI);
      var sEl3=document.getElementById('ue-csub-'+ueTI+'-'+ueIdI);
      if(tEl3){tEl3.innerHTML='PKR '+t3.toLocaleString()+'&nbsp;<span style="font-size:10px;font-weight:400;color:var(--dim)">≈ '+fC(tC3)+'</span>';tEl3.style.color=ec3;}
      if(sEl3)sEl3.textContent=s3+' site'+(s3===1?'':'s')+' × PKR '+cP3.toLocaleString();
      var tS3=0,tP3=0,tD3=0;
      UE.sales.forEach(function(x){tS3+=(x.bonusPKR||0)*(x.sites||0);});
      UE.pms.forEach(function(x){tP3+=(x.commPKR||0)*(x.sites||0);});
      UE.devs.forEach(function(x){tD3+=(x.bonusPKR||0)*(x.sites||0);});
      var tA3=tS3+tP3+tD3,pc3=pkrCad();
      var kpEl=document.getElementById('ue-comm-kpis');
      if(kpEl)kpEl.innerHTML=mkKpi('Total commissions','PKR '+Math.round(tA3).toLocaleString(),tA3>0?'g':'n',fC(tA3/pc3)+' CA$')+mkKpi('Sales payout','PKR '+Math.round(tS3).toLocaleString(),'a',UE.sales.length+' rep'+(UE.sales.length===1?'':'s'))+mkKpi('PM payout','PKR '+Math.round(tP3).toLocaleString(),'b',UE.pms.length+' PM'+(UE.pms.length===1?'':'s'))+mkKpi('Dev payout','PKR '+Math.round(tD3).toLocaleString(),'p',UE.devs.length+' dev'+(UE.devs.length===1?'':'s'));
    }
    scheduleSave();return;
  }
});

document.addEventListener('change',function(e){
  var el=e.target;
  var osId=parseInt(el.getAttribute('data-os'),10),osF=el.getAttribute('data-f');
  if(osId&&(osF==='roleName'||osF==='role')){
    var s=op_getS(osId);if(!s)return;
    s.roleName=el.value;
    scheduleSave();
    setTimeout(function(){op_renderAll();},50);
    return;
  }
  var peId=parseInt(el.getAttribute('data-pe'),10),peF=el.getAttribute('data-f');
  if(peId&&peF){var emp=pay_getE(peId);if(!emp)return;
    if(peF==='dept'){emp.dept=el.value;scheduleSave();setTimeout(function(){pay_render();op_renderAll();},50);}
    else if(peF==='type')emp.type=el.value;
    scheduleSave();return;
  }
});

document.addEventListener('focusout',function(e){
  var el=e.target;
  if(el.getAttribute('data-os')){op_renderAll();scheduleSave();return;}
  if(el.getAttribute('data-pe')||el.getAttribute('data-pm')){pay_render();op_renderAll();scheduleSave();return;}
  if(el.getAttribute('data-ue')){
    var cpFO=document.getElementById('ue-pane-comm');
    if(cpFO&&cpFO.style.display!=='none')ue_renderCommission();
    ue_render();scheduleSave();return;
  }
});

document.addEventListener('click',function(e){
  var el=e.target;
  var osId=parseInt(el.getAttribute('data-os'),10),osF=el.getAttribute('data-f');
  if(osId&&osF==='del'){OP.svcs=OP.svcs.filter(function(x){return x.id!==osId;});op_renderAll();scheduleSave();return;}
  var pkg=el.getAttribute('data-pkg');
  if(pkg){OP.pkg[pkg]=el.checked;op_renderAll();scheduleSave();return;}
  var peId=parseInt(el.getAttribute('data-pe'),10),peF=el.getAttribute('data-f');
  if(peId&&peF){
    var emp=pay_getE(peId);
    if(peF==='del'){PAY.employees=PAY.employees.filter(function(x){return x.id!==peId;});pay_render();op_renderAll();scheduleSave();return;}
  }
  var pmId=parseInt(el.getAttribute('data-pm'),10),pmF=el.getAttribute('data-f');
  if(pmId&&pmF==='paid'){var me=pay_getME(PAY.currentMonth,pmId);me.paid=!me.paid;pay_render();scheduleSave();return;}
  // UE team member actions
  var ueT=el.getAttribute('data-ue'),ueId=parseInt(el.getAttribute('data-id'),10),ueF=el.getAttribute('data-f'),ueDv=el.getAttribute('data-val');
  if(ueT&&ueId&&ueF){
    var ueM=ue_getM(ueT,ueId);if(!ueM)return;
    if(ueF==='del'){
      if(ueT==='sales')UE.sales=UE.sales.filter(function(x){return x.id!==ueId;});
      else if(ueT==='pm')UE.pms=UE.pms.filter(function(x){return x.id!==ueId;});
      else UE.devs=UE.devs.filter(function(x){return x.id!==ueId;});
      var cpDel=document.getElementById('ue-pane-comm');
      if(cpDel&&cpDel.style.display!=='none')ue_renderCommission();else ue_render();
      scheduleSave();return;
    }
    if(ueF==='cur'){ueM.cur=ueM.cur==='PKR'?'CAD':'PKR';ue_renderTeam();scheduleSave();return;}
    if(ueF==='comp'){ueM.comp=ueDv;ue_renderTeam();scheduleSave();return;}
  }
});

// ── Boot ─────────────────────────────────────────────────────────────────
cfgLoad();ue_load();op_load();pay_load();pay_syncLists();
var _cfgUsdcad=document.getElementById('cfg-usdcad');if(_cfgUsdcad)_cfgUsdcad.value=CFG.usdcad;
var _cfgPkrusd=document.getElementById('cfg-pkrusd');if(_cfgPkrusd)_cfgPkrusd.value=CFG.pkrusd;
var _cfgHrs=document.getElementById('cfg-hrs');if(_cfgHrs)_cfgHrs.value=CFG.hrs;
var _cfgHint=document.getElementById('cfg-pkr-hint');if(_cfgHint)_cfgHint.textContent='1 CAD ≈ '+Math.round(pkrCad())+' PKR';
bizInit();
var _ueOv=document.getElementById('ue-overhead');if(_ueOv)_ueOv.value=UE.overhead||0;
var _ueOth=document.getElementById('ue-other');if(_ueOth)_ueOth.value=UE.other||0;
var _ueCpr=document.getElementById('ue-cpr');if(_ueCpr)_ueCpr.value=UE.cpr||60;
var _ueClose=document.getElementById('ue-close');if(_ueClose)_ueClose.value=UE.closeRate||70;
renderAll();


// ── Override doReset to use API ──────────────────────────────────────────
doReset = function() {
  if(!confirm('Reset ALL dashboards? This clears all entered data.'))return;
  var token = localStorage.getItem('bizz1_token');
  fetch('/api/data', {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(function() {
    location.reload();
  }).catch(function() {
    location.reload();
  });
};

// ── Expose functions to global scope for inline onclick handlers ─────────
// The HTML uses onclick="goView('ov')" etc. which look up in window scope.
window.goView=goView;window.doReset=doReset;window.renderAll=renderAll;window.scheduleSave=scheduleSave;
window.ue_setTab=ue_setTab;window.ue_add=ue_add;window.ue_render=ue_render;window.ue_renderCommission=ue_renderCommission;
window.op_addSvc=op_addSvc;window.op_renderAll=op_renderAll;
window.pay_add=pay_add;window.pay_addConfirm=pay_addConfirm;window.pay_addCancel=pay_addCancel;
window.pay_changeMonth=pay_changeMonth;window.pay_copyPrev=pay_copyPrev;
window.pay_markAllPaid=pay_markAllPaid;window.pay_switchTab=pay_switchTab;
window.pay_toggleRDS=pay_toggleRDS;window.pay_setPayFilter=pay_setPayFilter;
window.pay_filterComp=pay_filterComp;window.pay_renderCapacity=pay_renderCapacity;
window.pay_render=pay_render;window.pay_renderCompliance=pay_renderCompliance;
window.pay_sortBy=pay_sortBy;window.cap_sortBy=cap_sortBy;window.comp_sortBy=comp_sortBy;
window.rc_sortBy=rc_sortBy;window.svc_sortBy=svc_sortBy;
window.pay_toggleEditRow=pay_toggleEditRow;window.pay_addRole=pay_addRole;
window.pay_delRole=pay_delRole;window.pay_addDept=pay_addDept;window.pay_delDept=pay_delDept;
window.pay_toggleAddForm=pay_toggleAddForm;window.pay_submitViolation=pay_submitViolation;
window.pay_removeViolation=pay_removeViolation;window.pay_scrollToComp=pay_scrollToComp;
window.pay_suggestDeduct=pay_suggestDeduct;
window.ai_clear=ai_clear;window.ai_send=ai_send;window.ai_sendText=ai_sendText;
window.ai_initSuggestions=ai_initSuggestions;
window.bAddClientRow=bAddClientRow;window.bAddCostRow=bAddCostRow;window.bAddProjRow=bAddProjRow;
window.bDelRow=bDelRow;window.bizExportPDF=bizExportPDF;
window.bizRecalc=bizRecalc;window.bizDSave=bizDSave;window.bizSave=bizSave;
window.bizSwitchMonth=bizSwitchMonth;
window.mkKpi=mkKpi;window.plR=plR;window.plD=plD;window.fC=fC;window.fPKR=fPKR;
window.esc=esc;window.setText=setText;window.pkrCad=pkrCad;

} // end runPanelLogic