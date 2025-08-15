import { Needs } from '@/types'

export function norm(needs: Needs): Needs {
  return {
    hunger: needs.hunger / 100,
    energy: needs.energy / 100,
    social: needs.social / 100,
    safety: needs.safety / 100,
    curiosity: needs.curiosity / 100
  }
}