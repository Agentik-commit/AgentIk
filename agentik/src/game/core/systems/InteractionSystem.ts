import { createECS } from '@/game/core/ECS'
import { Position, Needs } from '@/types'

export class InteractionSystem {
  constructor(private ecs: ReturnType<typeof createECS>, private world: any) {}

  update(dt: number) {
    // Simple proximity-based social interaction
    const entities = Array.from(this.ecs.view<Position, Needs>('Position', 'Needs'))
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const [e1, pos1, needs1] = entities[i]
        const [e2, pos2, needs2] = entities[j]
        
        const dx = pos1.x - pos2.x
        const dy = pos1.y - pos2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        // If close enough, boost social needs
        if (dist < 30) {
          needs1.social = Math.min(100, needs1.social + dt * 0.05)
          needs2.social = Math.min(100, needs2.social + dt * 0.05)
        }
      }
    }
  }
}