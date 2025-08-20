const express = require('express');
const { startRun, stopRun } = require('../lib/db');

const router = express.Router();
router.use(express.json({ limit: '2mb' }));

router.post('/start', async (req, res) => {
  const owner = 'anon';
  const snapshot = req.body?.snapshot || {};
  const templateId = req.body?.templateId || null;
  if (!snapshot || typeof snapshot !== 'object') return res.status(400).json({ ok: false, error: 'missing snapshot' });
  const run = await startRun(owner, snapshot, templateId);
  res.json({ ok: true, run });
});

router.post('/stop', async (req, res) => {
  const owner = 'anon';
  const runId = req.body?.runId;
  if (!runId) return res.status(400).json({ ok: false, error: 'missing runId' });
  const row = await stopRun(owner, runId);
  if (!row) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, run: row });
});

module.exports = router;


