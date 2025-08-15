// Web Worker for simulation logic
// This runs at 10-20 Hz to avoid blocking the main thread

interface SimulationState {
  step: number
  agents: AgentState[]
  world: WorldState
  events: SimulationEvent[]
}

interface AgentState {
  id: number
  position: [number, number]
  needs: NeedsState
  currentGoal: string
  currentAction: string
}

interface NeedsState {
  hunger: number
  energy: number
  social: number
  safety: number
  curiosity: number
}

interface WorldState {
  grid: number[][]
  resources: ResourceState[]
}

interface ResourceState {
  type: string
  position: [number, number]
  value: number
}

interface SimulationEvent {
  type: string
  agentId: number
  message: string
  timestamp: number
}

let simulationState: SimulationState
let isRunning = false
let stepInterval: number

// Initialize simulation
function initializeSimulation() {
  simulationState = {
    step: 0,
    agents: [],
    world: {
      grid: [],
      resources: []
    },
    events: []
  }
  
  // Create initial world grid (25x19)
  for (let y = 0; y < 19; y++) {
    simulationState.world.grid[y] = []
    for (let x = 0; x < 25; x++) {
      // Simple terrain generation
      if (x < 2 || x > 22 || y < 2 || y > 16) {
        simulationState.world.grid[y][x] = 2 // Water
      } else if (Math.random() < 0.1) {
        simulationState.world.grid[y][x] = 3 // Mountain
      } else if (Math.random() < 0.2) {
        simulationState.world.grid[y][x] = 1 // Forest
      } else {
        simulationState.world.grid[y][x] = 0 // Grass
      }
    }
  }
  
  // Spawn initial agents
  spawnInitialAgents()
  
  // Add initial resources
  spawnResources()
}

function spawnInitialAgents() {
  const agentTypes = ['duck', 'amoeba', 'wanderer', 'stalker', 'grass']
  
  for (let i = 0; i < 10; i++) {
    const agentType = agentTypes[i % agentTypes.length]
    
    // Find walkable position
    let x, y
    do {
      x = Math.floor(Math.random() * 25)
      y = Math.floor(Math.random() * 19)
    } while (simulationState.world.grid[y][x] !== 0) // Only grass
    
    simulationState.agents.push({
      id: i + 1,
      position: [x, y],
      needs: {
        hunger: 50 + Math.random() * 50,
        energy: 50 + Math.random() * 50,
        social: 50 + Math.random() * 50,
        safety: 50 + Math.random() * 50,
        curiosity: 50 + Math.random() * 50
      },
      currentGoal: 'explore',
      currentAction: 'wander'
    })
  }
}

function spawnResources() {
  // Add some resources to the world
  for (let i = 0; i < 20; i++) {
    let x, y
    do {
      x = Math.floor(Math.random() * 25)
      y = Math.floor(Math.random() * 19)
    } while (simulationState.world.grid[y][x] !== 0)
    
    simulationState.world.resources.push({
      type: 'food',
      position: [x, y],
      value: 10 + Math.random() * 20
    })
  }
}

// Main simulation loop
function simulationStep() {
  if (!isRunning) return
  
  simulationState.step++
  
  // Update agent needs
  updateAgentNeeds()
  
  // Update agent decisions
  updateAgentDecisions()
  
  // Update agent positions
  updateAgentPositions()
  
  // Generate events
  generateEvents()
  
  // Post update to main thread
  self.postMessage({
    type: 'simulationUpdate',
    state: simulationState
  })
}

function updateAgentNeeds() {
  simulationState.agents.forEach(agent => {
    // Natural decay
    agent.needs.hunger = Math.max(0, agent.needs.hunger - 0.1)
    agent.needs.energy = Math.max(0, agent.needs.energy - 0.05)
    agent.needs.social = Math.max(0, agent.needs.social - 0.03)
    agent.needs.safety = Math.max(0, agent.needs.safety - 0.02)
    agent.needs.curiosity = Math.max(0, agent.needs.curiosity - 0.04)
    
    // Terrain effects
    const terrain = simulationState.world.grid[agent.position[1]][agent.position[0]]
    if (terrain === 0) { // Grass
      agent.needs.energy = Math.min(100, agent.needs.energy + 0.1)
    } else if (terrain === 1) { // Forest
      agent.needs.safety = Math.min(100, agent.needs.safety + 0.1)
    }
  })
}

