import { createECS } from '@/game/core/ECS'
import { Position, Velocity, Sprite, Needs } from '@/types'
import Phaser from 'phaser'

export class RenderSystem {
  private sprites: Map<number, Phaser.GameObjects.Sprite> = new Map()
  
  constructor(private scene: Phaser.Scene, private ecs: ReturnType<typeof createECS>) {}

  update(dt: number) {
    // Create sprites for new entities
    for (const [e, pos, spr] of this.ecs.view<Position, Sprite>('Position', 'Sprite')) {
      if (!this.sprites.has(e)) {
        // Create sprite using agent graphics
        const sprite = this.scene.add.sprite(pos.x, pos.y, 'agent-duck')
        sprite.setScale(1)
        this.sprites.set(e, sprite)
      }
      
      // Update sprite position
      const sprite = this.sprites.get(e)!
      sprite.setPosition(pos.x, pos.y)
      
      // Show a simple chat bubble occasionally during socialize
      const brain = this.ecs.get('Brain', e)
      if (brain?.goal === 'Socialize' && Math.random() < 0.02) {
        this.showBubble(sprite, ['hi','yo','sup','!'][Math.floor(Math.random()*4)])
      }
    }
  }
  
  private showBubble(sprite: Phaser.GameObjects.Sprite, text: string) {
    const bubble = this.scene.add.text(sprite.x, sprite.y - 20, text, {
      fontSize: '10px',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5)
    
    this.scene.time.delayedCall(1000, () => bubble.destroy())
  }
}