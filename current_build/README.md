# Agentik (Current Build)

This folder contains only the files used by the current local build.

- Start locally:
  - npm install
  - PORT=5001 npm start

- Structure:
  - server.js (Express server, serves agentik/dist and API routes)
  - server/routes/*, server/lib/*
  - package.json (start/dev only)
  - agentik/dist/** (built frontend)
  - public/** (static JSON/PNG/JPG/etc when added)

Notes:
- "Multiverse" page and TinyTown proxy are placeholders; they will 404 unless services are running.
- Only use `npm start`; there is no build step in this bundle.