function updateAgentDecisions() {
  simulationState.agents.forEach(agent => {
    // Simple decision making based on needs
    const needs = agent.needs
    
    if (needs.hunger < 20) {
      agent.currentGoal = 'eat'
      agent.currentAction = 'seeking_food'
    } else if (needs.energy < 20) {
      agent.currentGoal = 'rest'
      agent.currentAction = 'seeking_shelter'
    } else if (needs.social < 30) {
      agent.currentGoal = 'socialize'
      agent.currentAction = 'seeking_companion'
    } else if (needs.curiosity > 80) {
      agent.currentGoal = 'explore'
      agent.currentAction = 'wandering'
    } else {
      agent.currentGoal = 'idle'
      agent.currentAction = 'standing'
    }
  })
}

function updateAgentPositions() {
  simulationState.agents.forEach(agent => {
    // Simple movement based on current action
    if (agent.currentAction === 'wandering' || agent.currentAction === 'seeking_food') {
      // Random movement
      if (Math.random() < 0.1) {
        const dx = Math.floor(Math.random() * 3) - 1
        const dy = Math.floor(Math.random() * 3) - 1
        
        const newX = Math.max(0, Math.min(24, agent.position[0] + dx))
        const newY = Math.max(0, Math.min(18, agent.position[1] + dy))
        
        // Check if new position is walkable
        if (simulationState.world.grid[newY][newX] !== 2 && 
            simulationState.world.grid[newY][newX] !== 3) {
          agent.position[0] = newX
          agent.position[1] = newY
        }
      }
    }
  })
}

function generateEvents() {
  // Check for agent interactions
  for (let i = 0; i < simulationState.agents.length; i++) {
    for (let j = i + 1; j < simulationState.agents.length; j++) {
      const agent1 = simulationState.agents[i]
      const agent2 = simulationState.agents[j]
      
      // Check if agents are close
      const dx = agent1.position[0] - agent2.position[0]
      const dy = agent1.position[1] - agent2.position[1]
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 2) {
        // Agents are interacting
        simulationState.events.push({
          type: 'interaction',
          agentId: agent1.id,
          message: `Agent ${agent1.id} meets Agent ${agent2.id}`,
          timestamp: Date.now()
        })
        
        // Increase social needs
        agent1.needs.social = Math.min(100, agent1.needs.social + 5)
        agent2.needs.social = Math.min(100, agent2.needs.social + 5)
      }
    }
    
    // Check for resource consumption
    const agent = simulationState.agents[i]
    simulationState.world.resources.forEach((resource, index) => {
      if (resource.position[0] === agent.position[0] && 
          resource.position[1] === agent.position[1]) {
        
        if (agent.currentAction === 'seeking_food') {
          // Consume resource
          agent.needs.hunger = Math.min(100, agent.needs.hunger + resource.value)
          simulationState.world.resources.splice(index, 1)
          
          simulationState.events.push({
            type: 'consumption',
            agentId: agent.id,
            message: `Agent ${agent.id} consumed food`,
            timestamp: Date.now()
          })
        }
      }
    })
  }
  
  // Keep only recent events
  if (simulationState.events.length > 50) {
    simulationState.events = simulationState.events.slice(-50)
  }
}

// Message handling
self.onmessage = function(e) {
  const message = e.data
  
  switch (message.type) {
    case 'startSimulation':
      if (!isRunning) {
        isRunning = true
        stepInterval = setInterval(simulationStep, 100) // 10 FPS
        self.postMessage({ type: 'simulationStarted' })
      }
      break
      
    case 'stopSimulation':
      if (isRunning) {
        isRunning = false
        clearInterval(stepInterval)
        self.postMessage({ type: 'simulationStopped' })
      }
      break
      
    case 'stepSimulation':
      simulationStep()
      break
      
    case 'getState':
      self.postMessage({
        type: 'stateResponse',
        state: simulationState
      })
      break
      
    case 'initialize':
      initializeSimulation()
      self.postMessage({ type: 'initialized' })
      break
      
    case 'setAgentCount':
      const count = message.count
      if (count > simulationState.agents.length) {
        // Add more agents
        while (simulationState.agents.length < count) {
          spawnInitialAgents()
        }
      } else if (count < simulationState.agents.length) {
        // Remove agents
        simulationState.agents = simulationState.agents.slice(0, count)
      }
      break
  }
}

// Initialize when worker starts
initializeSimulation()
