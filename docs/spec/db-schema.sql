-- Agentik Database Schema
-- This file contains the complete database schema for the Agentik platform
-- Includes tables for simulation templates, runs, and provider credentials

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SIMULATION TEMPLATES
-- ============================================================================

CREATE TABLE sims_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    world JSONB NOT NULL,
    agents JSONB NOT NULL,
    story TEXT NOT NULL CHECK (LENGTH(TRIM(story)) > 0),
    model JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sims_templates_name_length CHECK (LENGTH(name) <= 100),
    CONSTRAINT sims_templates_story_length CHECK (LENGTH(story) <= 1000),
    CONSTRAINT sims_templates_world_valid CHECK (jsonb_typeof(world) = 'object'),
    CONSTRAINT sims_templates_agents_valid CHECK (jsonb_typeof(agents) = 'array'),
    CONSTRAINT sims_templates_model_valid CHECK (jsonb_typeof(model) = 'object')
);

-- Indexes for sims_templates
CREATE INDEX idx_sims_templates_owner ON sims_templates(owner);
CREATE INDEX idx_sims_templates_created_at ON sims_templates(created_at DESC);
CREATE INDEX idx_sims_templates_updated_at ON sims_templates(updated_at DESC);
CREATE INDEX idx_sims_templates_name ON sims_templates USING gin(to_tsvector('english', name));
CREATE INDEX idx_sims_templates_world_gin ON sims_templates USING gin(world);
CREATE INDEX idx_sims_templates_agents_gin ON sims_templates USING gin(agents);

-- ============================================================================
-- SIMULATION RUNS
-- ============================================================================

CREATE TABLE sims_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES sims_templates(id) ON DELETE SET NULL,
    snapshot JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stopped_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT sims_runs_snapshot_valid CHECK (jsonb_typeof(snapshot) = 'object'),
    CONSTRAINT sims_runs_status_valid CHECK (status IN ('running', 'stopped', 'completed', 'failed')),
    CONSTRAINT sims_runs_stopped_after_created CHECK (stopped_at IS NULL OR stopped_at >= created_at)
);

-- Indexes for sims_runs
CREATE INDEX idx_sims_runs_owner ON sims_runs(owner);
CREATE INDEX idx_sims_runs_template_id ON sims_runs(template_id);
CREATE INDEX idx_sims_runs_status ON sims_runs(status);
CREATE INDEX idx_sims_runs_created_at ON sims_runs(created_at DESC);
CREATE INDEX idx_sims_runs_stopped_at ON sims_runs(stopped_at DESC);
CREATE INDEX idx_sims_runs_snapshot_gin ON sims_runs USING gin(snapshot);

-- ============================================================================
-- PROVIDER CREDENTIALS
-- ============================================================================

CREATE TABLE providers_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(provider)) > 0),
    encrypted_config TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT providers_credentials_provider_length CHECK (LENGTH(provider) <= 50),
    CONSTRAINT providers_credentials_unique_owner_provider UNIQUE(owner, provider)
);

-- Indexes for providers_credentials
CREATE INDEX idx_providers_credentials_owner ON providers_credentials(owner);
CREATE INDEX idx_providers_credentials_provider ON providers_credentials(provider);
CREATE INDEX idx_providers_credentials_created_at ON providers_credentials(created_at DESC);

-- ============================================================================
-- MAPS AND ASSETS
-- ============================================================================

CREATE TABLE maps_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    map_json JSONB NOT NULL,
    published_key VARCHAR(255) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT maps_drafts_name_length CHECK (LENGTH(name) <= 100),
    CONSTRAINT maps_drafts_map_json_valid CHECK (jsonb_typeof(map_json) = 'object'),
    CONSTRAINT maps_drafts_published_key_format CHECK (published_key IS NULL OR published_key ~ '^maps/[^/]+\.json$')
);

-- Indexes for maps_drafts
CREATE INDEX idx_maps_drafts_owner ON maps_drafts(owner);
CREATE INDEX idx_maps_drafts_name ON maps_drafts USING gin(to_tsvector('english', name));
CREATE INDEX idx_maps_drafts_published_key ON maps_drafts(published_key);
CREATE INDEX idx_maps_drafts_created_at ON maps_drafts(created_at DESC);
CREATE INDEX idx_maps_drafts_updated_at ON maps_drafts(updated_at DESC);
CREATE INDEX idx_maps_drafts_map_json_gin ON maps_drafts USING gin(map_json);

