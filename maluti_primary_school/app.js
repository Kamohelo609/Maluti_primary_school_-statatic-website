/* ============================================================
   app.js — Maluti Primary School
   Central data store + auth helpers
   All data lives in localStorage so changes persist in session
   ============================================================ */

// ── Default data ─────────────────────────────────────────────
const DEFAULT_USERS = [
  { id:1, loginID:'22',  name:'Admin Kat',   password:'admin123',  role:'admin',   gender:'Male',   dob:'1985-01-15', email:'admin@maluti.co.ls',    parentId:null, classId:null },
  { id:2, loginID:'55',  name:'Baratang',    password:'teacher1',  role:'teacher', gender:'Male',   dob:'1990-06-23', email:'baratang@maluti.co.ls',  parentId:null, classId:null },
  { id:3, loginID:'78',  name:'Renadal',     password:'parent1',   role:'parent',  gender:'Male',   dob:'1980-12-31', email:'renadal@gmail.com',       parentId:null, classId:null },
  { id:4, loginID:'56',  name:'Ganda Ganda', password:'student1',  role:'student', gender:'Male',   dob:'2005-12-12', email:'kamohelo@botho.edu',      parentId:3,    classId:1   },
  { id:5, loginID:'123', name:'Leemisa',     password:'student1',  role:'student', gender:'Female', dob:'2006-12-12', email:'leemisa@gmail.com',       parentId:3,    classId:2   },
];

const DEFAULT_CLASSES = [
  { id:1, name:'Grade 4A', teacherId:2 },
  { id:2, name:'Grade 5B', teacherId:2 },
  { id:3, name:'Grade 6A', teacherId:2 },
];

const DEFAULT_GRADES = [
  { id:1, studentId:4, subject:'Mathematics',  grade:'90', date:'2025-04-16' },
  { id:2, studentId:5, subject:'English',      grade:'85', date:'2025-04-29' },
  { id:3, studentId:4, subject:'Science',      grade:'78', date:'2025-04-29' },
  { id:4, studentId:5, subject:'Life Skills',  grade:'92', date:'2025-05-01' },
  { id:5, studentId:4, subject:'Social Studies',grade:'88',date:'2025-05-02' },
];

const DEFAULT_ATTENDANCE = [
  { id:1, studentId:4, status:'Present', date:'2025-04-17' },
  { id:2, studentId:5, status:'Absent',  date:'2025-04-29' },
  { id:3, studentId:4, status:'Absent',  date:'2025-04-29' },
  { id:4, studentId:4, status:'Present', date:'2025-04-30' },
  { id:5, studentId:5, status:'Present', date:'2025-04-30' },
  { id:6, studentId:4, status:'Present', date:'2025-05-01' },
  { id:7, studentId:5, status:'Present', date:'2025-05-01' },
];

const DEFAULT_PAYMENTS = [
  { id:1, studentId:5, amount:400, date:'2025-02-03', method:'Cash',  note:'Full term payment' },
  { id:2, studentId:4, amount:500, date:'2025-05-04', method:'Card',  note:'Partial payment'   },
  { id:3, studentId:4, amount:300, date:'2025-04-01', method:'Cash',  note:'Term 1 balance'    },
];

// ── Storage helpers ───────────────────────────────────────────
function loadDB(key, defaults) {
  try {
    const raw = localStorage.getItem('mps_' + key);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaults));
  } catch { return JSON.parse(JSON.stringify(defaults)); }
}
function saveDB(key, data) {
  localStorage.setItem('mps_' + key, JSON.stringify(data));
}
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

// ── DB accessors ──────────────────────────────────────────────
const DB = {
  users()      { return loadDB('users',      DEFAULT_USERS);      },
  classes()    { return loadDB('classes',    DEFAULT_CLASSES);    },
  grades()     { return loadDB('grades',     DEFAULT_GRADES);     },
  attendance() { return loadDB('attendance', DEFAULT_ATTENDANCE); },
  payments()   { return loadDB('payments',   DEFAULT_PAYMENTS);   },

  saveUsers(d)      { saveDB('users',      d); },
  saveClasses(d)    { saveDB('classes',    d); },
  saveGrades(d)     { saveDB('grades',     d); },
  saveAttendance(d) { saveDB('attendance', d); },
  savePayments(d)   { saveDB('payments',   d); },
};

// ── Auth ──────────────────────────────────────────────────────
const Auth = {
  login(loginID, password) {
    const users = DB.users();
    return users.find(u => u.loginID === loginID.trim() && u.password === password.trim()) || null;
  },
  setSession(user) {
    sessionStorage.setItem('mps_user', JSON.stringify({ id:user.id, loginID:user.loginID, name:user.name, role:user.role }));
  },
  getSession() {
    try { return JSON.parse(sessionStorage.getItem('mps_user')); } catch { return null; }
  },
  logout() {
    sessionStorage.removeItem('mps_user');
    window.location.href = 'login.html';
  },
  requireRole(...roles) {
    const u = Auth.getSession();
    if (!u || !roles.includes(u.role)) { window.location.href = 'login.html'; return null; }
    return u;
  },
};

// ── UI helpers ────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

function confirm2(msg) {
  return new Promise(res => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <p>${msg}</p>
        <div class="modal-btns">
          <button class="btn btn-danger" id="confirmYes">Delete</button>
          <button class="btn btn-outline" id="confirmNo">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirmYes').onclick = () => { overlay.remove(); res(true); };
    document.getElementById('confirmNo').onclick  = () => { overlay.remove(); res(false); };
  });
}

// Avatar initials
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}
