import Phaser from 'phaser'

export interface NavWorld {
  cols: number
  rows: number
  tileSize: number
  walkable: boolean[]       // length = cols*rows
  cost?: number[]           // optional movement cost per tile
  at(x: number, y: number): number // index helper
}

export function buildNavFromTilemap(map: Phaser.Tilemaps.Tilemap, layer: Phaser.Tilemaps.TilemapLayer): NavWorld {
  const tileSize = map.tileWidth
  const cols = map.width
  const rows = map.height
  const walkable = new Array(cols * rows).fill(true)
  const cost = new Array(cols * rows).fill(1)

  const idx = (x: number, y: number) => y * cols + x

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t = layer.getTileAt(x, y)
      if (!t) continue
      
      // Read properties set in Tiled per tile (via tileset)
      const props = t.properties as any
      if (props?.walkable === false) walkable[idx(x, y)] = false
      if (typeof props?.cost === 'number') cost[idx(x, y)] = Math.max(0.1, props.cost)
    }
  }

  return {
    cols, rows, tileSize, walkable, cost,
    at(x: number, y: number) { return idx(x, y) }
  }
}

export function isWalkable(world: NavWorld, x: number, y: number): boolean {
  if (x < 0 || x >= world.cols || y < 0 || y >= world.rows) {
    return false
  }
  return world.walkable[world.at(x, y)]
}

export function getMovementCost(world: NavWorld, x: number, y: number): number {
  if (x < 0 || x >= world.cols || y < 0 || y >= world.rows) {
    return Infinity
  }
  return world.cost?.[world.at(x, y)] ?? 1
}
