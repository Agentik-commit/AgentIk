export type Entity = number
export interface ComponentMap { [key: string]: Map<Entity, any> }

export interface System { update(dt: number): void }

export function createECS () {
  let nextId = 1
  const components: ComponentMap = {}
  const systems: System[] = []
  return {
    createEntity (): Entity { return nextId++ },
    addComponent<T>(name: string, e: Entity, data: T) {
      if (!components[name]) components[name] = new Map()
      components[name].set(e, data)
    },
    get<T>(name: string, e: Entity): T | undefined { return components[name]?.get(e) },
    view<T1=unknown,T2=unknown>(a: string, b?: string) {
      const A = components[a] ?? new Map()
      const B = b ? (components[b] ?? new Map()) : null
      return {
        *[Symbol.iterator](){
          for (const [e, ca] of A) {
            if (!B || B.has(e)) yield [e, ca, B?.get(e)] as const
          }
        }
      }
    },
    addSystem (s: System) { systems.push(s) },
    update (dt: number) { for (const s of systems) s.update(dt) }
  }
}
