# Agentik - Artificial Life Simulation Platform

A sophisticated artificial life simulation platform that enables users to create, run, and observe autonomous agent simulations in procedurally generated or custom-designed worlds. Built with Node.js/Express backend and Phaser 3 frontend, Agentik provides a complete ecosystem for artificial life research, education, and experimentation.

## Features

- **Agent Autonomy**: Advanced AI-driven agents with needs, goals, and decision-making systems
- **Simulation Engine**: High-performance ECS-based simulation loop with configurable tick rates
- **World Builder**: Integrated map editor supporting Tiled JSON format and custom tilesets
- **Persistence**: Save/load simulation templates and runs with database integration
- **Multiverse Gallery**: Browse and observe public simulation worlds
- **AI Integration**: Support for multiple AI providers (Ollama, OpenAI, Anthropic, Groq, Custom)
- **Real-time Visualization**: Phaser 3-powered rendering with live statistics and controls
- **Modular Architecture**: Clean separation between simulation logic and presentation layer

## Architecture Overview

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐    ┌─────────────────┐
│   Client (UI)   │ ←──────────────────→ │  Express API    │ ←→ │   Database      │
│   (Phaser 3)    │                      │   (Node.js)     │    │   (In-Memory/   │
│                 │                      │                 │    │    Postgres)    │
└─────────────────┘                      └─────────────────┘    └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                      ┌─────────────────┐
│  Simulation     │                      │   Map Editor    │
│   Worker        │                      │   & Assets      │
│  (ECS + AI)     │                      │                 │
└─────────────────┘                      └─────────────────┘
```

The system uses a client-server architecture where:
- **Client**: Phaser 3 handles rendering and user interaction
- **API**: Express.js serves simulation data and manages persistence
- **Worker**: ECS-based simulation runs at 10-20Hz for performance
- **Database**: In-memory storage with optional Postgres/Neon integration

## Quickstart

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd amorphous-fortress
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd agentik && npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev          # Start backend server
   cd agentik && npm run dev  # Start frontend dev server
   ```

5. **Build for production**
   ```bash
   npm run build       # Build frontend assets
   npm start           # Start production server
   ```

### Development Commands

- `npm run dev` - Start backend server in development mode
- `npm run build` - Build frontend assets
- `npm start` - Start production server
- `cd agentik && npm run dev` - Start frontend dev server
- `cd agentik && npm run build` - Build frontend for production

## Environment Variables

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `PORT` | Server port | `5001` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `HOST` | Server host | `0.0.0.0` | No |
| `APP_NAME` | Application name | `Agentik` | No |
| `APP_VERSION` | Application version | `1.0.0` | No |
| `MAX_AGENTS` | Maximum agents per simulation | `1000` | No |
| `SIMULATION_FPS` | Simulation tick rate | `20` | No |
| `CANVAS_WIDTH` | Default canvas width | `1200` | No |
| `CANVAS_HEIGHT` | Default canvas height | `800` | No |
| `DEBUG` | Enable debug logging | `false` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `TINYTOWN_URL` | TinyTown integration URL | - | No |
| `SUPABASE_URL` | Supabase database URL | - | No |
| `SUPABASE_SERVICE_ROLE` | Supabase service role key | - | No |
| `DATABASE_URL` | Neon/Postgres connection string | - | No |
| `CREDENTIALS_KEY` | Encryption key for API credentials | - | No |

## Troubleshooting

### Common Issues

**Map not loading**
- Check browser console for CORS errors
- Verify tileset files are accessible
- Ensure map JSON format is valid Tiled format

**Worker not starting**
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check server logs for error messages

**CORS/CSP issues**
- Verify security headers in server.js
- Check iframe embedding permissions
- Ensure proper Content-Security-Policy

**Database connection**
- Verify environment variables are set
- Check database service is running
- Fallback to in-memory storage if needed

**Assets not loading**
- Verify Vite build output in `agentik/dist/`
- Check asset paths in `vite.config.ts`
- Ensure `base: './'` is set for relative paths

### Performance Optimization

- Reduce `MAX_AGENTS` for large simulations
- Lower `SIMULATION_FPS` for better performance
- Use object pooling for frequently created entities
- Implement spatial partitioning for collision detection

## Documentation

For comprehensive documentation, visit our [docs site](./docs/) or run locally:

```bash
cd docs
npm install
npm run docs:dev
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and contribution workflow.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Security

For security issues, please see [SECURITY.md](./SECURITY.md) for reporting procedures.