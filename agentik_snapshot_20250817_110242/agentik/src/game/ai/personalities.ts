import { Personality } from '@/types'

export class Personalities {
  static Duck: Personality = {
    curiosityWeight: 1.2,
    safetyWeight: 1.5,
    socialWeight: 0.8,
    aggressionWeight: 0.3,
    energyWeight: 1.0
  }

  static Amoeba: Personality = {
    curiosityWeight: 0.6,
    safetyWeight: 0.8,
    socialWeight: 1.3,
    aggressionWeight: 0.2,
    energyWeight: 1.4
  }

  static Wanderer: Personality = {
    curiosityWeight: 1.4,
    safetyWeight: 0.7,
    socialWeight: 1.6,
    aggressionWeight: 0.1,
    energyWeight: 0.9
  }

  static Stalker: Personality = {
    curiosityWeight: 0.8,
    safetyWeight: 1.1,
    socialWeight: 0.4,
    aggressionWeight: 1.8,
    energyWeight: 1.2
  }

  static Grass: Personality = {
    curiosityWeight: 0.3,
    safetyWeight: 1.0,
    socialWeight: 0.5,
    aggressionWeight: 0.0,
    energyWeight: 1.6
  }

  static getPersonality(type: string): Personality {
    switch (type.toLowerCase()) {
      case 'duck':
        return Personalities.Duck
      case 'amoeba':
        return Personalities.Amoeba
      case 'wanderer':
        return Personalities.Wanderer
      case 'stalker':
        return Personalities.Stalker
      case 'grass':
        return Personalities.Grass
      default:
        return Personalities.Duck // Default fallback
    }
  }

  static createRandomPersonality(): Personality {
    return {
      curiosityWeight: 0.5 + Math.random(),
      safetyWeight: 0.5 + Math.random(),
      socialWeight: 0.5 + Math.random(),
      aggressionWeight: 0.5 + Math.random(),
      energyWeight: 0.5 + Math.random()
    }
  }

  static createCustomPersonality(overrides: Partial<Personality>): Personality {
    const base = Personalities.Duck
    return { ...base, ...overrides }
  }
}
