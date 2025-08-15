export class NoiseGenerator {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  // Simple value noise implementation
  private hash(x: number, y: number): number {
    let h = this.seed + x * 374761393 + y * 668265263
    h = (h ^ (h >> 13)) * 1274124157
    h = h ^ (h >> 16)
    return (h & 0x7fffffff) / 0x7fffffff
  }

  // 2D noise function
  noise(x: number, y: number): number {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi

    // Interpolate between four corners
    const n00 = this.hash(xi, yi)
    const n01 = this.hash(xi, yi + 1)
    const n10 = this.hash(xi + 1, yi)
    const n11 = this.hash(xi + 1, yi + 1)

    // Smooth interpolation
    const fx = this.smoothstep(xf)
    const fy = this.smoothstep(yf)

    const nx0 = this.lerp(n00, n10, fx)
    const nx1 = this.lerp(n01, n11, fx)
    const result = this.lerp(nx0, nx1, fy)

    return result
  }

  // Smoothstep function for better interpolation
  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t)
  }

  // Linear interpolation
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  // Fractal noise (multiple octaves)
  fractal(x: number, y: number, octaves: number = 4, persistence: number = 0.5): number {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= 2
    }

    return total / maxValue
  }
}
