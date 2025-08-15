import { Goal } from './Goals'
import { Ctx } from './Actions'

export function chooseGoal(ctx:Ctx): Goal {
  // Simple ε-greedy selection over listed goals
  let best: Goal | null = null
  let bestScore = -Infinity
  for (const g of (require('./Goals') as any).Goals as Goal[]) {
    const s = g.score(ctx) + Math.random()*0.03
    if (s > bestScore) { best = g; bestScore = s }
  }
  return best!
}
