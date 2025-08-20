import { createECS } from '@/game/core/ECS'
import { Needs } from '@/types'

export class NeedSystem {
  constructor(private ecs: ReturnType<typeof createECS>) {}

  update(dt: number) {
    // Gradually drift all needs over time
    for (const [e, needs] of this.ecs.view<Needs>('Needs')) {
      const drift = dt * 0.01
      needs.hunger = Math.min(100, needs.hunger + drift * 1.2)
      needs.energy = Math.max(0, needs.energy - drift * 0.8)
      needs.social = Math.max(0, needs.social - drift * 0.6)
      needs.safety = Math.max(20, needs.safety - drift * 0.3)
      needs.curiosity = Math.max(0, needs.curiosity - drift * 0.4)
    }
  }
}
