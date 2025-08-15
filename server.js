const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Serve static files from agentik/dist (built Phaser app)
app.use('/agentik', express.static(path.join(__dirname, 'agentik/dist')));

// Serve built assets directly (for iframe embedding)
app.use('/assets', express.static(path.join(__dirname, 'agentik/dist/assets')));

// Serve source assets (maps, tilesets, sprites)
app.use('/src/assets', express.static(path.join(__dirname, 'agentik/src/assets')));

// API endpoints (keeping original functionality)
app.get('/api/available_tests', (req, res) => {
  res.json(['basic_movement', 'social_interaction', 'resource_gathering', 'evolution_test']);
});

app.get('/api/available_fortresses', (req, res) => {
  res.json(['peaceful_village', 'harsh_wilderness', 'resource_competition']);
});

// Main homepage with original sophisticated layout
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentik - Artificial Life Simulation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            background: #000;
            color: #ffffff;
            overflow-x: hidden;
            min-height: 100vh;
        }
        
        /* ASCII Header */
        .ascii-header {
            background: #000;
            padding: 40px 20px 60px 20px;
            text-align: center;
            border-bottom: 3px solid #00ff00;
            position: relative;
            min-height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 40px;
        }
        
        .ascii-logo {
            font-family: 'Courier New', monospace;
            color: #00ff00;
            font-size: 12px;
            line-height: 1.2;
            white-space: pre;
            text-shadow: 
                0 0 5px rgba(0, 255, 0, 0.8),
                0 0 10px rgba(0, 255, 0, 0.6),
                0 0 15px rgba(0, 255, 0, 0.4);
            transition: opacity 0.8s ease-in-out;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: auto;
            text-align: center;
        }
        
        .ascii-logo.fade-out {
            opacity: 0;
        }
        
        .ascii-logo.fade-in {
            opacity: 1;
        }
        
        .subtitle {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
            text-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
            opacity: 0.8;
        }
        
        /* Introduction Section */
        .intro-section {
            background: #111;
            padding: 60px 40px;
            text-align: center;
            border-bottom: 2px solid #333;
            margin-bottom: 40px;
        }
        
        .intro-title {
            color: #00ff00;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
            letter-spacing: 1px;
        }
        
        .intro-text {
            max-width: 900px;
            margin: 0 auto;
            font-size: 16px;
            line-height: 1.8;
            color: #ccc;
            margin-bottom: 40px;
        }
        
        .intro-text p {
            margin-bottom: 20px;
        }
        
        .intro-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .feature-card {
            background: #000;
            border: 1px solid #00ff00;
            border-radius: 8px;
            padding: 25px;
            text-align: left;
        }
        
        .feature-title {
            color: #00ff00;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .feature-description {
            color: #bbb;
            font-size: 14px;
            line-height: 1.6;
        }
        
        /* Top Status Bar */
        .status-bar {
            background: #00ff00;
            color: #000;
            padding: 12px 20px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        /* Main Layout */
        .main-container {
            display: flex;
            min-height: 600px;
        }
        
        /* Left Sidebar */
        .left-sidebar {
            width: 300px;
            background: #000;
            border-right: 2px solid #00ff00;
            padding: 20px;
            overflow-y: auto;
        }
        
        .world-status {
            background: #111;
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .world-status h3 {
            color: #00ff00;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .status-text {
            color: #fff;
            font-size: 12px;
            line-height: 1.4;
        }
        
        /* Center Area */
        .center-area {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        /* Simulation Canvas */
        .simulation-canvas {
            flex: 1;
            position: relative;
            margin: 20px;
            background: 
                radial-gradient(circle at 20% 80%, #1e3a8a 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, #059669 0%, transparent 50%),
                linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%);
            border: 4px solid #00ff00;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 
                0 0 30px rgba(0, 255, 0, 0.4),
                inset 0 0 50px rgba(0, 0, 0, 0.3);
        }
        
        .simulation-canvas iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .maximize-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #00ff00;
            color: #000;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
            z-index: 10;
        }
        
        /* Bottom Controls */
        .bottom-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: #111;
            border-top: 2px solid #00ff00;
        }
        
        .view-modes {
            display: flex;
            gap: 10px;
        }
        
        .view-mode {
            background: #333;
            color: #fff;
            border: 1px solid #555;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .view-mode.active {
            background: #00ff00;
            color: #000;
            border-color: #00ff00;
        }
        
        .view-mode:hover {
            background: #555;
        }
        
        .view-mode.active:hover {
            background: #00cc00;
        }
        
        .brush-tools {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .brush-tool {
            background: #333;
            color: #fff;
            border: 1px solid #555;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .brush-tool:hover {
            background: #555;
        }
        
        .brush-tool.active {
            background: #00ff00;
            color: #000;
            border-color: #00ff00;
        }
        
        .stats-display {
            color: #00ff00;
            font-size: 12px;
            display: flex;
            gap: 20px;
        }
        
        /* Right Sidebar */
        .right-sidebar {
            width: 300px;
            background: #000;
            border-left: 2px solid #00ff00;
            padding: 20px;
            overflow-y: auto;
        }
        
        .sidebar-section {
            margin-bottom: 25px;
        }
        
        .sidebar-section h3 {
            color: #00ff00;
            margin-bottom: 12px;
            font-size: 14px;
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-label {
            color: #888;
            font-size: 10px;
            margin-bottom: 2px;
        }
        
        .stat-value {
            color: #00ff00;
            font-size: 14px;
            font-weight: bold;
        }
        
        .no-entities {
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        
        .analytics-section {
            background: #111;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .analytics-section h4 {
            color: #00ff00;
            font-size: 12px;
            margin-bottom: 10px;
        }
        
        .progress-bar {
            background: #333;
            height: 4px;
            border-radius: 2px;
            margin: 5px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            background: #00ff00;
            height: 100%;
            width: 0%;
            transition: width 0.3s;
        }
        
        .live-feed {
            background: #111;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 10px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .feed-item {
            color: #ccc;
            font-size: 11px;
            margin-bottom: 5px;
            padding: 3px 0;
            border-bottom: 1px solid #222;
        }
        
        .feed-time {
            color: #00ff00;
            margin-right: 8px;
        }
        
        /* Control Buttons */
        .control-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .control-btn {
            background: #00ff00;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .control-btn:hover {
            background: #00cc00;
            transform: translateY(-1px);
        }
        
        .control-btn.secondary {
            background: #333;
            color: #fff;
        }
        
        .control-btn.secondary:hover {
            background: #555;
        }
        
        /* Fullscreen */
        .simulation-canvas.fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            margin: 0;
            border-radius: 0;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
            .main-container {
                flex-direction: column;
                height: auto;
            }
            .left-sidebar, .right-sidebar {
                width: 100%;
                max-height: 300px;
            }
            .ascii-logo {
                font-size: 8px;
            }
        }
        
        @media (max-width: 768px) {
            .ascii-header {
                min-height: 180px;
                padding: 25px 10px 40px 10px;
                margin-bottom: 30px;
            }
            .ascii-logo {
                font-size: 6px;
                line-height: 1.1;
            }
            .intro-section {
                padding: 40px 20px;
            }
            .intro-title {
                font-size: 22px;
            }
            .intro-text {
                font-size: 14px;
            }
            .intro-features {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .feature-card {
                padding: 20px;
            }
            .main-container {
                flex-direction: column;
                min-height: auto;
            }
            .left-sidebar, .right-sidebar {
                width: 100%;
            }
            .simulation-canvas {
                margin: 10px;
                height: 400px;
            }
            .status-bar {
                margin-bottom: 15px;
            }
        }
    </style>
</head>
<body>
    <!-- ASCII Logo Animation -->
    <div class="ascii-header">
        <div class="ascii-logo" id="asciiLogo1">
 .----------------.  .----------------.  .----------------.  .-----------------. .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |      __      | || |    ______    | || |  _________   | || | ____  _____  | || |  _________   | || |     _____    | || |  ___  ____   | |
| |     /  \\     | || |  .' ___  |   | || | |_   ___  |  | || ||_   \\|_   _| | || | |  _   _  |  | || |    |_   _|   | || | |_  ||_  _|  | |
| |    / /\\ \\    | || | / .'   \\_|   | || |   | |_  \\_|  | || |  |   \\ | |   | || | |_/ | | \\_|  | || |      | |     | || |   | |_/ /    | |
| |   / ____ \\   | || | | |    ____  | || |   |  _|  _   | || |  | |\\ \\| |   | || |     | |      | || |      | |     | || |   |  __'.    | |
| | _/ /    \\ \\_ | || | \\ \`.___\\]  _| | || |  _| |___/ |  | || | _| |_\\   |_  | || |    _| |_     | || |     _| |_    | || |  _| |  \\ \\_  | |
| ||____|  |____|| || |  \`._____.'   | || | |_________|  | || ||_____|\\____| | || |   |_____|    | || |    |_____|   | || | |____||____| | |
| |              | || |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
        </div>
        <div class="ascii-logo" id="asciiLogo2" style="display: none;">
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗██╗  ██╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██║ ██╔╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║█████╔╝ 
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██╔═██╗ 
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║██║  ██╗
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═╝
        </div>
        <div class="subtitle">
            ARTIFICIAL LIFE SIMULATION • AUTONOMOUS AGENTS • EMERGENT BEHAVIOR
        </div>
    </div>
    
    <!-- Introduction Section -->
    <div class="intro-section">
        <h1 class="intro-title">Welcome to the Future of Artificial Life</h1>
        <div class="intro-text">
            <p>
                <strong>Agentik</strong> isn't just another simulation — it's a living, breathing digital ecosystem where autonomous agents think, act, and evolve in real time. Watch as simple rules give rise to complex, unpredictable behaviors that even we can't predict.
            </p>
            <p>
                Each agent is powered by a sophisticated AI brain, making decisions based on their needs, goals, and environment. They form relationships, compete for resources, and create emergent behaviors that surprise even their creators.
            </p>
        </div>
        
        <div class="intro-features">
            <div class="feature-card">
                <div class="feature-title">
                    Multi-Agent Intelligence
                </div>
                <div class="feature-description">
                    Every creature has a programmable brain made of decision nodes. Watch them think, decide, and adapt in real-time as they navigate complex environments.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    Emergent Behavior
                </div>
                <div class="feature-description">
                    Simple rules create complex behaviors that emerge naturally. See creatures develop strategies, form groups, and solve problems we never programmed.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    Evolution Ready
                </div>
                <div class="feature-description">
                    Built for studying how artificial life adapts and evolves. Researchers use this to understand adaptation, survival, and intelligence emergence.
                </div>
            </div>
        </div>
    </div>
    
    <!-- Top Status Bar -->
    <div class="status-bar" id="statusBar">
        Simulation Ready
    </div>
    
    <!-- Main Container -->
    <div class="main-container">
        <!-- Left Sidebar -->
        <div class="left-sidebar">
            <div class="control-buttons">
                <button class="control-btn" onclick="startSimulation()">Launch Simulation</button>
                <button class="control-btn secondary" onclick="pauseSimulation()">Pause</button>
            </div>
            
            <div class="world-status">
                <h3>🌍 World Status</h3>
                <div class="status-text" id="worldStatus">
                    <div class="feed-time">00:00</div>
                    World initialized! Agents are waking up...
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3>Living World</h3>
                <div class="stats-display">
                    <div>Time: <span id="timeDisplay">0</span></div>
                    <div>Life: <span id="lifeDisplay">0</span></div>
                    <div>Size: <span id="sizeDisplay">0x0</span></div>
                    <div>Activity: <span id="activityDisplay">0%</span></div>
                </div>
            </div>
        </div>
        
        <!-- Center Area -->
        <div class="center-area">
            <!-- Simulation Canvas -->
            <div class="simulation-canvas" id="simulationCanvas">
                <button class="maximize-btn" onclick="toggleFullscreen()">⛶ Maximize</button>
                <!-- Phaser game will load here -->
            </div>
            
            <!-- Bottom Controls -->
            <div class="bottom-controls">
                <div class="view-modes">
                    <button class="view-mode active" onclick="setViewMode('normal')">Normal</button>
                    <button class="view-mode" onclick="setViewMode('heatmap')">Heatmap</button>
                    <button class="view-mode" onclick="setViewMode('paths')">Paths</button>
                    <button class="view-mode" onclick="setViewMode('states')">States</button>
                </div>
                
                <div class="brush-tools">
                    <button class="brush-tool" onclick="setBrushTool('empty')">⬜ Empty</button>
                    <button class="brush-tool" onclick="setBrushTool('wall')">⬛ Wall</button>
                    <button class="brush-tool" onclick="setBrushTool('creature')">🟢 Creature</button>
                    <button class="brush-tool" onclick="setBrushTool('item')">⭐ Item</button>
                </div>
            </div>
        </div>
        
        <!-- Right Sidebar -->
        <div class="right-sidebar">
            <div class="sidebar-section">
                <h3>Active Entities</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-label">Time</div>
                        <div class="stat-value" id="timeValue">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Life</div>
                        <div class="stat-value" id="lifeValue">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Size</div>
                        <div class="stat-value" id="sizeValue">0x0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Activity</div>
                        <div class="stat-value" id="activityValue">0%</div>
                    </div>
                </div>
                
                <div class="no-entities" id="entitiesDisplay">
                    No creatures yet<br>
                    <small>No creatures yet</small>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3>Live Analytics</h3>
                
                <div class="analytics-section">
                    <h4>Movement</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" id="movementProgress"></div>
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h4>Interactions</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" id="interactionProgress"></div>
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h4>State Changes</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" id="stateProgress"></div>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3>Live Feed</h3>
                <div class="live-feed" id="liveFeed">
                    <div class="feed-item">
                        <span class="feed-time">00:00</span>
                        World initialized and ready for life!
                    </div>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3>Agent Conversations</h3>
                <div class="no-entities">
                    No conversations yet<br>
                    <small>Agents will chat when they get close to each other!</small>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3>Social Events</h3>
                <div class="no-entities">
                    No events yet<br>
                    <small>Watch for group formations and interactions!</small>
                </div>
            </div>
        </div>
    </div>

    <script>
        class Agentik {
            constructor() {
                this.simulationRunning = false;
                this.isPaused = false;
                this.agentCount = 15;
                this.startTime = null;
                this.currentViewMode = 'normal';
                this.currentBrushTool = 'empty';
            }

            async startSimulation() {
                const canvas = document.getElementById('simulationCanvas');
                const statusBar = document.getElementById('statusBar');
                
                // Update status bar
                statusBar.textContent = 'Simulation Running';
                statusBar.style.background = '#00ff00';
                
                // Embed the Agentik Phaser app
                canvas.innerHTML = '<iframe src="/agentik/?embed=1&mode=procedural" style="width:100%;height:100%;border:0"></iframe>';
                
                this.simulationRunning = true;
                this.startTime = Date.now();
                this.updateStats();
                this.addFeedItem('🚀 Simulation launched! Agents are now active.');
                
                // Start updating progress bars
                this.startProgressAnimation();
            }

            pauseSimulation() {
                if (this.isPaused) {
                    this.isPaused = false;
                    this.addFeedItem('▶️ Simulation resumed');
                    document.getElementById('statusBar').textContent = 'Simulation Running';
                } else {
                    this.isPaused = true;
                    this.addFeedItem('⏸️ Simulation paused');
                    document.getElementById('statusBar').textContent = 'Simulation Paused';
                }
            }

            updateStats() {
                if (this.startTime) {
                    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                    document.getElementById('timeDisplay').textContent = elapsed;
                    document.getElementById('timeValue').textContent = elapsed;
                }
                
                document.getElementById('lifeDisplay').textContent = this.agentCount;
                document.getElementById('lifeValue').textContent = this.agentCount;
                document.getElementById('sizeDisplay').textContent = '800x600';
                document.getElementById('sizeValue').textContent = '800x600';
                document.getElementById('activityDisplay').textContent = this.simulationRunning ? '85%' : '0%';
                document.getElementById('activityValue').textContent = this.simulationRunning ? '85%' : '0%';
                
                // Update entities display
                if (this.simulationRunning) {
                    document.getElementById('entitiesDisplay').innerHTML = 
                        \`\${this.agentCount} active agents<br><small>Exploring, socializing, evolving</small>\`;
                }
            }

            addFeedItem(message) {
                const feed = document.getElementById('liveFeed');
                const time = this.formatTime();
                const item = document.createElement('div');
                item.className = 'feed-item';
                item.innerHTML = \`<span class="feed-time">\${time}</span>\${message}\`;
                
                feed.insertBefore(item, feed.firstChild);
                
                // Keep only last 10 items
                while (feed.children.length > 10) {
                    feed.removeChild(feed.lastChild);
                }
            }

            formatTime() {
                if (!this.startTime) return '00:00';
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                return \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            }

            startProgressAnimation() {
                if (!this.simulationRunning) return;
                
                // Animate progress bars with random activity
                const movement = Math.random() * 80 + 20;
                const interaction = Math.random() * 60 + 10;
                const state = Math.random() * 90 + 10;
                
                document.getElementById('movementProgress').style.width = movement + '%';
                document.getElementById('interactionProgress').style.width = interaction + '%';
                document.getElementById('stateProgress').style.width = state + '%';
                
                setTimeout(() => this.startProgressAnimation(), 2000);
            }
        }

        const agentik = new Agentik();

        // ASCII Logo Animation
        let currentLogo = 1;
        function switchAsciiLogo() {
            const logo1 = document.getElementById('asciiLogo1');
            const logo2 = document.getElementById('asciiLogo2');
            
            if (currentLogo === 1) {
                logo1.style.opacity = '0';
                setTimeout(() => {
                    logo1.style.display = 'none';
                    logo2.style.display = 'block';
                    setTimeout(() => {
                        logo2.style.opacity = '1';
                    }, 50);
                }, 800);
                currentLogo = 2;
            } else {
                logo2.style.opacity = '0';
                setTimeout(() => {
                    logo2.style.display = 'none';
                    logo1.style.display = 'block';
                    setTimeout(() => {
                        logo1.style.opacity = '1';
                    }, 50);
                }, 800);
                currentLogo = 1;
            }
        }

        // Switch ASCII logos every 4 seconds
        setInterval(switchAsciiLogo, 4000);

        // Update stats every second
        setInterval(() => {
            if (agentik.simulationRunning) {
                agentik.updateStats();
            }
        }, 1000);

        // Main functions
        function startSimulation() {
            agentik.startSimulation();
        }

        function pauseSimulation() {
            agentik.pauseSimulation();
        }

        function setViewMode(mode) {
            // Update active view mode
            document.querySelectorAll('.view-mode').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            agentik.currentViewMode = mode;
            agentik.addFeedItem(\`📊 Switched to \${mode} view mode\`);
        }

        function setBrushTool(tool) {
            // Update active brush tool
            document.querySelectorAll('.brush-tool').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            agentik.currentBrushTool = tool;
            agentik.addFeedItem(\`🖌️ Selected \${tool} brush tool\`);
        }

        function toggleFullscreen() {
            const container = document.getElementById('simulationCanvas');
            const iframe = container.querySelector('iframe');
            
            if (!document.fullscreenElement) {
                container.classList.add('fullscreen');
                
                if (container.requestFullscreen) {
                    container.requestFullscreen().catch(() => {
                        console.log('Fullscreen API not available, using CSS fallback');
                    });
                }
                
                if (iframe) {
                    iframe.style.width = '100vw';
                    iframe.style.height = '100vh';
                    iframe.contentWindow?.postMessage({
                        type: 'resize', 
                        width: window.innerWidth, 
                        height: window.innerHeight
                    }, '*');
                }
            } else {
                container.classList.remove('fullscreen');
                
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                
                if (iframe) {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.contentWindow?.postMessage({
                        type: 'resize', 
                        width: 800, 
                        height: 600
                    }, '*');
                }
            }
        }

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                const container = document.getElementById('simulationCanvas');
                const iframe = container.querySelector('iframe');
                container.classList.remove('fullscreen');
                
                if (iframe) {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.contentWindow?.postMessage({
                        type: 'resize', 
                        width: 800, 
                        height: 600
                    }, '*');
                }
            }
        });
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Catch-all for agentik routes (client-side routing)
app.get('/agentik/*', (req, res) => {
  const agentikIndexPath = path.join(__dirname, 'agentik/dist/index.html');
  if (fs.existsSync(agentikIndexPath)) {
    res.sendFile(agentikIndexPath);
  } else {
    res.status(404).json({ error: 'Agentik build not found. Run npm run build first.' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Agentik server running on http://localhost:${PORT}`);
  console.log(`📱 Network access on http://0.0.0.0:${PORT}`);
  console.log(`🎮 Main site: http://localhost:${PORT}`);
  console.log(`🎯 Simulation: http://localhost:${PORT}/agentik`);
});
