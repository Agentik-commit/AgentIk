import { createECS } from '@/game/core/ECS'
import { Brain, Position } from '@/types'

export type Ctx = { ecs: ReturnType<typeof createECS>, self:number, world:any }

export const Actions = {
  wander(ctx:Ctx){
    const pos = ctx.ecs.get<Position>('Position', ctx.self)!
    const brain = ctx.ecs.get<Brain>('Brain', ctx.self)!
    const ts = ctx.world.tileSize
    const cx = Math.floor(pos.x/ts), cy = Math.floor(pos.y/ts)
    const target = pickNearbyWalkable(ctx.world, cx, cy)
    brain.target = { x: target.x*ts + ts/2, y: target.y*ts + ts/2 }
    brain.goal = 'Explore'
  },
  rest(ctx:Ctx){ const b = ctx.ecs.get<Brain>('Brain',ctx.self)!; b.goal='Rest'; b.cooldown=1000 },
  socialize(ctx:Ctx){ const b = ctx.ecs.get<Brain>('Brain',ctx.self)!; b.goal='Socialize' },
  eat(ctx:Ctx){ const b = ctx.ecs.get<Brain>('Brain',ctx.self)!; b.goal='Eat' },
  hunt(ctx:Ctx){ const b = ctx.ecs.get<Brain>('Brain',ctx.self)!; b.goal='Hunt' }
}

function pickNearbyWalkable(world:any, cx:number, cy:number){
  for (const r of [4, 8, 12, 16]) {
    for (let k=0;k<40;k++) {
      const x = cx + Math.floor((Math.random()*2-1)*r)
      const y = cy + Math.floor((Math.random()*2-1)*r)
      if (x>=0 && y>=0 && x<world.cols && y<world.rows) {
        const i = y*world.cols + x
        if (world.walkable[i]) return { x, y }
      }
    }
  }
  return { x: Math.floor(world.cols/2), y: Math.floor(world.rows/2) }
}
