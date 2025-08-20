import Phaser from 'phaser'

console.log('🎮 Agentik - Artificial Life Simulation')

// Simple AI agent class
class Agent {
  public sprite: Phaser.GameObjects.Sprite
  public energy = 50 + Math.random() * 50
  public social = 50 + Math.random() * 50
  public vx = (Math.random() - 0.5) * 100
  public vy = (Math.random() - 0.5) * 100
  public lastChat = 0

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    this.sprite = scene.add.sprite(x, y, 'agent')
    this.sprite.setTint(color)
    this.sprite.setScale(1.5)
  }

  update(dt: number, agents: Agent[]) {
    // Basic AI: wander around
    this.sprite.x += this.vx * dt / 1000
    this.sprite.y += this.vy * dt / 1000

    // Bounce off edges
    if (this.sprite.x < 20 || this.sprite.x > 780) this.vx *= -1
    if (this.sprite.y < 20 || this.sprite.y > 580) this.vy *= -1

    // Keep in bounds
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 20, 780)
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 20, 580)

    // Social behavior: attracted to other agents
    let nearbyCount = 0
    for (const other of agents) {
      if (other === this) continue
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y, 
        other.sprite.x, other.sprite.y
      )
      
      if (dist < 100) {
        nearbyCount++
        // Move slightly toward nearby agents
        const angle = Phaser.Math.Angle.Between(
          this.sprite.x, this.sprite.y,
          other.sprite.x, other.sprite.y
        )
        this.vx += Math.cos(angle) * 20
        this.vy += Math.sin(angle) * 20
        
        // Boost social when near others
        this.social = Math.min(100, this.social + dt * 0.02)
        
        // Chat occasionally when close
        if (dist < 60 && Date.now() - this.lastChat > 2000 && Math.random() < 0.01) {
          this.showChatBubble()
          this.lastChat = Date.now()
        }
      }
    }

    // Decay needs over time
    this.energy = Math.max(0, this.energy - dt * 0.01)
    if (nearbyCount === 0) {
      this.social = Math.max(0, this.social - dt * 0.005)
    }

    // Random direction changes
    if (Math.random() < 0.002) {
      this.vx += (Math.random() - 0.5) * 50
      this.vy += (Math.random() - 0.5) * 50
    }

    // Limit speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 60) {
      this.vx = (this.vx / speed) * 60
      this.vy = (this.vy / speed) * 60
    }
  }

  showChatBubble() {
    const messages = ['hi!', 'hey', '👋', 'sup', ':)', '!']
    const msg = messages[Math.floor(Math.random() * messages.length)]
    
    // Mobile-responsive bubble size
    const scene = this.sprite.scene as any
    const isMobile = scene.scale.width < 768
    const fontSize = isMobile ? '10px' : '12px'
    const offsetY = isMobile ? -25 : -30
    
    const bubble = scene.add.text(
      this.sprite.x, this.sprite.y + offsetY, msg, {
        fontSize,
        backgroundColor: '#000000aa',
        padding: { x: 3, y: 1 },
        borderRadius: 4
      }
    ).setOrigin(0.5)
    
    // Fade in/out animation
    scene.tweens.add({
      targets: bubble,
      alpha: { from: 0, to: 1 },
      duration: 200,
      yoyo: true,
      delay: 1000,
      onComplete: () => bubble.destroy()
    })
  }
}

// Main simulation scene
class SimulationScene extends Phaser.Scene {
  private agents: Agent[] = []
  private statusText: Phaser.GameObjects.Text

  constructor() { super('Simulation') }
  
