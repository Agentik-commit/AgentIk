# Agentik

**Agentik** - Where autonomous agents come to life! 🎮✨

A 2D artificial life simulation built with Phaser 3, TypeScript, and Vite. Features autonomous agents with Utility AI, procedural world generation, and Tiled map support.

## Features

- **Autonomous Agents**: AI-driven entities with needs, goals, and emergent behaviors
- **Utility AI System**: Needs-based decision making with personality traits
- **Tiled Map Support**: Load custom maps with proper navigation grids
- **Procedural Fallback**: Automatic fallback to procedural generation if assets are missing
- **ECS Architecture**: Entity-Component-System for modular game logic
- **Real-time Simulation**: 60 FPS target with Web Worker support
- **World Builder**: Create and edit worlds with various tools
- **Local Persistence**: Save/load worlds using IndexedDB

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tiled Map Integration

### Required Assets

Place the following files in the `src/assets/` directory:

```
src/assets/
  tilesets/
    rpg-tiles.png            # 32x32 or 16x16 tile sheet
    rpg-tiles.tsx            # Tiled TSX file referencing rpg-tiles.png
  maps/
    overworld.json           # Tiled map export (orthogonal)
  sprites/
    villager.png             # Character spritesheet with idle/walk animations
    villager.json            # (Optional) Aseprite JSON or frame metadata
```

### Tiled Setup

1. **Create a new Tiled map** (orthogonal, 32x32 tiles)
2. **Add layers**:
   - `Ground`: Base terrain layer
   - `Deco`: Decorative elements (optional)
   - `Agents`: Object layer for spawning agents
3. **Set tile properties** in the tileset:
   - `walkable: boolean` (false for water/mountains)
   - `cost: number` (movement cost, e.g., forest=2, road=0.5)
4. **Export as JSON** to `src/assets/maps/overworld.json`

### Agent Object Properties

In the `Agents` object layer, set these properties per agent:

- `type`: Agent type (duck, amoeba, wanderer, stalker, grass)
- `name`: Custom agent name
- `hunger`, `energy`, `social`, `safety`, `curiosity`: Initial need values

## Architecture

### ECS Components

- **Position**: Grid and pixel coordinates
- **Velocity**: Movement speed and targets
- **Sprite**: Visual representation and animations
- **Brain**: AI decision making and goals
- **Needs**: Hunger, energy, social, safety, curiosity
- **Meta**: Name, type, level, experience
- **Relations**: Social connections and reputation
- **Inventory**: Items and resources

### AI Systems

- **NeedSystem**: Manages agent needs over time
- **DecisionSystem**: Utility AI goal selection
- **MovementSystem**: Pathfinding and movement
- **InteractionSystem**: Agent-to-agent and world interactions
- **RenderSystem**: Visual updates and animations

### World Types

- **Tiled World**: Loaded from Tiled JSON with navigation grid
- **Procedural World**: Generated using noise algorithms
- **Hybrid**: Tiled base with procedural modifications

## Development

### Project Structure

```
src/
  game/
    core/           # ECS, components, systems
    scenes/         # Phaser scenes
    world/          # World generation and navigation
    ai/             # AI systems and behaviors
  sim/              # Simulation logic and workers
  assets/           # Game assets (tilesets, maps, sprites)
```

### Key Commands

```bash
# Development
npm run dev           # Start dev server (localhost:5173)

# Building
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
```

## Deployment

### Vercel

The project is configured for Vercel deployment:

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

### Local Build

```bash
npm run build
# Serve dist/ directory with any static file server
```

## Performance

- **Target**: 60 FPS with 50+ agents
- **Optimizations**:
  - Pre-baked terrain to RenderTexture
  - Capped A* pathfinding expansions
  - Staggered agent decision ticks
  - Object pooling for particles
  - Auto-reduce decision rate if FPS < 50

## Browser Support

- Modern browsers with ES2020 support
- WebGL for Phaser rendering
- IndexedDB for local storage
- Web Workers for simulation logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source. Please respect the licenses of any third-party assets used.

### Asset Attribution

- **LPC Assets**: [Liberated Pixel Cup](https://lpc.opengameart.org/) - CC-BY-SA 3.0
- **Kenney Assets**: [Kenney.nl](https://kenney.nl/) - CC0
- **Tiny Swords**: [Tiny Swords](https://opengameart.org/content/tiny-swords) - CC0

## Support

For issues and questions:
- Check the existing issues
- Create a new issue with detailed information
- Include browser console logs and error messages
