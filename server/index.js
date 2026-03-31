import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'taplist-secret-token';
const LOGOS_DIR = path.join(__dirname, '../public/logos');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LOGOS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// --- Auth ---
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// --- Taps ---
app.get('/api/taps', async (req, res) => {
  const { data, error } = await supabase
    .from('taps')
    .select('*')
    .order('tap');
  if (error) return res.status(500).json({ error: error.message });
  // Map snake_case to camelCase for frontend
  res.json(data.map(toClient));
});

app.post('/api/taps', requireAuth, async (req, res) => {
  const { data: existing } = await supabase.from('taps').select('tap').order('tap', { ascending: false }).limit(1);
  const nextTap = existing?.length ? existing[0].tap + 1 : 1;
  const row = toDb({ ...req.body, tap: nextTap });
  const { data, error } = await supabase.from('taps').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(toClient(data));
});

app.put('/api/taps/:tap', requireAuth, async (req, res) => {
  const tapNum = parseInt(req.params.tap);
  const { data, error } = await supabase
    .from('taps')
    .update(toDb(req.body))
    .eq('tap', tapNum)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(toClient(data));
});

app.delete('/api/taps/:tap', requireAuth, async (req, res) => {
  const tapNum = parseInt(req.params.tap);
  const { data } = await supabase.from('taps').select('logo').eq('tap', tapNum).single();
  if (data?.logo) {
    const logoPath = path.join(LOGOS_DIR, data.logo);
    if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
  }
  const { error } = await supabase.from('taps').delete().eq('tap', tapNum);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Reorder — full ordered array
app.put('/api/taps', requireAuth, async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  const rows = req.body.map(toDb);
  const { error } = await supabase.from('taps').upsert(rows);
  if (error) return res.status(500).json({ error: error.message });
  res.json(req.body);
});

// --- Logo upload ---
app.post('/api/upload/logo', requireAuth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename });
});

app.delete('/api/logo/:filename', requireAuth, (req, res) => {
  const logoPath = path.join(LOGOS_DIR, req.params.filename);
  if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
  res.json({ success: true });
});

// snake_case DB → camelCase client
function toClient(row) {
  return {
    tap: row.tap,
    name: row.name,
    brewery: row.brewery,
    location: row.location,
    style: row.style,
    abv: row.abv,
    price: row.price,
    logo: row.logo,
    staffPick: row.staff_pick,
  };
}

// camelCase client → snake_case DB
function toDb(obj) {
  const row = {};
  if (obj.tap !== undefined) row.tap = obj.tap;
  if (obj.name !== undefined) row.name = obj.name;
  if (obj.brewery !== undefined) row.brewery = obj.brewery;
  if (obj.location !== undefined) row.location = obj.location;
  if (obj.style !== undefined) row.style = obj.style;
  if (obj.abv !== undefined) row.abv = Number(obj.abv);
  if (obj.price !== undefined) row.price = Number(obj.price);
  if (obj.logo !== undefined) row.logo = obj.logo;
  if (obj.staffPick !== undefined) row.staff_pick = obj.staffPick;
  return row;
}

app.listen(PORT, () => {
  console.log(`Taplist API running on http://localhost:${PORT}`);
});
