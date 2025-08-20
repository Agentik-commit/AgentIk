const express = require('express');
const { getProviderConfig, saveProviderConfig } = require('../lib/secrets');

// Use Node 18+ global fetch when available; otherwise fall back to dynamic import of node-fetch
const fetchFn = (...args) => (typeof fetch !== 'undefined'
  ? fetch(...args)
  : import('node-fetch').then(m => m.default(...args)));

const router = express.Router();
router.use(express.json({ limit: '2mb' }));

// POST /api/models/test { provider, config, prompt }
router.post('/test', async (req, res) => {
  const owner = 'anon';
  const { provider, config, prompt } = req.body || {};
  if (!provider || !prompt) return res.status(400).json({ ok: false, error: 'missing provider or prompt' });
  try {
    const t0 = Date.now();
    const out = await testProvider(provider, config, prompt);
    res.json({ ok: true, latencyMs: out.latencyMs, outputPreview: out.text?.slice(0, 240) || '' });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

// Placeholder infer endpoint for future runtime usage
router.post('/infer', async (req, res) => {
  return res.json({ ok: false, error: 'not-implemented' });
});

async function testProvider(provider, cfg, prompt) {
  const t0 = Date.now();
  if (provider === 'ollama') {
    const base = (cfg && cfg.baseUrl) || 'http://localhost:11434';
    const resp = await fetchFn(base + '/api/generate', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: cfg?.model || 'llama3.1', prompt, stream: false })
    });
    const j = await resp.json();
    return { text: j.response || '', latencyMs: Date.now() - t0 };
  }
  if (provider === 'custom') {
    const base = (cfg && cfg.baseUrl);
    if (!base) throw new Error('custom baseUrl required');
    const resp = await fetchFn(base + '/infer', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, params: cfg?.params || {} })
    });
    const j = await resp.json();
    return { text: j.text || j.output || '', latencyMs: Date.now() - t0 };
  }
  // TODO: add openai/anthropic/groq adapters; keep stubs for MVP
  return { text: '(test ok: stubbed)', latencyMs: Date.now() - t0 };
}

module.exports = router;


