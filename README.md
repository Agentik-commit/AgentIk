# AGENTIK
## Artificial Life Simulation Platform

**Agentik** is a sophisticated artificial life simulation platform where autonomous agents think, act, and evolve in real-time. Built for researchers, developers, and anyone fascinated by emergent behavior and artificial intelligence.

## 🎯 Features

### Multi-Agent Intelligence
Every creature has a programmable brain made of decision nodes. Watch them think, decide, and adapt in real-time as they navigate complex environments.

### Emergent Behavior  
Simple rules create complex behaviors that emerge naturally. See creatures develop strategies, form groups, and solve problems we never programmed.

### Evolution Ready
Built for studying how artificial life adapts and evolves. Researchers use this to understand adaptation, survival, and intelligence emergence.

## 🚀 Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Simulation Engine**: Phaser 3 + TypeScript
- **Build Tools**: Vite
- **Architecture**: Component-based with iframe embedding

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone [your-repo-url]
cd amorphous-fortress

# Install main dependencies
npm install

# Install simulation dependencies
cd agentik
npm install
cd ..

# Build the simulation
npm run build
```

## 🎮 Running the Application

### Development Mode
```bash
# Start the server
npm start
# or
node server.js

# Open your browser
http://localhost:5001
```

### Production Build
```bash
# Build the Phaser simulation
cd agentik
npm run build
cd ..

# Start the server
node server.js
```

## 🏗️ Project Structure

```
amorphous-fortress/
├── server.js              # Main Node.js/Express server
├── package.json           # Server dependencies
├── agentik/               # Phaser simulation app
│   ├── src/               # TypeScript source code
│   │   ├── main.ts        # Entry point
│   │   └── styles.css     # Simulation styles
│   ├── dist/              # Built assets (generated)
│   ├── package.json       # Simulation dependencies
│   └── vite.config.ts     # Build configuration
├── templates/             # Legacy Flask templates (unused)
└── README.md              # This file
```

## 🎨 Visual Features

- **Animated ASCII Logos**: Two alternating logo styles with smooth transitions
- **Scrollable Interface**: Professional introduction section with feature cards
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Terminal Aesthetic**: Green-on-black cyberpunk theme
- **Real-time Statistics**: Live agent counting and progress visualization

## 🤖 Simulation Features

- **15 Autonomous Agents**: Colorful agents with individual AI brains
- **Social Behavior**: Agents interact, communicate, and form relationships  
- **Emergent Patterns**: Complex behaviors arising from simple rules
- **Real-time Visualization**: Smooth 60fps simulation with Phaser 3
- **Interactive Controls**: View modes, brush tools, and simulation controls
- **Mobile Support**: Touch controls with pinch-to-zoom and drag-to-pan

## 🔧 Configuration

### Server Configuration
- **Port**: 5001 (configurable via `PORT` environment variable)
- **Host**: 0.0.0.0 (accessible on local network)

### Simulation Configuration
- **Canvas Size**: 800x600 (responsive)
- **Agent Count**: 15 (configurable in code)
- **Update Rate**: 60 FPS target

## 🚢 Deployment

### Local Network Access
The server runs on `0.0.0.0:5001`, making it accessible to other devices on your local network.

### Production Deployment
1. Build the simulation: `cd agentik && npm run build`
2. Set environment variables as needed
3. Run with a process manager like PM2: `pm2 start server.js`

## 🤝 Contributing

This is a research and educational project. Contributions are welcome for:
- New agent behaviors and AI algorithms
- Performance optimizations
- Mobile experience improvements
- Documentation and examples

## 📄 License

This project is for educational and research purposes. Please respect any third-party assets and libraries used.

## 🔬 Research Applications

Agentik has been designed for studying:
- Artificial life and emergent behavior
- Multi-agent systems and swarm intelligence  
- Evolutionary algorithms and adaptation
- Social dynamics in artificial populations
- Real-time decision making in autonomous systems

## 🎯 Future Roadmap

- [ ] Genetic algorithms for agent evolution
- [ ] More complex environmental interactions
- [ ] Agent memory and learning systems
- [ ] Multi-species ecosystems
- [ ] Data export for research analysis
- [ ] WebGL performance optimizations

---

**Built with ❤️ for the artificial life research community**