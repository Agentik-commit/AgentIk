import { createECS } from '@/game/core/ECS'
import { Brain } from '@/types'
import { chooseGoal } from '@/game/ai/utility/Planner'
import { Actions } from '@/game/ai/utility/Actions'

export class DecisionSystem{
  accumulator = 0
  constructor(private ecs: ReturnType<typeof createECS>, private world:any){}

  update(dt:number){
    this.accumulator += dt
    if (this.accumulator < 200) return // 5 Hz
    this.accumulator = 0

    const brains = (this.ecs as any).components?.['Brain'] || new Map<number, Brain>()
    for (const [e, brainAny] of brains) {
      const b = brainAny as Brain
      if ((b as any).cooldown && (b as any).cooldown > 0) { (b as any).cooldown -= 200; continue }
      const goal = chooseGoal({ ecs: this.ecs, self: e, world: this.world })
      goal.run({ ecs: this.ecs, self: e, world: this.world })

      // Safety net: ensure a movement target exists
      const now = this.ecs.get<Brain>('Brain', e)!
      if (!(now as any).target) Actions.wander({ ecs: this.ecs, self: e, world: this.world })
    }
  }
}
