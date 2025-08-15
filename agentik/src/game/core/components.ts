import { Needs, Personality } from '@/types'

export interface Position {
  x: number
  y: number
  gridX: number
  gridY: number
}

export interface Velocity {
  x: number
  y: number
  targetX?: number
  targetY?: number
  speed: number
}

export interface Sprite {
  key: string
  frame?: string
  scale: number
  tint: number
  alpha: number
}

export interface Brain {
  currentGoal: string
  currentAction: string
  actionProgress: number
  actionDuration: number
  lastDecisionTime: number
  decisionCooldown: number
}

export interface AgentNeeds {
  needs: Needs
  decayRates: Partial<Needs>
  modifiers: Partial<Needs>
}

export interface Inventory {
  items: string[]
  capacity: number
  gold: number
}

export interface Relations {
  relationships: Record<string, number>
  affinity: number
  reputation: number
}

export interface Meta {
  name: string
  type: string
  description: string
  level: number
  experience: number
}

export interface Collider {
  solid: boolean
  size: number
  offsetX: number
  offsetY: number
}

export interface StatusBars {
  energyBar: Phaser.GameObjects.Graphics
  socialBar: Phaser.GameObjects.Graphics
  visible: boolean
}
