---
layout: home
hero:
  name: Agentik
  text: Artificial Life Simulation Platform
  tagline: Create, run, and observe autonomous agent simulations in procedurally generated or custom-designed worlds
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View API
      link: /reference/api
    - theme: alt
      text: Architecture
      link: /guide/architecture

features:
  - icon: 🧠
    title: Agent Autonomy
    details: Advanced AI-driven agents with needs, goals, and decision-making systems that create emergent behaviors
  - icon: 🌍
    title: World Builder
    details: Integrated map editor supporting Tiled JSON format with custom tilesets and procedural generation
  - icon: ⚡
    title: High Performance
    details: ECS-based simulation engine with configurable tick rates and optimized rendering
  - icon: 🔗
    title: AI Integration
    details: Support for multiple AI providers including Ollama, OpenAI, Anthropic, Groq, and custom endpoints
  - icon: 💾
    title: Persistence
    details: Save/load simulation templates and runs with database integration and cloud storage
  - icon: 🌌
    title: Multiverse
    details: Browse and observe public simulation worlds in a shared gallery of artificial life experiments
---

## Quick Navigation

<div class="vp-raw">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <a href="/guide/getting-started" class="block p-4 border rounded-lg hover:border-primary transition-colors">
      <h3 class="text-lg font-semibold mb-2">🚀 Quickstart</h3>
      <p class="text-sm text-gray-600">Get up and running with Agentik in minutes</p>
    </a>
    
    <a href="/guide/architecture" class="block p-4 border rounded-lg hover:border-primary transition-colors">
      <h3 class="text-lg font-semibold mb-2">🏗️ Architecture</h3>
      <p class="text-sm text-gray-600">Understand the system design and components</p>
    </a>
    
    <a href="/guide/simulation-engine" class="block p-4 border rounded-lg hover:border-primary transition-colors">
      <h3 class="text-lg font-semibold mb-2">⚙️ Simulation Engine</h3>
      <p class="text-sm text-gray-600">Learn about ECS, AI systems, and performance</p>
    </a>
    
    <a href="/reference/api" class="block p-4 border rounded-lg hover:border-primary transition-colors">
      <h3 class="text-lg font-semibold mb-2">📡 API Reference</h3>
      <p class="text-sm text-gray-600">Complete REST API documentation</p>
    </a>
    
    <a href="/guide/deployment" class="block p-4 border rounded-lg hover:border-primary transition-colors">
      <h3 class="text-lg font-semibold mb-2">🚢 Deployment</h3>
      <p class="text-sm text-gray-600">Deploy to production environments</p>
    </a>
    
    <a href="/guide/troubleshooting" class="block p-4 border rounded-lg hover:border-primary transition-colors">
      <h3 class="text-lg font-semibold mb-2">🔧 Troubleshooting</h3>
      <p class="text-sm text-gray-600">Common issues and solutions</p>
    </a>
  </div>
</div>

## What is Agentik?

Agentik is a sophisticated artificial life simulation platform that enables researchers, developers, and enthusiasts to create, run, and observe autonomous agent simulations. Built with modern web technologies, it provides a complete ecosystem for artificial life research, education, and experimentation.

### Key Capabilities

- **Multi-Agent Systems**: Create complex ecosystems with hundreds of autonomous agents
- **Emergent Behavior**: Watch simple rules create complex, unpredictable behaviors
- **Real-time Visualization**: Phaser 3-powered rendering with live statistics
- **Extensible Architecture**: Plugin system for custom behaviors and systems
- **Cloud Integration**: Deploy simulations and share results globally

### Technology Stack

- **Backend**: Node.js + Express with modular API design
- **Frontend**: Vite + TypeScript + Phaser 3 for high-performance rendering
- **Database**: PostgreSQL with JSONB support and in-memory fallback
- **AI Integration**: Multiple provider support with encryption and security
- **Deployment**: Vercel, Railway, and traditional hosting support

## Getting Started

Ready to dive in? Start with our [Quickstart Guide](/guide/getting-started) to get Agentik running on your machine in minutes.

For developers, check out the [Architecture Overview](/guide/architecture) to understand the system design, or jump straight to the [API Reference](/reference/api) to start building integrations.

## Community & Support

- **GitHub**: [Repository](https://github.com/your-org/amorphous-fortress)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/your-org/amorphous-fortress/issues)
- **Discussions**: [Community Q&A](https://github.com/your-org/amorphous-fortress/discussions)

## License

Agentik is open source software released under the [MIT License](https://opensource.org/licenses/MIT).
