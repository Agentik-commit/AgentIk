const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '4mb' }));

// In-memory drafts
const drafts = new Map(); // id -> { id, name, mapJson, updated_at, publishedKey? }

// Ensure public dirs
const publicDir = path.join(__dirname, '../../public');
const mapsDir = path.join(publicDir, 'maps');
const tilesetsDir = path.join(publicDir, 'uploads', 'tilesets', 'anon');
fs.mkdirSync(mapsDir, { recursive: true });
fs.mkdirSync(tilesetsDir, { recursive: true });

router.post('/save', async (req, res) => {
  const { id, name, mapJson } = req.body || {};
  if (!name || !mapJson) return res.status(400).json({ ok: false, error: 'missing name or mapJson' });
  const draftId = id || randomUUID();
  drafts.set(draftId, { id: draftId, name, mapJson, updated_at: new Date().toISOString() });
  res.json({ ok: true, id: draftId, name, updated_at: drafts.get(draftId).updated_at });
});

router.post('/publish', async (req, res) => {
  const { id } = req.body || {};
  const row = drafts.get(id);
  if (!row) return res.status(404).json({ ok: false, error: 'draft not found' });
  const key = 'maps/' + randomUUID() + '.json';
  const outPath = path.join(publicDir, key);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(row.mapJson, null, 2));
  row.publishedKey = key;
  res.json({ ok: true, mapKey: key });
});

router.get('/:id', async (req, res) => {
  const row = drafts.get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, draft: row });
});

router.get('/by-key/:mapKey(*)', async (req, res) => {
  const safe = req.params.mapKey.replace(/\.\.+/g, '');
  const p = path.join(publicDir, safe);
  if (!fs.existsSync(p)) return res.status(404).json({ ok: false, error: 'not found' });
  res.setHeader('content-type', 'application/json');
  fs.createReadStream(p).pipe(res);
});

const upload = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, tilesetsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})});

router.post('/upload-tileset', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'no file' });
  const rel = '/uploads/tilesets/anon/' + path.basename(req.file.path);
  res.json({ ok: true, url: rel });
});

module.exports = router;


