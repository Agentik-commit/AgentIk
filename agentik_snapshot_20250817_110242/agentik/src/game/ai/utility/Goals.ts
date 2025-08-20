import { Actions, Ctx } from './Actions'

export type Goal = { id:string; score:(ctx:Ctx)=>number; run:(ctx:Ctx)=>void }

export const Goals: Goal[] = [
  { id:'Eat',       score: ({ecs,self})=> (ecs.get('Needs',self)!.hunger/100)*1.4, run: Actions.eat },
  { id:'Rest',      score: ({ecs,self})=> 1 - (ecs.get('Needs',self)!.energy/100), run: Actions.rest },
  { id:'Socialize', score: ({ecs,self})=> 1 - (ecs.get('Needs',self)!.social/100), run: Actions.socialize },
  { id:'Explore',   score: ({ecs,self})=> (ecs.get('Needs',self)!.curiosity/100)*1.1, run: Actions.wander },
  { id:'Hunt',      score: (_)=> 0.2 + Math.random()*0.1, run: Actions.hunt }
]
