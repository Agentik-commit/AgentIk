import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  private hudElement!: HTMLElement
  private logElement!: HTMLElement
  private agentCardElement!: HTMLElement
  private worldScene!: Phaser.Scene
  private mapSourceToggle!: HTMLSelectElement

  constructor() {
    super('UI')
  }

  create() {
    // Get DOM elements
    this.hudElement = document.getElementById('hud')!
    this.logElement = document.getElementById('log')!
    this.agentCardElement = document.getElementById('agent-card')!

    // Setup HUD
    this.setupHUD()

    // Setup event log
    this.setupEventLog()

    // Setup agent card
    this.setupAgentCard()

    // Setup button handlers
    this.setupButtonHandlers()

    // Listen for game events
    this.setupGameEventListeners()
  }

  private setupHUD() {
    this.hudElement.innerHTML = `
      <div class="hud-stat">
        <span class="label">Map Source:</span>
        <select id="map-source" class="map-toggle">
          <option value="tiled">Tiled</option>
          <option value="procedural">Procedural</option>
        </select>
      </div>
      <div class="hud-stat">
        <span class="label">Agents:</span>
        <span class="value" id="agent-count">0</span>
      </div>
      <div class="hud-stat">
        <span class="label">Step:</span>
        <span class="value" id="sim-step">0</span>
      </div>
      <div class="hud-stat">
        <span class="label">FPS:</span>
        <span class="value" id="fps">60</span>
      </div>
      <div class="hud-stat">
        <span class="label">Status:</span>
        <span class="value" id="sim-status">Running</span>
      </div>
    `

    // Setup map source toggle
    this.mapSourceToggle = document.getElementById('map-source') as HTMLSelectElement
    this.mapSourceToggle.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value
      this.changeMapSource(value)
    })
  }

  private setupEventLog() {
    this.logElement.innerHTML = `
      <div class="log-header">Event Log</div>
      <div class="log-entries" id="log-entries"></div>
    `

    // Add some initial log entries
    this.addLogEntry('System', 'World initialized')
    this.addLogEntry('System', 'Agents spawned')
    this.addLogEntry('System', 'Simulation started')
  }

  private setupAgentCard() {
    this.agentCardElement.innerHTML = `
      <div class="agent-card-header">Agent Information</div>
      <div class="agent-card-content">
        <div class="agent-info">
          <div class="agent-name">No agent selected</div>
          <div class="agent-type">-</div>
          <div class="agent-position">-</div>
        </div>
        <div class="agent-needs">
          <div class="need-bar">
            <span class="need-label">Energy:</span>
            <div class="need-progress">
              <div class="need-fill energy-fill" style="width: 50%"></div>
            </div>
          </div>
          <div class="need-bar">
            <span class="need-label">Social:</span>
            <div class="need-progress">
              <div class="need-fill social-fill" style="width: 50%"></div>
            </div>
          </div>
          <div class="need-bar">
            <span class="need-label">Hunger:</span>
            <div class="need-progress">
              <div class="need-fill hunger-fill" style="width: 50%"></div>
            </div>
          </div>
        </div>
        <div class="agent-actions">
          <div class="current-goal">Goal: -</div>
          <div class="current-action">Action: -</div>
        </div>
      </div>
    `
  }

  private setupButtonHandlers() {
    // Tool buttons
    const toolButtons = document.querySelectorAll('[data-tool]')
    toolButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tool = (e.target as HTMLElement).getAttribute('data-tool')
        this.selectTool(tool!)
      })
    })

    // Control buttons
    const pauseButton = document.getElementById('pause')
    const stepButton = document.getElementById('step')
    const saveButton = document.getElementById('save-world')
    const loadButton = document.getElementById('load-world')

    if (pauseButton) {
      pauseButton.addEventListener('click', () => {
        this.togglePause()
      })
    }

    if (stepButton) {
      stepButton.addEventListener('click', () => {
        this.stepSimulation()
      })
    }

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveWorld()
      })
    }

    if (loadButton) {
      loadButton.addEventListener('click', () => {
        this.loadWorld()
      })
    }

    // Palette selector
    const paletteSelect = document.getElementById('palette') as HTMLSelectElement
    if (paletteSelect) {
      this.setupPalette(paletteSelect)
    }
  }

  private setupPalette(select: HTMLSelectElement) {
    const tiles = [
      { value: '0', label: 'Grass' },
      { value: '1', label: 'Forest' },
      { value: '2', label: 'Water' },
      { value: '3', label: 'Mountain' },
      { value: '4', label: 'Crystal' }
    ]

    tiles.forEach(tile => {
      const option = document.createElement('option')
      option.value = tile.value
      option.textContent = tile.label
      select.appendChild(option)
    })
  }

  private setupGameEventListeners() {
    // Listen for agent selection events from the world scene
    this.events.on('agentSelected', (entityId: number) => {
      this.updateAgentCard(entityId)
    })

    // Listen for simulation events
    this.events.on('simulationStep', (step: number) => {
      this.updateSimulationStep(step)
    })

    this.events.on('agentCountChanged', (count: number) => {
      this.updateAgentCount(count)
    })
  }

  private changeMapSource(source: string) {
    console.log(`Changing map source to: ${source}`)
    this.addLogEntry('System', `Switching to ${source} map source`)
    
    // Emit event for world scene to handle
    this.events.emit('changeMapSource', source)
  }

  private selectTool(tool: string) {
    // Update active tool
    const toolButtons = document.querySelectorAll('[data-tool]')
    toolButtons.forEach(button => {
      button.classList.remove('active')
      if ((button as HTMLElement).getAttribute('data-tool') === tool) {
        button.classList.add('active')
      }
    })

    // Emit tool change event
    this.events.emit('toolChanged', tool)
  }

  private togglePause() {
    const pauseButton = document.getElementById('pause')
    const statusElement = document.getElementById('sim-status')
    
    if (pauseButton && statusElement) {
      const isPaused = pauseButton.textContent === 'Resume'
      
      if (isPaused) {
        pauseButton.textContent = 'Pause'
        statusElement.textContent = 'Running'
        this.events.emit('resumeSimulation')
      } else {
        pauseButton.textContent = 'Resume'
        statusElement.textContent = 'Paused'
        this.events.emit('pauseSimulation')
      }
    }
  }

  private stepSimulation() {
    this.events.emit('stepSimulation')
    this.addLogEntry('System', 'Simulation stepped manually')
  }

  private saveWorld() {
    this.events.emit('saveWorld')
    this.addLogEntry('System', 'World save requested')
  }

  private loadWorld() {
    this.events.emit('loadWorld')
    this.addLogEntry('System', 'World load requested')
  }

  private updateAgentCard(entityId: number) {
    // This would update the agent card with actual agent data
    // For now, just show a placeholder
    const agentName = document.querySelector('.agent-name')
    if (agentName) {
      agentName.textContent = `Agent ${entityId}`
    }
  }

  private updateSimulationStep(step: number) {
    const stepElement = document.getElementById('sim-step')
    if (stepElement) {
      stepElement.textContent = step.toString()
    }
  }

  private updateAgentCount(count: number) {
    const countElement = document.getElementById('agent-count')
    if (countElement) {
      countElement.textContent = count.toString()
    }
  }

  addLogEntry(category: string, message: string) {
    const logEntries = document.getElementById('log-entries')
    if (logEntries) {
      const entry = document.createElement('div')
      entry.className = 'log-entry'
      entry.innerHTML = `
        <span class="log-time">${new Date().toLocaleTimeString()}</span>
        <span class="log-category">[${category}]</span>
        <span class="log-message">${message}</span>
      `
      
      logEntries.appendChild(entry)
      
      // Keep only last 50 entries
      while (logEntries.children.length > 50) {
        logEntries.removeChild(logEntries.firstChild!)
      }
      
      // Auto-scroll to bottom
      logEntries.scrollTop = logEntries.scrollHeight
    }
  }

  updateFPS(fps: number) {
    const fpsElement = document.getElementById('fps')
    if (fpsElement) {
      fpsElement.textContent = Math.round(fps).toString()
    }
  }
}
