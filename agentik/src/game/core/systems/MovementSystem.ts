import { createECS } from '@/game/core/ECS'
import { Position, Velocity, Brain } from '@/types'

export class MovementSystem {
  constructor(private ecs: ReturnType<typeof createECS>, private world: any) {}

  update(dt: number) {
    for (const [e, pos, vel] of this.ecs.view<Position, Velocity>('Position', 'Velocity')) {
      const brain = this.ecs.get<Brain>('Brain', e)
      
      // If we have a target, move towards it
      if (brain?.target) {
        const dx = brain.target.x - pos.x
        const dy = brain.target.y - pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist > 2) {
          const speed = vel.speed * dt / 1000
          vel.x = (dx / dist) * speed
          vel.y = (dy / dist) * speed
          pos.x += vel.x
          pos.y += vel.y
        } else {
          // Reached target
          brain.target = undefined
          vel.x = 0
          vel.y = 0
        }
      } else {
        // No target, slow down
        vel.x *= 0.9
        vel.y *= 0.9
        pos.x += vel.x * dt / 1000
        pos.y += vel.y * dt / 1000
      }
      
      // Keep in bounds
      pos.x = Math.max(0, Math.min(this.world.cols * this.world.tileSize, pos.x))
      pos.y = Math.max(0, Math.min(this.world.rows * this.world.tileSize, pos.y))
    }
  }
}