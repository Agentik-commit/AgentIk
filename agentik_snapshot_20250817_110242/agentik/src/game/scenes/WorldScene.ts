import Phaser from 'phaser'
import { createECS } from '@/game/core/ECS'
import { NeedSystem } from '@/game/core/systems/NeedSystem'
import { DecisionSystem } from '@/game/core/systems/DecisionSystem'
import { MovementSystem } from '@/game/core/systems/MovementSystem'
import { RenderSystem } from '@/game/core/systems/RenderSystem'
import { InteractionSystem } from '@/game/core/systems/InteractionSystem'
import { generateWorld } from '@/game/world/gen'
import { buildNavFromTilemap } from '@/game/world/tiledNav'
import { spawnFromObjects } from '@/game/world/spawnFromObjects'

export class WorldScene extends Phaser.Scene {
  ecs = createECS()
  camera!: Phaser.Cameras.Scene2D.Camera
  map?: Phaser.Tilemaps.Tilemap
  ground?: Phaser.Tilemaps.TilemapLayer
  worldData: any

  constructor(){ super('World') }

  preload () {
    // Generate procedural graphics on the fly if not already available
    if (!this.textures.exists('tileset')) {
      this.generateTileset()
    }
    if (!this.textures.exists('agent-duck')) {
      this.generateAgentSprites()
    }
  }

  create () {
    // Expose ECS for hooks (e.g., procedural spawner)
    ;(this as any).ecs = this.ecs

    const params = new URLSearchParams(window.location.search)
    const preferTiled = params.get('mode') !== 'procedural'

    let usedTiled = false
    let spawned = 0

    // --- Try Tiled first (requires both JSON+PNG to exist and tileset name to match)
    try {
      if (preferTiled && this.textures.exists('rpg-tiles') && this.cache.tilemap.exists('overworld')) {
        this.map = this.make.tilemap({ key: 'overworld' })

        // IMPORTANT: first arg must equal the tileset NAME inside your JSON (e.g., 'cybernoid')
        const tiles = this.map.addTilesetImage('cybernoid', 'rpg-tiles', 16, 16, 0, 0)

        // Some maps use index 0; others use named layer like 'Ground'
        this.ground = this.map.createLayer(0, tiles!, 0, 0) ?? this.map.createLayer('Ground', tiles!, 0, 0)
        if (!this.ground) throw new Error('No ground layer found in Tiled map.')

        this.worldData = buildNavFromTilemap(this.map, this.ground)
        spawned = spawnFromObjects(this.ecs, this.map, 'Agents') || 0
        usedTiled = true
        console.log('Successfully loaded Tiled map with', spawned, 'agents')
      }
    } catch (e) {
      console.warn('Tiled path failed, using procedural fallback:', e)
    }

    // --- Procedural fallback OR empty Tiled maps: ensure life exists
    if (!usedTiled) {
      this.worldData = generateWorld({ cols: 50, rows: 38, tileSize: 16, seed: 1337, scene: this, pretty: true })
      console.log('Using procedural world generation')
    }
    if (spawned === 0) {
      for (let i = 0; i < 12; i++) this.events.emit('spawn-demo-agent')
    }

    // --- Systems (order matters)
    this.ecs.addSystem(new NeedSystem(this.ecs))                 // needs drift
    this.ecs.addSystem(new DecisionSystem(this.ecs, this.worldData)) // choose goal/target
    this.ecs.addSystem(new InteractionSystem(this.ecs, this.worldData))          // social proximity
    this.ecs.addSystem(new MovementSystem(this.ecs, this.worldData)) // a* + move
    this.ecs.addSystem(new RenderSystem(this, this.ecs))         // draw + bubbles

    // --- Camera controls (keep simple)
    this.camera = this.cameras.main
    this.camera.setZoom(1)
    this.input.mouse?.disableContextMenu()
    let dragging=false, sx=0, sy=0
    this.input.on('wheel', (_p:any,_go:any,_dx:number,dy:number)=>{
      const z = Phaser.Math.Clamp(this.camera.zoom - dy*0.0015, 0.75, 2.2)
      this.camera.setZoom(z)
    })
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{ if(p.rightButtonDown()){ dragging=true; sx=p.x; sy=p.y } })
    this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{ if(p.rightButtonReleased()){ dragging=false } })
    this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{
      if(dragging){ this.camera.scrollX-=(p.x-sx)/this.camera.zoom; this.camera.scrollY-=(p.y-sy)/this.camera.zoom; sx=p.x; sy=p.y }
    })
  }

  update(_t:number, dt:number) { this.ecs.update(dt) }

  private generateTileset() {
    // Create a simple procedural tileset (fallback)
    const tileset = this.add.renderTexture(0, 0, 160, 16) // 10 tiles of 16x16
    
    // Grass tile
    tileset.fill(0x4a7c59, 0, 0, 16, 16)
    tileset.fill(0x3a6c49, 0, 0, 16, 16, 0.3)
    
    // Forest tile
    tileset.fill(0x2d5016, 16, 0, 16, 16)
    tileset.fill(0x1d4006, 16, 0, 16, 16, 0.4)
    
    // Water tile
    tileset.fill(0x4a90e2, 32, 0, 16, 16)
    tileset.fill(0x3a80d2, 32, 0, 16, 16, 0.2)
    
    // Mountain tile
    tileset.fill(0x8b7355, 48, 0, 16, 16)
    tileset.fill(0x7b6345, 48, 0, 16, 16, 0.3)
    
    // Crystal tile
    tileset.fill(0x9b59b6, 64, 0, 16, 16)
    tileset.fill(0x8b49a6, 64, 0, 16, 16, 0.4)
    
    tileset.saveTexture('tileset')
  }

  private generateAgentSprites() {
    // Generate simple colored circles for agents (fallback)
    const agentTypes = ['duck', 'amoeba', 'wanderer', 'stalker', 'grass']
    const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00]
    
    agentTypes.forEach((type, index) => {
      const sprite = this.add.graphics()
      sprite.fillStyle(colors[index], 1)
      sprite.fillCircle(8, 8, 6)
      sprite.lineStyle(1, 0xffffff, 1)
      sprite.strokeCircle(8, 8, 6)
      
      sprite.generateTexture(`agent-${type}`, 16, 16)
      sprite.destroy()
    })
  }
}
