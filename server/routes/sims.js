const express = require('express');
const { upsertTemplate, listTemplates, getTemplate, deleteTemplate } = require('../lib/db');

const router = express.Router();
router.use(express.json({ limit: '2mb' }));

router.post('/templates', async (req, res) => {
  const owner = 'anon';
  const body = req.body || {};
  if (!body.name || !body.world || !body.agents || !body.story || !body.model) {
    return res.status(400).json({ ok: false, error: 'missing fields' });
  }
  const saved = await upsertTemplate(owner, body);
  res.json({ ok: true, template: saved });
});

router.get('/templates', async (req, res) => {
  const owner = 'anon';
  const rows = await listTemplates(owner);
  res.json({ ok: true, templates: rows });
});

router.get('/templates/:id', async (req, res) => {
  const owner = 'anon';
  const row = await getTemplate(owner, req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, template: row });
});

router.delete('/templates/:id', async (req, res) => {
  const owner = 'anon';
  const ok = await deleteTemplate(owner, req.params.id);
  res.json({ ok });
});

module.exports = router;



