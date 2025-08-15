import { createECS } from '@/game/core/ECS'

export type Entity = number
export type NeedKey = 'hunger' | 'energy' | 'social' | 'safety' | 'curiosity'
export interface Needs { hunger: number; energy: number; social: number; safety: number; curiosity: number }
export interface Goal { id: string; score: (ctx: Ctx) => number; action: (ctx: Ctx) => Action }
export interface Action { id: string; run: (ctx: Ctx) => void; estimateCost?: (ctx: Ctx) => number }
export interface Ctx { world: World | NavWorld; self: Entity; ecs: ReturnType<typeof createECS> }

// Additional component types needed
export interface Position { x: number; y: number }
export interface Velocity { x: number; y: number; speed: number }
export interface Sprite { facing: string }
export interface Brain { goal: string; target?: { x: number; y: number }; cooldown?: number }

export interface World {
  grid: number[][]
  tileset: Record<number, TileDef>
  terrainCounts: Record<number, number>
  cols: number
  rows: number
  tileSize: number
  seed: number
}

export interface NavWorld {
  cols: number
  rows: number
  tileSize: number
  walkable: boolean[]       // length = cols*rows
  cost?: number[]           // optional movement cost per tile
  at(x: number, y: number): number // index helper
}

export interface TileDef {
  id: number
  name: string
  walkable: boolean
  color: number
  resourceValue: number
}

export interface Agent {
  id: string
  type: 'duck' | 'amoeba' | 'wanderer' | 'stalker' | 'grass'
  name: string
  position: [number, number]
  needs: Needs
  personality: Personality
  currentGoal?: string
  currentAction?: string
  inventory: string[]
  relationships: Record<string, number>
}

export interface Personality {
  curiosityWeight: number
  safetyWeight: number
  socialWeight: number
  aggressionWeight: number
  energyWeight: number
}