  preload() {
    console.log('🔄 Loading simulation...')
    
    // Create agent textures with different colors
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd]
    colors.forEach((color, i) => {
      this.add.graphics()
        .fillStyle(color)
        .fillCircle(8, 8, 7)
        .lineStyle(1, 0xffffff)
        .strokeCircle(8, 8, 7)
        .generateTexture(`agent`, 16, 16)
        .destroy()
    })
  }
  
  create() {
    console.log('✅ Creating artificial life simulation...')
    console.log('🎮 Scene size:', this.scale.width, 'x', this.scale.height)
    
    // Add background grid
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x333333, 0.3)
    for (let x = 0; x < 800; x += 40) {
      graphics.moveTo(x, 0).lineTo(x, 600)
    }
    for (let y = 0; y < 600; y += 40) {
      graphics.moveTo(0, y).lineTo(800, y)
    }
    graphics.strokePath()
    
    // Create agents
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd]
    for (let i = 0; i < 15; i++) {
      const x = 50 + Math.random() * 700
      const y = 50 + Math.random() * 500
      const color = colors[i % colors.length]
      const agent = new Agent(this, x, y, color)
      this.agents.push(agent)
      console.log(`🤖 Created agent ${i+1} at (${x.toFixed(0)}, ${y.toFixed(0)})`)
    }
    
    // Mobile-responsive title
    const titleSize = Math.min(24, Math.max(14, this.scale.width / 30))
    this.add.text(20, 20, 'Agentik - Artificial Life', {
      fontSize: `${titleSize}px`,
      color: '#00ff88',
      fontWeight: 'bold'
    })
    
    // Mobile-responsive status display
    const statusSize = Math.min(14, Math.max(10, this.scale.width / 60))
    this.statusText = this.add.text(20, 20 + titleSize + 10, '', {
      fontSize: `${statusSize}px`,
      color: '#ffffff'
    })
    
    // Add mobile hint
    if (this.scale.width < 768) {
      this.add.text(this.scale.width - 20, this.scale.height - 60, 
        'Pinch to zoom\nDrag to pan', {
        fontSize: '11px',
        color: '#888888',
        align: 'right'
      }).setOrigin(1, 0)
    }
    
    // Enhanced mobile-friendly camera controls
    this.input.mouse?.disableContextMenu()
    let dragging = false, startX = 0, startY = 0
    let lastPointers: Phaser.Input.Pointer[] = []
    let lastDistance = 0
    let isZooming = false
    
    // Mouse wheel zoom (desktop)
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoomFactor = deltaY > 0 ? 0.9 : 1.1
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom * zoomFactor, 0.2, 4)
      this.cameras.main.setZoom(newZoom)
    })
    
    // Touch and mouse input
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      lastPointers = this.input.activePointer ? [this.input.activePointer] : []
      
      if (this.input.manager.pointersTotal === 1) {
        // Single touch/click - start dragging
        dragging = true
        startX = p.worldX
        startY = p.worldY
        isZooming = false
      } else if (this.input.manager.pointersTotal === 2) {
        // Two finger touch - start pinch zoom
        dragging = false
        isZooming = true
        const pointers = Object.values(this.input.manager.pointers).filter(p => p.isDown)
        if (pointers.length === 2) {
          lastDistance = Phaser.Math.Distance.Between(
            pointers[0].x, pointers[0].y,
            pointers[1].x, pointers[1].y
          )
        }
      }
    })
    
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.input.manager.pointersTotal === 0) {
        dragging = false
        isZooming = false
      } else if (this.input.manager.pointersTotal === 1) {
        // Back to single touch after pinch
        isZooming = false
        dragging = true
        const activePointer = this.input.activePointer
        if (activePointer) {
          startX = activePointer.worldX
          startY = activePointer.worldY
        }
      }
    })
    
    // Smooth panning and pinch zoom
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.input.manager.pointersTotal === 1 && dragging && !isZooming) {
        // Single finger/mouse drag - pan camera
        const cam = this.cameras.main
        const deltaX = (startX - p.worldX) * 0.8 // Smooth panning
        const deltaY = (startY - p.worldY) * 0.8
        cam.scrollX += deltaX
        cam.scrollY += deltaY
        startX = p.worldX
        startY = p.worldY
      } else if (this.input.manager.pointersTotal === 2 && isZooming) {
        // Two finger pinch - zoom
        const pointers = Object.values(this.input.manager.pointers).filter(p => p.isDown)
        if (pointers.length === 2) {
          const currentDistance = Phaser.Math.Distance.Between(
            pointers[0].x, pointers[0].y,
            pointers[1].x, pointers[1].y
          )
          
          if (lastDistance > 0) {
            const zoomFactor = currentDistance / lastDistance
            const newZoom = Phaser.Math.Clamp(
              this.cameras.main.zoom * zoomFactor, 
              0.2, 4
            )
            this.cameras.main.setZoom(newZoom)
          }
          lastDistance = currentDistance
        }
      }
    })
    
    console.log('🎯 Simulation ready! 15 autonomous agents created')
  }
  
  update(_time: number, delta: number) {
    // Update all agents
    for (const agent of this.agents) {
      agent.update(delta, this.agents)
    }
    
    // Update status
    const avgEnergy = this.agents.reduce((sum, a) => sum + a.energy, 0) / this.agents.length
    const avgSocial = this.agents.reduce((sum, a) => sum + a.social, 0) / this.agents.length
    
    // Mobile-friendly status text
    const isMobile = this.scale.width < 768
    if (isMobile) {
      this.statusText.setText([
        `${this.agents.length} agents`,
        `E:${avgEnergy.toFixed(0)} S:${avgSocial.toFixed(0)}`
      ].join(' | '))
    } else {
      this.statusText.setText([
        `Agents: ${this.agents.length}`,
        `Avg Energy: ${avgEnergy.toFixed(1)}`,
        `Avg Social: ${avgSocial.toFixed(1)}`,
        `Controls: Drag to pan, scroll/pinch to zoom`
      ].join('\n'))
    }
  }
  
  resize(width: number, height: number) {
    // Update any UI elements that need repositioning
    // The camera and game objects will auto-adjust with RESIZE mode
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#0b0f14',
  pixelArt: true,
  scene: [SimulationScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

console.log('🚀 Starting Agentik simulation...')
const game = new Phaser.Game(config)

// Listen for resize messages from parent frame
window.addEventListener('message', (event) => {
  if (event.data?.type === 'resize') {
    const { width, height } = event.data
    game.scale.resize(width, height)
    console.log(`🔄 Resized to ${width}x${height}`)
  }
})

// Handle browser fullscreen changes
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    game.scale.resize(window.innerWidth, window.innerHeight)
  } else {
    game.scale.resize(800, 600)
  }
})
