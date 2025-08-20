import { World, NavWorld } from '@/types'
import { isWalkable as isWalkableOld } from './gen'
import { isWalkable as isWalkableNew, getMovementCost } from './tiledNav'

export class Pathfinder {
  private world: World | NavWorld
  private openSet: Node[]
  private closedSet: Set<string>
  private maxIterations: number
  private isNavWorld: boolean

  constructor(world: World | NavWorld, maxIterations: number = 1000) {
    this.world = world
    this.maxIterations = maxIterations
    this.isNavWorld = 'walkable' in world && Array.isArray(world.walkable)
  }

  findPath(startX: number, startY: number, endX: number, endY: number): [number, number][] {
    if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
      return []
    }

    this.openSet = []
    this.closedSet = new Set()

    const startNode: Node = { x: startX, y: startY, g: 0, h: 0, f: 0 }
    const endNode: Node = { x: endX, y: endY, g: 0, h: 0, f: 0 }

    startNode.h = this.heuristic(startNode, endNode)
    startNode.f = startNode.g + startNode.h

    this.openSet.push(startNode)

    let iterations = 0
    while (this.openSet.length > 0 && iterations < this.maxIterations) {
      iterations++

      // Find node with lowest f cost
      let currentNode = this.openSet[0]
      let currentIndex = 0
      for (let i = 1; i < this.openSet.length; i++) {
        if (this.openSet[i].f < currentNode.f) {
          currentNode = this.openSet[i]
          currentIndex = i
        }
      }

      // Remove current node from open set
      this.openSet.splice(currentIndex, 1)
      this.closedSet.add(`${currentNode.x},${currentNode.y}`)

      // Check if we reached the goal
      if (currentNode.x === endX && currentNode.y === endY) {
        return this.reconstructPath(currentNode)
      }

      // Generate neighbors
      const neighbors = this.getNeighbors(currentNode)
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`

        if (this.closedSet.has(neighborKey)) {
          continue
        }

        const movementCost = this.getMovementCost(currentNode.x, currentNode.y)
        const tentativeG = currentNode.g + movementCost

        if (!this.openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          this.openSet.push(neighbor)
        } else if (tentativeG >= neighbor.g) {
          continue
        }

        neighbor.parent = currentNode
        neighbor.g = tentativeG
        neighbor.h = this.heuristic(neighbor, endNode)
        neighbor.f = neighbor.g + neighbor.h
      }
    }

    return [] // No path found
  }

  private getNeighbors(node: Node): Node[] {
    const neighbors: Node[] = []
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal directions
    ]

    for (const [dx, dy] of directions) {
      const newX = node.x + dx
      const newY = node.y + dy

      if (this.isWalkable(newX, newY)) {
        neighbors.push({ x: newX, y: newY, g: 0, h: 0, f: 0 })
      }
    }

    return neighbors
  }

  private isWalkable(x: number, y: number): boolean {
    if (this.isNavWorld) {
      return isWalkableNew(this.world as NavWorld, x, y)
    } else {
      return isWalkableOld(this.world as World, x, y)
    }
  }

  private getMovementCost(x: number, y: number): number {
    if (this.isNavWorld) {
      return getMovementCost(this.world as NavWorld, x, y)
    } else {
      // For old world interface, default to 1
      return 1
    }
  }

  private heuristic(a: Node, b: Node): number {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  private reconstructPath(endNode: Node): [number, number][] {
    const path: [number, number][] = []
    let currentNode: Node | undefined = endNode

    while (currentNode) {
      path.unshift([currentNode.x, currentNode.y])
      currentNode = currentNode.parent
    }

    return path
  }

  // Find nearest walkable position
  findNearestWalkable(x: number, y: number): [number, number] {
    if (this.isWalkable(x, y)) {
      return [x, y]
    }

    // Search in expanding circles
    const maxRadius = Math.max(this.world.cols, this.world.rows)
    for (let radius = 1; radius < maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
            const newX = x + dx
            const newY = y + dy
            if (this.isWalkable(newX, newY)) {
              return [newX, newY]
            }
          }
        }
      }
    }

    return [x, y] // Fallback
  }
}

interface Node {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent?: Node
}
