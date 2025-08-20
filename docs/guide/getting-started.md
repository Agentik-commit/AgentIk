# Getting Started

Welcome to Agentik! This guide will help you get the platform up and running on your machine in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **npm** or **pnpm**: Package manager
- **Git**: Version control system
- **Code Editor**: VS Code recommended with TypeScript support

### Checking Your Environment

Verify your installations:

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 8.0.0 or higher

# Check Git version
git --version   # Should be 2.0.0 or higher
```

## Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/amorphous-fortress.git
cd amorphous-fortress

# Verify the structure
ls -la
```

You should see:
```
amorphous-fortress/
├── server.js              # Main Node.js/Express server
├── package.json           # Server dependencies
├── agentik/               # Phaser simulation app
│   ├── src/               # TypeScript source code
│   ├── package.json       # Simulation dependencies
│   └── vite.config.ts     # Build configuration
├── server/                # Backend modules
│   ├── routes/            # API endpoints
│   └── lib/               # Database and utilities
└── README.md              # Project documentation
```

### 2. Install Dependencies

```bash
# Install main server dependencies
npm install

# Install simulation frontend dependencies
cd agentik
npm install
cd ..
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit the environment file
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```bash
# Server Configuration
PORT=5001
NODE_ENV=development
HOST=0.0.0.0

# Application Info
APP_NAME=Agentik
APP_VERSION=1.0.0

# Simulation Settings
MAX_AGENTS=1000
SIMULATION_FPS=20
CANVAS_WIDTH=1200
CANVAS_HEIGHT=800

# Optional: Database (PostgreSQL/Neon)
# DATABASE_URL=postgresql://user:pass@localhost:5432/agentik

# Optional: AI Provider Credentials
# CREDENTIALS_KEY=your-32-byte-encryption-key

# Optional: TinyTown Integration
# TINYTOWN_URL=http://localhost:3000
```

**Note**: The `CREDENTIALS_KEY` should be a 32-byte random string for AES-GCM encryption. Generate one with:

```bash
# Generate a secure encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development Setup

### 1. Start the Backend Server

```bash
# Start the development server
npm run dev

# You should see:
# Server running on http://0.0.0.0:5001
# Environment: development
# Database: in-memory (fallback)
```

### 2. Start the Frontend Development Server

```bash
# In a new terminal, start the frontend
cd agentik
npm run dev

# You should see:
# Local: http://localhost:5173/
# Network: http://192.168.x.x:5173/
```

### 3. Verify Installation

Open your browser and navigate to:

- **Main Application**: http://localhost:5001
- **Frontend Dev**: http://localhost:5173

You should see the Agentik landing page with:
- Animated ASCII logos
- Feature cards with terminal styling
- Navigation tabs (Home, Simulation, Create a Sim, Multiverse)

## Project Structure

Understanding the project layout will help you navigate and contribute:

```
amorphous-fortress/
├── server.js                    # Main Express server
├── package.json                 # Server dependencies and scripts
├── .env                        # Environment configuration
├── .gitignore                  # Git ignore patterns
│
├── agentik/                    # Frontend simulation application
│   ├── src/                    # TypeScript source code
│   │   ├── main.ts            # Entry point
│   │   ├── game/              # Game engine components
│   │   │   ├── core/          # ECS system
│   │   │   ├── scenes/        # Phaser scenes
│   │   │   └── world/         # World generation
│   │   └── styles.css         # Simulation styles
│   ├── dist/                   # Built assets (generated)
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Vite build configuration
│
├── server/                      # Backend modules
│   ├── routes/                 # API endpoint handlers
│   │   ├── sims.js            # Simulation templates
│   │   ├── runs.js            # Simulation execution
│   │   ├── models.js          # AI model integration
│   │   └── maps.js            # Map editor and assets
│   └── lib/                    # Core utilities
│       ├── db.js              # Database adapter
│       └── secrets.js         # Encryption utilities
│
├── public/                      # Static assets
│   ├── maps/                   # Published maps
│   └── uploads/                # User uploads
│
└── docs/                        # Documentation site
    ├── guide/                  # User guides
    ├── reference/              # API reference
    └── spec/                   # Specifications
```

## Development Commands

### Backend Commands

```bash
# Development server
npm run dev          # Start with auto-restart

# Production server
npm start            # Start production server

# Build frontend assets
npm run build        # Build and copy to public
```

### Frontend Commands

```bash
cd agentik

# Development server
npm run dev          # Start Vite dev server

# Build for production
npm run build        # Build to dist/ directory

# Preview production build
npm run preview      # Preview built assets
```

### Documentation Commands

```bash
cd docs

# Start documentation dev server
npm run docs:dev     # Start VitePress dev server

# Build documentation
npm run docs:build   # Build to .vitepress/dist

# Preview built documentation
npm run docs:preview # Preview built docs
```

## First Steps

### 1. Explore the Interface

- Navigate through the different tabs
- Observe the ASCII logo animations
- Check out the terminal-styled feature cards
- Explore the simulation interface

### 2. Test the API

```bash
# Test the health endpoint
curl http://localhost:5001/api/health

# List simulation templates
curl http://localhost:5001/api/sims/templates

# Test AI model connection
curl -X POST http://localhost:5001/api/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"ollama","prompt":"Hello"}'
```

### 3. Create Your First Simulation

1. Navigate to the "Create a Sim" tab
2. Fill out the 5-step wizard:
   - **World**: Define map dimensions and tiles
   - **Agents**: Configure agent types and behaviors
   - **Story**: Describe the simulation premise
   - **Model**: Choose AI provider and settings
   - **Review**: Confirm and save template

### 4. Run a Simulation

1. Go to the Simulation tab
2. Load your created template
3. Start the simulation
4. Observe agent behaviors and emergent patterns

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill existing Node processes
pkill -f "node server.js"

# Or change the port in .env
PORT=5002
```

**Frontend Assets Not Loading**
```bash
# Rebuild the frontend
cd agentik
npm run build
cd ..
npm start
```

**Database Connection Issues**
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- The system will fallback to in-memory storage

**AI Model Connection Issues**
- Verify provider configuration
- Check network connectivity
- Review API key permissions

### Getting Help

- **Documentation**: Check the [Troubleshooting Guide](/guide/troubleshooting)
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-org/amorphous-fortress/issues)
- **Discussions**: [Ask questions](https://github.com/your-org/amorphous-fortress/discussions)

## Next Steps

Now that you have Agentik running, explore these areas:

1. **Architecture Overview**: Understand the system design
2. **Simulation Engine**: Learn about ECS and AI systems
3. **API Reference**: Build integrations and extensions
4. **Deployment Guide**: Deploy to production environments

Welcome to the world of artificial life simulation! 🧠🌍
