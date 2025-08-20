// Minimal DB adapter: in-memory by default; TODO: implement Neon/Supabase by env
const { randomUUID } = require('crypto');

const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE);
const useNeon = !!process.env.DATABASE_URL;

// In-memory fallback stores
const mem = {
  sims_templates: new Map(),
  sims_runs: new Map(),
  providers_credentials: new Map(),
};

async function upsertTemplate(owner, tpl) {
  if (!tpl.id) tpl.id = randomUUID();
  tpl.owner = owner;
  tpl.created_at = tpl.created_at || new Date().toISOString();
  tpl.updated_at = new Date().toISOString();
  mem.sims_templates.set(tpl.id, tpl);
  return tpl;
}

async function listTemplates(owner) {
  return Array.from(mem.sims_templates.values()).filter(t => t.owner === owner);
}

async function getTemplate(owner, id) {
  const t = mem.sims_templates.get(id);
  if (!t || t.owner !== owner) return null;
  return t;
}

async function deleteTemplate(owner, id) {
  const t = mem.sims_templates.get(id);
  if (!t || t.owner !== owner) return false;
  mem.sims_templates.delete(id);
  return true;
}

async function startRun(owner, snapshot, templateId) {
  const id = randomUUID();
  const row = {
    id, owner,
    template_id: templateId || null,
    snapshot,
    status: 'running',
    created_at: new Date().toISOString(),
    stopped_at: null,
  };
  mem.sims_runs.set(id, row);
  return row;
}

async function stopRun(owner, runId) {
  const r = mem.sims_runs.get(runId);
  if (!r || r.owner !== owner) return null;
  r.status = 'stopped';
  r.stopped_at = new Date().toISOString();
  return r;
}

async function saveProviderCred(owner, provider, row) {
  const id = randomUUID();
  const rec = { id, owner, provider, ...row, created_at: new Date().toISOString() };
  mem.providers_credentials.set(id, rec);
  return rec;
}

async function getProviderCred(owner, provider) {
  for (const rec of mem.providers_credentials.values()) {
    if (rec.owner === owner && rec.provider === provider) return rec;
  }
  return null;
}

module.exports = {
  useSupabase, useNeon,
  upsertTemplate, listTemplates, getTemplate, deleteTemplate,
  startRun, stopRun,
  saveProviderCred, getProviderCred,
};



