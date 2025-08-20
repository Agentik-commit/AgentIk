// Minimal world generation for the working simulation
export function generateWorld(params: any) {
  const { cols = 50, rows = 38, tileSize = 16, scene } = params
  
  // Create a simple walkable grid
  const walkable = new Array(cols * rows).fill(true)
  
  // Add some obstacles randomly
  for (let i = 0; i < walkable.length; i++) {
    if (Math.random() < 0.1) walkable[i] = false
  }
  
  const world = {
    cols,
    rows,
    tileSize,
    walkable,
    at(x: number, y: number) { return y * cols + x }
  }
  
  // Set up agent spawning
  scene?.events.on('spawn-demo-agent', () => {
    const ecs = (scene as any).ecs
    if (!ecs) return
    
    // Find a random walkable position
    let x, y
    do {
      x = Math.random() * cols * tileSize
      y = Math.random() * rows * tileSize
    } while (!walkable[Math.floor(y/tileSize) * cols + Math.floor(x/tileSize)])
    
    const e = ecs.createEntity()
    ecs.addComponent('Position', e, { x, y })
    ecs.addComponent('Velocity', e, { x: 0, y: 0, speed: 60 + Math.random() * 30 })
    ecs.addComponent('Sprite', e, { facing: 'down' })
    ecs.addComponent('Needs', e, { 
      hunger: 30 + Math.random() * 40, 
      energy: 50 + Math.random() * 40, 
      social: 40 + Math.random() * 30, 
      safety: 60, 
      curiosity: 50 + Math.random() * 40 
    })
    ecs.addComponent('Brain', e, { goal: 'Idle' })
  })
  
  return world
}