CREATE TABLE maps_published (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draft_id UUID REFERENCES maps_drafts(id) ON DELETE CASCADE,
    map_key VARCHAR(255) NOT NULL UNIQUE CHECK (map_key ~ '^maps/[^/]+\.json$'),
    map_data JSONB NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT maps_published_map_data_valid CHECK (jsonb_typeof(map_data) = 'object')
);

-- Indexes for maps_published
CREATE INDEX idx_maps_published_draft_id ON maps_published(draft_id);
CREATE INDEX idx_maps_published_map_key ON maps_published(map_key);
CREATE INDEX idx_maps_published_published_at ON maps_published(published_at DESC);
CREATE INDEX idx_maps_published_map_data_gin ON maps_published USING gin(map_data);

-- ============================================================================
-- TILESETS AND ASSETS
-- ============================================================================

CREATE TABLE tilesets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type VARCHAR(100) NOT NULL,
    dimensions JSONB NULL, -- {width: 1024, height: 1024, tileSize: 32}
    metadata JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tilesets_name_length CHECK (LENGTH(name) <= 100),
    CONSTRAINT tilesets_file_path_length CHECK (LENGTH(file_path) <= 500),
    CONSTRAINT tilesets_mime_type_valid CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/gif', 'image/webp')),
    CONSTRAINT tilesets_dimensions_valid CHECK (dimensions IS NULL OR jsonb_typeof(dimensions) = 'object')
);

-- Indexes for tilesets
CREATE INDEX idx_tilesets_owner ON tilesets(owner);
CREATE INDEX idx_tilesets_name ON tilesets USING gin(to_tsvector('english', name));
CREATE INDEX idx_tilesets_mime_type ON tilesets(mime_type);
CREATE INDEX idx_tilesets_created_at ON tilesets(created_at DESC);
CREATE INDEX idx_tilesets_dimensions_gin ON tilesets USING gin(dimensions);

-- ============================================================================
-- USERS AND AUTHENTICATION (Future Implementation)
-- ============================================================================

-- Placeholder for future user management
-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_sims_templates_updated_at 
    BEFORE UPDATE ON sims_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_credentials_updated_at 
    BEFORE UPDATE ON providers_credentials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maps_drafts_updated_at 
    BEFORE UPDATE ON maps_drafts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active simulation runs
CREATE VIEW active_simulation_runs AS
SELECT 
    r.id,
    r.owner,
    r.status,
    r.created_at,
    r.stopped_at,
    t.name as template_name,
    t.world,
    t.agents
FROM sims_runs r
LEFT JOIN sims_templates t ON r.template_id = t.id
WHERE r.status = 'running';

-- View for published maps with metadata
CREATE VIEW published_maps_overview AS
SELECT 
    p.id,
    p.map_key,
    p.published_at,
    d.name,
    d.owner,
    d.map_json->>'version' as map_version,
    jsonb_array_length(d.map_json->'layers') as layer_count,
    (d.map_json->>'width')::int as map_width,
    (d.map_json->>'height')::int as map_height
FROM maps_published p
JOIN maps_drafts d ON p.draft_id = d.id;

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================

-- Insert sample simulation template
-- INSERT INTO sims_templates (owner, name, world, agents, story, model) VALUES (
--     'demo',
--     'Simple Ecosystem',
--     '{"width": 100, "height": 100, "tiles": []}',
--     '[{"name": "Herbivore", "type": "plant_eater", "count": 10}]',
--     'A simple ecosystem with herbivores and plants',
--     '{"provider": "ollama", "model": "llama3.1"}'
-- );

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*
Migration from in-memory storage to PostgreSQL:

1. Install PostgreSQL and required extensions
2. Run this schema file to create tables
3. Update environment variables:
   - DATABASE_URL=postgresql://user:pass@localhost:5432/agentik
4. The db.js module will automatically detect DATABASE_URL and use PostgreSQL
5. In-memory storage remains as fallback if database connection fails

Migration from v0.x to v1.0:
- No breaking changes to existing data
- New tables are additive
- Existing API endpoints remain compatible
- New features use new database schema

Performance Considerations:
- JSONB columns are indexed for efficient querying
- UUID primary keys provide good distribution
- Composite indexes support common query patterns
- GIN indexes enable full-text search on text fields
*/
