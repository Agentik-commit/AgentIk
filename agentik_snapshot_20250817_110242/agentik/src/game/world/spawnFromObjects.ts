import type Phaser from 'phaser'
import { createECS } from '@/game/core/ECS'

export function spawnFromObjects(
  ecs: ReturnType<typeof createECS>,
  map: Phaser.Tilemaps.Tilemap,
  layerName: string
){
  const layer = map.getObjectLayer(layerName)
  if (!layer) return 0
  let count = 0

  for (const obj of layer.objects) {
    const e = ecs.createEntity()
    const x = (obj.x ?? 0)
    const y = (obj.y ?? 0) - (obj.height ?? 32)

    ecs.addComponent('Position', e, { x, y })
    ecs.addComponent('Velocity', e, { x: 0, y: 0, speed: 60 + Math.random()*30 })
    ecs.addComponent('Sprite', e, { facing: 'down' })

    // REQUIRED for planning & movement
    ecs.addComponent('Needs', e, {
      hunger: 30 + Math.random()*20,
      energy: 70,
      social: 50,
      safety: 60,
      curiosity: 60
    })
    ecs.addComponent('Brain', e, { goal: 'Idle' })

    count++
  }
  return count
}
