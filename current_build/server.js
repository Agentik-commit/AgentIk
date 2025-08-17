const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});
const PORT = process.env.PORT || 5001;

// Serve static files from agentik/dist (built Phaser app)
app.use('/agentik', express.static(path.join(__dirname, 'agentik/dist')));

// Serve built assets directly (for iframe embedding) 
app.use('/assets', express.static(path.join(__dirname, 'agentik/dist/assets')));

// ALSO serve assets under the agentik path for proper iframe asset resolution
app.use('/agentik/assets', express.static(path.join(__dirname, 'agentik/dist/assets')));

// Serve source assets (maps, tilesets, sprites)
app.use('/src/assets', express.static(path.join(__dirname, 'agentik/src/assets')));
app.use('/agentik/src/assets', express.static(path.join(__dirname, 'agentik/src/assets')));

// TinyTown proxy
const TINYTOWN_URL = process.env.TINYTOWN_URL || 'http://localhost:8788';
app.use('/sim/tinytown', createProxyMiddleware({
  target: TINYTOWN_URL,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/sim/tinytown': '/',
  },
  logLevel: 'silent',
}));

// API routes (create-a-sim)
const simsRouter = require('./server/routes/sims');
const modelsRouter = require('./server/routes/models');
const runsRouter = require('./server/routes/runs');
const mapsRouter = require('./server/routes/maps');
app.use('/api/sims', simsRouter);
app.use('/api/models', modelsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/maps', mapsRouter);

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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600;700&family=Rubik:wght@700;800;900&family=Noto+Sans+Arabic:wght@700;900&display=swap&subset=cyrillic,cyrillic-ext,latin,arabic" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #000000;
            color: #ffffff;
            overflow-x: hidden;
            min-height: 100vh;
            position: relative;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        }
        
        /* Modern Header */
        .ascii-header {
            background: #000000;
            padding: 60px 20px 80px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            min-height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 50px;
            overflow: hidden;
        }
        
        .ascii-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.05), transparent);
            animation: rotate 30s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .ascii-logo {
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            color: #ffffff;
            font-size: 13px;
            line-height: 1.2;
            white-space: pre;
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.35));
            transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: auto;
            text-align: center;
            z-index: 10;
        }

        /* Scale up the second logo to visually match the first */
        #asciiLogo2 {
            font-size: 16px;
            line-height: 1.25;
            letter-spacing: 0.5px;
        }
        
        @keyframes gradientFlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .ascii-logo.fade-out { opacity: 0; transform: translate(-50%, -50%) scale(0.995); }
        .ascii-logo.fade-in  { opacity: 1; transform: translate(-50%, -50%) scale(1.000); }
        
        .subtitle {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.7);
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 3px;
            text-transform: uppercase;
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
            z-index: 10;
            animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }
        }
        
        /* Introduction Section as terminal */
        .intro-section {
            background: #0d0d0d;
            padding: 116px 40px 80px 40px; /* space for titlebar */
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            margin-bottom: 50px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        }

        /* Spacer to prevent simulation bleed into landing section */
        .section-spacer { height: 72px; }
        
        /* Titlebar */
        .intro-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 36px;
            background: linear-gradient(180deg, #121212, #0f0f0f);
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        /* (removed traffic lights per request) */
        
        @keyframes sweep {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .intro-title {
            color: #e5e7eb;
            font-size: 14px;
            font-weight: 600;
            margin: 0 auto 18px auto;
            text-align: center;
            width: fit-content;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            position: relative;
        }
        .intro-title::before { content: '$'; color: #22c55e; margin-right: 8px; }
        
        .intro-text {
            max-width: 900px;
            margin: 0 auto;
            font-size: 13px;
            line-height: 1.8;
            color: #b7f5cf;
            margin-bottom: 40px;
            font-family: 'JetBrains Mono','Fira Code',ui-monospace,monospace;
            text-shadow: 0 0 6px rgba(34, 197, 94, 0.08);
        }
        
        .intro-text p {
            margin-bottom: 20px;
        }
        
        .intro-features {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px;
            max-width: 1080px;
            margin: 0 auto;
        }
        
        .feature-card {
            position: relative;
            background: #0d0d0d;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 46px 20px 22px 20px; /* space for titlebar */
            text-align: left;
            transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
            overflow: hidden;
            box-shadow: 0 18px 42px rgba(0,0,0,0.45), inset 0 0 0 rgba(255,255,255,0);
            font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        /* Terminal titlebar with traffic lights as separate elements */
        .feature-card .term-titlebar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 36px;
            display: flex;
            align-items: center;
            background: linear-gradient(180deg, #121212, #0f0f0f);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding-left: 12px;
            gap: 8px;
        }

        .term-titlebar .light {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex: 0 0 12px;
        }
        .term-titlebar .light.red { background: #ff5f57; }
        .term-titlebar .light.yellow { background: #febc2e; }
        .term-titlebar .light.green { background: #28c840; }

        .feature-card:hover {
            transform: translateY(-6px);
            border-color: rgba(255,255,255,0.14);
            box-shadow: 0 26px 60px rgba(0,0,0,0.55);
        }
        
        .feature-title {
            color: #e5e7eb;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            position: relative;
            z-index: 1;
        }
        .feature-title::before { content: '$'; color: #22c55e; margin-right: 8px; }
        
        .feature-description {
            color: #b7f5cf; /* soft green terminal text */
            font-size: 13px;
            line-height: 1.7;
            position: relative;
            z-index: 1;
            text-shadow: 0 0 6px rgba(34, 197, 94, 0.08);
        }

        /* subtle scanlines */
        .feature-card > * {
            background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
            background-size: 100% 18px;
            background-repeat: repeat;
        }
        
        /* Top Status Bar */
        .status-bar {
            background: #0b0b0b; /* neutral, remove big blue line */
            color: #e5e7eb;
            padding: 12px 20px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        /* Minimal nav row above simulation */
        .top-nav { display:flex; gap:10px; align-items:center; justify-content:center; padding: 0 16px 12px 16px; font-family: 'JetBrains Mono', 'Menlo', monospace; }
        .top-nav a { color:#b7f5cf; text-decoration:none; border:1px solid #334155; padding:8px 12px; border-radius:8px; background:#0b0b0b; text-shadow: 0 0 6px rgba(34, 197, 94, 0.08); }
        .top-nav a::before { content:'$'; color:#22c55e; margin-right:8px }
        .top-nav a:hover { background:#111111; border-color:#22c55e; color:#d1fade }

        /* removed main-nav + multiverse styles */
        
        /* Main Layout */
        .main-container {
            display: flex;
            min-height: 600px;
        }
        
        /* Left Sidebar */
        .left-sidebar {
            width: 300px;
            background: #000;
            border-right: 1px solid rgba(255,255,255,0.08);
            padding: 56px 20px 20px 20px; /* space for titlebar */
            overflow-y: auto;
            position: relative;
            font-family: 'JetBrains Mono','Fira Code',ui-monospace,monospace;
            color: #b7f5cf;
        }
        .left-sidebar::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 36px;
            background: linear-gradient(180deg, #121212, #0f0f0f);
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .world-status {
            background: #0b0b0b;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .world-status h3 {
            color: #22c55e;
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
            background: radial-gradient(1200px 600px at 20% 80%, rgba(255,255,255,0.04), transparent 60%),
                        radial-gradient(1200px 600px at 80% 20%, rgba(255,255,255,0.03), transparent 60%),
                        linear-gradient(180deg, #0b0b0b 0%, #0f0f10 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 0 80px rgba(255,255,255,0.02);
        }

        /* Add terminal titlebar chrome to simulation canvas without changing layout */
        .simulation-canvas::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 28px;
            background: linear-gradient(180deg, #121212, #0f0f0f);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            pointer-events: none;
        }
        /* (removed traffic lights per request) */
        
        .simulation-canvas iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .maximize-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #22c55e;
            color: #051b0d;
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
            padding: 44px 20px 15px 20px; /* space for titlebar */
            background: #0b0b0b;
            border-top: 1px solid rgba(255,255,255,0.08);
            position: relative;
            font-family: 'JetBrains Mono','Fira Code',ui-monospace,monospace;
        }
        .bottom-controls::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 28px;
            background: linear-gradient(180deg, #121212, #0f0f0f);
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        /* (removed traffic lights per request) */
        
        .view-modes {
            display: flex;
            gap: 10px;
        }
        
        .view-mode {
            background: #151515;
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.08);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .view-mode.active {
            background: #22c55e;
            color: #051b0d;
            border-color: #22c55e;
        }
        
        .view-mode:hover {
            background: #1e1e1e;
        }
        
        .view-mode.active:hover {
            background: #16a34a;
        }
        
        .brush-tools {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .brush-tool {
            background: #151515;
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.08);
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .brush-tool:hover {
            background: #1e1e1e;
        }
        
        .brush-tool.active {
            background: #0ea5e9;
            color: #000;
            border-color: #0ea5e9;
        }
        
        .stats-display {
            color: #86efac;
            font-size: 12px;
            display: flex;
            gap: 20px;
        }
        
        /* Right Sidebar */
        .right-sidebar {
            width: 300px;
            background: #000;
            border-left: 1px solid rgba(255,255,255,0.08);
            padding: 56px 20px 20px 20px; /* space for titlebar */
            overflow-y: auto;
            position: relative;
            font-family: 'JetBrains Mono','Fira Code',ui-monospace,monospace;
            color: #b7f5cf;
        }
        .right-sidebar::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 36px;
            background: linear-gradient(180deg, #121212, #0f0f0f);
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .sidebar-section {
            margin-bottom: 25px;
        }
        
        .sidebar-section h3 {
            color: #22c55e;
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
            background: #0b0b0b;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .analytics-section h4 {
            color: #22c55e;
            font-size: 12px;
            margin-bottom: 10px;
        }
        
        .progress-bar {
            background: #1a1a1a;
            height: 4px;
            border-radius: 2px;
            margin: 5px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            background: #22c55e;
            height: 100%;
            width: 0%;
            transition: width 0.3s;
        }
        
        .live-feed {
            background: #0b0b0b;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
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
            color: #22c55e;
            margin-right: 8px;
        }
        
        /* Control Buttons */
        .control-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .control-btn {
            background: #22c55e;
            color: #051b0d;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .control-btn:hover {
            background: #16a34a;
            transform: translateY(-1px);
        }
        
        .control-btn.secondary {
            background: #151515;
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.08);
        }
        
        .control-btn.secondary:hover {
            background: #1e1e1e;
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
            .intro-features { grid-template-columns: 1fr; gap: 16px; }
            .feature-card {
                padding: 20px;
            }
            .main-container {
                flex-direction: column;
                min-height: auto;
            }
            .left-sidebar, .right-sidebar { width: 100%; max-height: unset; }
            .simulation-canvas {
                margin: 10px;
                height: 65vh;
                min-height: 360px;
            }
            .status-bar {
                margin-bottom: 15px;
            }
            .view-mode, .brush-tool { padding: 10px 14px; font-size: 13px; border-radius: 10px; }
            .control-btn { padding: 12px 18px; font-size: 13px; }
            .maximize-btn { padding: 10px 14px; border-radius: 10px; }
        }
        
        @media (max-width: 480px) {
            .simulation-canvas {
                margin: 8px;
                height: 68vh;
                min-height: 320px;
            }
            .bottom-controls { padding: 40px 12px 12px 12px; }
            .view-modes { gap: 8px; }
            .view-mode, .brush-tool { padding: 10px 12px; font-size: 12px; }
            .control-buttons { gap: 8px; }
            .control-btn { padding: 10px 14px; font-size: 12px; border-radius: 8px; }
        }
    </style>
</head>
<body>
    <!-- ASCII Logo Animation -->
    <div class="ascii-header">
        <div class="ascii-logo" id="asciiLogo1">
 
 ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓████████▓▒░▒▓███████▓▒░▒▓████████▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓████████▓▒░▒▓█▓▒▒▓███▓▒░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░▒▓███████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
                                                                                      
                                                                                       
        </div>
        <div class="ascii-logo" id="asciiLogo2" style="display: none;">
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗██╗  ██╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║██║ ██╔╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║█████╔╝ 
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║██╔═██╗ 
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║██║  ██╗
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═╝
        </div>

        <div class="ascii-logo" id="asciiLogo3" style="display: none; font-size: 56px; font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; letter-spacing: 10px;">
エージェントティック
        </div>
        <div class="ascii-logo" id="asciiLogo4" style="display: none; font-size: 62px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; font-weight: 900; letter-spacing: 14px; -webkit-font-smoothing: antialiased; line-height: 1.05;">
АГЕНТИК
        </div>
        <div class="ascii-logo" id="asciiLogo5" style="display: none; font-size: 58px; font-family: 'Noto Sans Arabic', 'Inter', 'Arial', sans-serif; font-weight: 900; letter-spacing: 10px; direction: rtl;">
أجينتيك
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
                <div class="term-titlebar">
                    <span class="light red"></span>
                    <span class="light yellow"></span>
                    <span class="light green"></span>
                </div>
                <div class="feature-title">Multi-Agent Intelligence</div>
                <div class="feature-description">Every creature has a programmable brain made of decision nodes. Watch them think, decide, and adapt in real-time as they navigate complex environments.</div>
            </div>
            
            <div class="feature-card">
                <div class="term-titlebar">
                    <span class="light red"></span>
                    <span class="light yellow"></span>
                    <span class="light green"></span>
                </div>
                <div class="feature-title">Emergent Behavior</div>
                <div class="feature-description">Simple rules create complex behaviors that emerge naturally. See creatures develop strategies, form groups, and solve problems we never programmed.</div>
            </div>
            
            <div class="feature-card">
                <div class="term-titlebar">
                    <span class="light red"></span>
                    <span class="light yellow"></span>
                    <span class="light green"></span>
                </div>
                <div class="feature-title">Evolution Ready</div>
                <div class="feature-description">Built for studying how artificial life adapts and evolves. Researchers use this to understand adaptation, survival, and intelligence emergence.</div>
            </div>
        </div>
    </div>
    <div class="section-spacer"></div>

    <!-- Top Nav (minimal) -->
    <div class="top-nav">
      <a href="/">Home</a>
      <a href="#" onclick="event.preventDefault();">Simulation</a>
      <a href="/create">Create a Sim</a>
      <a href="/multiverse">Multiverse</a>
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

    <!-- removed inline multiverse tab: now served at /multiverse -->

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
                
                // Embed TinyTown inside simulation tab (proxied)
                canvas.innerHTML = '<iframe id="tinytownFrame" src="/sim/tinytown" style="width:100%;height:100%;border:0;border-radius:12px;" allowfullscreen></iframe>';
                
                // Optional: message bridge
                const ttFrame = document.getElementById('tinytownFrame');
                window.addEventListener('message', (event) => {
                    // You can add origin checks here if needed
                    if (!event || !event.data) return;
                    // console.log('From TinyTown:', event.data);
                });
                window.sendToTinyTown = function(type, payload) {
                    if (ttFrame && ttFrame.contentWindow) {
                        ttFrame.contentWindow.postMessage({ type, payload }, '*');
                    }
                };
                
                this.simulationRunning = true;
                this.startTime = Date.now();
                this.updateStats();
                this.addFeedItem('Simulation launched. Agents are now active.');
                
                // Start updating progress bars
                this.startProgressAnimation();
            }

            pauseSimulation() {
                if (this.isPaused) {
                    this.isPaused = false;
                    this.addFeedItem('Simulation resumed');
                    document.getElementById('statusBar').textContent = 'Simulation Running';
                } else {
                    this.isPaused = true;
                    this.addFeedItem('Simulation paused');
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
                        this.agentCount + ' active agents<br><small>Exploring, socializing, evolving</small>';
                }
            }

            addFeedItem(message) {
                const feed = document.getElementById('liveFeed');
                const time = this.formatTime();
                const item = document.createElement('div');
                item.className = 'feed-item';
                item.innerHTML = '<span class="feed-time">' + time + '</span>' + message;
                
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
                return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
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
            const logo3 = document.getElementById('asciiLogo3');
            const logo4 = document.getElementById('asciiLogo4');
            const logo5 = document.getElementById('asciiLogo5');
            // Ensure all logos start hidden with 0 opacity (prevents first-run jump)
            [logo1, logo2, logo3, logo4, logo5].forEach((el, idx) => {
                if (!el) return;
                if ((currentLogo === 1 && idx === 0) || (currentLogo === 2 && idx === 1) || (currentLogo === 3 && idx === 2) || (currentLogo === 4 && idx === 3) || (currentLogo === 5 && idx === 4)) {
                    el.style.display = 'block';
                    el.style.opacity = '1';
                } else {
                    el.style.display = 'none';
                    el.style.opacity = '0';
                }
            });

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
            } else if (currentLogo === 2) {
                logo2.style.opacity = '0';
                setTimeout(() => {
                    logo2.style.display = 'none';
                    logo3.style.display = 'block';
                    setTimeout(() => {
                        logo3.style.opacity = '1';
                    }, 50);
                }, 800);
                currentLogo = 3;
            } else if (currentLogo === 3) {
                logo3.style.opacity = '0';
                setTimeout(() => {
                    logo3.style.display = 'none';
                    logo4.style.display = 'block';
                    setTimeout(() => {
                        logo4.style.opacity = '1';
                    }, 50);
                }, 800);
                currentLogo = 4;
            } else if (currentLogo === 4) {
                logo4.style.opacity = '0';
                setTimeout(() => {
                    logo4.style.display = 'none';
                    logo5.style.display = 'block';
                    setTimeout(() => {
                        logo5.style.opacity = '1';
                    }, 50);
                }, 800);
                currentLogo = 5;
            } else {
                logo4.style.opacity = '0';
                setTimeout(() => {
                    logo5.style.display = 'none';
                    logo1.style.display = 'block';
                    setTimeout(() => {
                        logo1.style.opacity = '1';
                    }, 50);
                }, 800);
                currentLogo = 1;
            }
        }

        // Switch ASCII logos every 4 seconds
        // Kick once to set initial states, then start interval after a short delay to avoid first-jump
        switchAsciiLogo();
        setTimeout(() => setInterval(switchAsciiLogo, 4000), 400);

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
            agentik.addFeedItem('Switched to ' + mode + ' view mode');
        }

        function setBrushTool(tool) {
            // Update active brush tool
            document.querySelectorAll('.brush-tool').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            agentik.currentBrushTool = tool;
            agentik.addFeedItem('Selected ' + tool + ' brush tool');
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

    <script type="module">
      import { listPublicWorlds, loadWorldById } from '/src/services/multiverse.ts';
      import { startReadonlyViewer } from '/src/viewers/readonlyViewer.ts';
      const listEl = document.getElementById('mv-list');
      const viewerEl = document.getElementById('mv-viewer');
      const searchEl = document.getElementById('mv-search');
      let __mv_all = [];
      async function __mv_refresh(){ try{ __mv_all = await listPublicWorlds(); __mv_render(__mv_all); }catch(e){ listEl.innerHTML = '<div style="opacity:.6">No public worlds or API not configured.</div>'; } }
      function __mv_render(items){
        const q=(searchEl?.value||'').trim().toLowerCase();
        const filtered = q? items.filter(w=>((w.display_name||w.name||'')+'').toLowerCase().includes(q)) : items;
        listEl.innerHTML='';
        for (const w of filtered){
          const card=document.createElement('div');
          card.className='mv-card';
          const title = (w.display_name||w.name)||'';
          const owner = (w.owner||'anon');
          const updated = new Date(w.updated_at).toLocaleString();
          card.innerHTML = '<h4 title="' + title.replace(/"/g,'&quot;') + '">' + title + '</h4>' +
                           '<div class="meta">by ' + owner + ' • ' + updated + '</div>' +
                           '<button>Observe</button>';
          card.querySelector('button').addEventListener('click', async ()=>{
            const world = await loadWorldById(w.id);
            startReadonlyViewer(viewerEl, world);
          });
          listEl.appendChild(card);
        }
      }
      window.initMultiverse = function(){ if (!listEl) return; if (!__mv_all.length) __mv_refresh(); searchEl?.addEventListener('input', ()=> __mv_render(__mv_all)); };
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Multiverse page
app.get('/multiverse', (req, res) => {
  const html = `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agentik — Multiverse</title>
    <style>
      :root { --bg:#0b0b0b; --fg:#e5e7eb; --muted:#9ca3af; --pri:#22c55e; }
      *{box-sizing:border-box}
      body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 Inter,system-ui,Segoe UI,Arial,sans-serif}
      .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
      a{color:var(--pri);text-decoration:none}
      .title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
      .card{background:#0f0f10;border:1px solid #1f2937;border-radius:12px;padding:12px}
      .card h4{margin:0 0 6px 0;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .meta{font-size:12px;color:var(--muted)}
      .toolbar{display:flex;gap:8px;margin:12px 0}
      input[type=text]{width:100%;background:#0b0b0b;border:1px solid #334155;border-radius:8px;color:var(--fg);padding:10px}
      .viewer{margin-top:16px}
      .btn{background:#151515;border:1px solid #334155;color:var(--fg);padding:8px 12px;border-radius:8px;cursor:pointer}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="title">
        <h2 style="margin:0">Community Multiverse</h2>
        <a href="/">← Back</a>
      </div>
      <div class="toolbar"><input id="mv-search" type="text" placeholder="Search worlds..." /></div>
      <div id="mv-list" class="grid"></div>
      <div id="mv-viewer" class="viewer"></div>
    </div>
    <script type="module">
      import { listPublicWorlds, loadWorldById } from '/src/services/multiverse.ts';
      import { startReadonlyViewer } from '/src/viewers/readonlyViewer.ts';
      const listEl = document.getElementById('mv-list');
      const searchEl = document.getElementById('mv-search');
      const viewerEl = document.getElementById('mv-viewer');
      let all=[];
      async function refresh(){ try{ all = await listPublicWorlds(); render(all); }catch(e){ listEl.innerHTML = '<div style="opacity:.6">No public worlds yet.</div>'; } }
      function render(items){ const q=(searchEl.value||'').toLowerCase(); const filtered=q?items.filter(w=>((w.display_name||w.name||'')+'').toLowerCase().includes(q)):items; listEl.innerHTML=''; for(const w of filtered){ const el=document.createElement('div'); el.className='card'; const title=(w.display_name||w.name)||''; const owner=(w.owner||'anon'); const updated=new Date(w.updated_at).toLocaleString(); el.innerHTML='<h4 title="'+title.replace(/"/g,'&quot;')+'">'+title+'</h4><div class="meta">by '+owner+' • '+updated+'</div><button class="btn">Observe</button>'; el.querySelector('button').onclick=async()=>{ const world=await loadWorldById(w.id); startReadonlyViewer(viewerEl, world); }; listEl.appendChild(el);} }
      searchEl.oninput=()=>render(all);
      refresh();
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

// Create-a-Sim page (non-destructive additive route)
app.get('/create', (req, res) => {
  const html = `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agentik — Create a Sim</title>
    <style>
      :root { --bg:#0b0b0b; --fg:#e5e7eb; --muted:#9ca3af; --pri:#22c55e; }
      *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 Inter,system-ui,Segoe UI,Arial,sans-serif; color-scheme: dark}
      .wrap{max-width:1100px;margin:32px auto;padding:0 16px}
      .topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
      .subtitle{margin:4px 0 16px 0;color:#9ca3af}
      .topbar a{color:var(--pri);text-decoration:none}
      .card{background:#0f0f10;border:1px solid #1f2937;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
      .grid{display:grid;gap:16px}
      .stepper{display:flex;gap:8px;flex-wrap:wrap;padding:12px;border-bottom:1px solid #1f2937}
      .pill{padding:8px 12px;border-radius:999px;border:1px solid #1f2937;color:var(--muted)}
      .pill.active{background:var(--pri);color:#051b0d;border-color:var(--pri);font-weight:700}
      .pane{display:none;padding:16px}
      .pane.active{display:block}
      .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .row > .col{background:#0b0b0b;border:1px solid #1f2937;border-radius:10px;padding:12px}
      .label{font-weight:600;color:var(--muted);margin:6px 0}
      input[type=text], input[type=number], textarea, select{width:100%;background:#0b0b0b;border:1px solid #334155;border-radius:8px;color:var(--fg);padding:10px}
      input:focus, textarea:focus, select:focus{outline:none;border-color:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,0.18)}
      /* Dark dropdowns and file inputs */
      select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%239ca3af' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:12px;padding-right:30px}
      option{background:#0b0b0b;color:#e5e7eb}
      input[type=file]{background:#0b0b0b;color:#e5e7eb;border:1px solid #334155;border-radius:8px}
      input[type=file]::file-selector-button{background:#151515;border:1px solid #334155;color:#e5e7eb;border-radius:6px;padding:6px 10px;margin-right:8px;cursor:pointer}
      textarea{min-height:96px}
      .actions{display:flex;gap:8px;justify-content:flex-end;padding:12px;border-top:1px solid #1f2937}
      .btn{background:#151515;border:1px solid #334155;color:var(--fg);padding:10px 14px;border-radius:8px;cursor:pointer}
      .btn.sm{padding:6px 10px;font-size:12px;border-radius:6px}
      .btn.pri{background:var(--pri);border-color:var(--pri);color:#051b0d;font-weight:700}
      .preview{height:220px;border-radius:10px;background:repeating-linear-gradient(0deg,#0c0c0c,#0c0c0c 10px,#0b0b0b 10px,#0b0b0b 20px);border:1px solid #1f2937}
      /* Agents builder */
      .agent-controls{display:flex;gap:8px;align-items:center;margin:8px 0}
      .agent-row{display:grid;grid-template-columns:1.1fr 1.4fr 0.9fr 1.2fr auto;gap:8px;align-items:center;margin-bottom:8px}
      .agent-row input, .agent-row select{width:100%;background:#0b0b0b;border:1px solid #334155;border-radius:8px;color:var(--fg);padding:8px}
      .agent-row .del{background:#2a2a2a;border:1px solid #3b3b3b;color:#d1d5db;border-radius:8px;padding:6px 10px;cursor:pointer}
      .agent-row .del:hover{background:#3a3a3a}
      /* Terminal shell styling */
      .term-shell{border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b0b0b;box-shadow:0 24px 60px rgba(0,0,0,.45);overflow:hidden;margin-top:8px}
      .term-titlebar{height:36px;display:flex;align-items:center;gap:8px;padding-left:12px;background:linear-gradient(180deg,#121212,#0f0f0f);border-bottom:1px solid rgba(255,255,255,0.06)}
      .term-titlebar .light{width:12px;height:12px;border-radius:50%}
      .term-titlebar .light.red{background:#ff5f57}
      .term-titlebar .light.yellow{background:#febc2e}
      .term-titlebar .light.green{background:#28c840}
      .term-body{background:#0b0b0b}
      .term-body .card{background:#0f0f10;border:none;border-radius:0;box-shadow:none}
      .subtitle::before{content:'$';color:#22c55e;margin-right:8px}
      @media (max-width: 900px){ .row{grid-template-columns:1fr} }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="topbar">
        <h2 style="margin:0">Create a Sim</h2>
        <a href="/">← Back to Home</a>
      </div>
      <div class="subtitle">Create worlds, spawn autonomous agents, and watch emergent behavior unfold.</div>
      <div class="term-shell">
        <div class="term-titlebar"><span class="light red"></span><span class="light yellow"></span><span class="light green"></span></div>
        <div class="term-body">
          <div class="card">
        <div class="stepper" id="stepper">
          <span class="pill active" data-step="0">World</span>
          <span class="pill" data-step="1">Agents</span>
          <span class="pill" data-step="2">Story</span>
          <span class="pill" data-step="3">Model</span>
          <span class="pill" data-step="4">Map Editor</span>
          <span class="pill" data-step="5">Review</span>
        </div>
        <div class="pane active" id="pane-0">
          <div class="row">
            <div class="col">
              <div class="label">Source</div>
              <select id="world-source">
                <option value="tiled">Tiled JSON</option>
                <option value="procedural">Procedural</option>
              </select>
              <div class="label" style="margin-top:8px">Map JSON URL</div>
              <input type="text" id="world-mapKey" placeholder="/uploads/anon/maps/world.json" />
              <div class="label">Tilesets (comma)</div>
              <input type="text" id="world-tilesets" placeholder="/uploads/anon/tiles/base.png,/uploads/anon/tiles/deco.png" />
              <div class="label">World Size (width × height)</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <input type="number" id="world-width" placeholder="64" value="64" min="8" />
                <input type="number" id="world-height" placeholder="64" value="64" min="8" />
              </div>
              <div class="label">Tile Size (px)</div>
              <input type="number" id="world-tile" placeholder="16" value="16" min="8" />
              <div class="label">Seed (procedural)</div>
              <input type="text" id="world-seed" placeholder="e.g. 42 or my-world" />
              <div class="label">Noise Scale (procedural)</div>
              <input type="number" id="world-noise" step="0.1" placeholder="1.0" value="1.0" />
            </div>
            <div class="col">
              <div class="label">Preview</div>
              <div class="preview" id="preview"></div>
              <div style="color:var(--muted);margin-top:6px;font-size:12px">Adjust parameters on the left; the full map renders in the simulation.</div>
            </div>
          </div>
        </div>
        <div class="pane" id="pane-1">
          <div class="row">
            <div class="col">
              <div class="label">Agents</div>
              <div class="agent-controls">
                <button class="btn sm" id="btn-agent-add">+ Add Agent</button>
                <button class="btn sm" id="btn-agents-example">Seed Example</button>
              </div>
              <div id="agent-list"></div>
              <div class="label" style="margin-top:12px">Agents (JSON)</div>
              <textarea id="agents-json" placeholder='[]'></textarea>
            </div>
            <div class="col">
              <div class="label">Gallery (optional)</div>
              <div style="color:var(--muted)">Upload flow TBD. For now, paste URLs above.</div>
            </div>
          </div>
        </div>
        <div class="pane" id="pane-2">
          <div class="row">
            <div class="col">
              <div class="label">Premise</div>
              <textarea id="story-premise" placeholder="Two factions compete for resources while forming alliances."></textarea>
              <div class="label">Rules</div>
              <textarea id="story-rules" placeholder="No violence. Trade allowed."></textarea>
              <div class="label">Conditions</div>
              <textarea id="story-conditions" placeholder="success: unite both towns; fail: population < 2"></textarea>
              <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="story-chat" /> Enable chat bubbles</label>
            </div>
            <div class="col"></div>
          </div>
        </div>
        <div class="pane" id="pane-3">
          <div class="row">
            <div class="col">
              <div class="label">Provider</div>
              <select id="model-provider">
                <option value="ollama">Ollama (local)</option>
                <option value="custom">Custom HTTP</option>
                <option value="openai">OpenAI (stub)</option>
                <option value="anthropic">Anthropic (stub)</option>
                <option value="groq">Groq (stub)</option>
              </select>
              <div class="label">Model</div>
              <input type="text" id="model-name" placeholder="llama3.1" />
              <div class="label">Base URL (local/custom only)</div>
              <input type="text" id="model-base" placeholder="http://localhost:11434" />
              <div class="label">Test prompt</div>
              <input type="text" id="model-prompt" placeholder="Say hi as the main agent" />
              <button class="btn" id="btn-test">Test Model</button>
              <div id="test-out" style="margin-top:8px;color:var(--muted)"></div>
            </div>
            <div class="col"></div>
          </div>
        </div>
        <div class="pane" id="pane-4">
          <div class="row">
            <div class="col">
              <div class="label">Map Editor</div>
              <div style="color:var(--muted);margin-bottom:8px">Create or edit a Tiled-style map. Save a draft, then publish to get a mapKey.</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
                <button class="btn" id="btn-new-map">New Draft</button>
                <button class="btn" id="btn-load-map">Load Draft</button>
                <button class="btn" id="btn-save-map">Save Draft</button>
                <button class="btn pri" id="btn-publish-map">Publish</button>
              </div>
              <div id="map-editor-status" style="color:var(--muted)"></div>
            </div>
            <div class="col">
              <div class="label">Tileset Upload</div>
              <input type="file" id="tileset-file" accept="image/*" />
              <button class="btn" id="btn-upload-tileset" style="margin-top:8px">Upload</button>
              <div id="tileset-url" style="margin-top:8px;color:var(--muted)"></div>
            </div>
          </div>
        </div>
        <div class="pane" id="pane-5">
          <div class="row">
            <div class="col">
              <div class="label">Template Name</div>
              <input type="text" id="tpl-name" placeholder="My Sandbox Template" />
              <div id="review" style="margin-top:8px;color:var(--muted)"></div>
            </div>
            <div class="col"></div>
          </div>
        </div>
        <div class="actions">
          <button class="btn" id="btn-save-draft">Save Draft</button>
          <button class="btn" id="btn-save">Save as Template</button>
          <button class="btn pri" id="btn-run">Run Simulation</button>
        </div>
          </div>
        </div>
      </div>
    </div>
    <script>
      const steps = Array.from(document.querySelectorAll('.pill'));
      const panes = Array.from(document.querySelectorAll('.pane'));
      steps.forEach(p => p.onclick = () => setStep(Number(p.dataset.step)));
      function setStep(i){ steps.forEach((p,idx)=>p.classList.toggle('active',idx===i)); panes.forEach((el,idx)=>el.classList.toggle('active',idx===i)); updateReview(); }
      function val(id){ const el = document.getElementById(id); return el && (el.type==='checkbox'? el.checked : el.value); }
      function parseJSON(id){ try { return JSON.parse(val(id)||'[]'); } catch { return []; } }
      function snapshot(){
        return {
          name: val('tpl-name')||'Untitled',
          world: { source: val('world-source'), mapKey: val('world-mapKey'), tilesets: (val('world-tilesets')||'').split(',').map(s=>s.trim()).filter(Boolean), width: Number(val('world-width')||0)||0, height: Number(val('world-height')||0)||0, tile: Number(val('world-tile')||0)||0, seed: val('world-seed')||'', noiseScale: Number(val('world-noise')||1)||1 },
          agents: parseJSON('agents-json'),
          story: { premise: val('story-premise')||'', rules: val('story-rules')||'', conditions: val('story-conditions')||'', chat: !!val('story-chat') },
          model: { provider: val('model-provider')||'ollama', model: val('model-name')||'llama3.1', baseUrl: val('model-base')||'' }
        }
      }
      function updateReview(){ const s = snapshot(); document.getElementById('review').textContent = JSON.stringify(s,null,2); }
      document.getElementById('btn-test').onclick = async ()=>{
        const s = snapshot(); const body = { provider: s.model.provider, config: { model: s.model.model, baseUrl: s.model.baseUrl }, prompt: document.getElementById('model-prompt').value||'Say hi' };
        const t0 = performance.now();
        const r = await fetch('/api/models/test',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
        const j = await r.json();
        document.getElementById('test-out').textContent = j.ok? ('OK ' + j.latencyMs + 'ms: ' + (j.outputPreview||'')) : ('ERR: ' + (j.error||''));
      };
      document.getElementById('btn-save').onclick = async ()=>{
        const s = snapshot(); const r = await fetch('/api/sims/templates',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(s)});
        const j = await r.json(); alert(j.ok? ('Saved: '+ j.template.id) : ('ERR: '+ j.error));
      };
      document.getElementById('btn-run').onclick = async ()=>{
        const s = snapshot(); const r = await fetch('/api/runs/start',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ snapshot: s }) });
        const j = await r.json(); if (j.ok) location.href = '/?templateId=' + j.run.id + '&mode=client'; else alert('ERR: ' + j.error);
      };

      // Seed example agents
      const btnEx = document.getElementById('btn-agents-example');
      const agentList = document.getElementById('agent-list');
      function renderAgentsEditor(list){
        agentList.innerHTML = '';
        const agents = Array.isArray(list)? list : [];
        agents.forEach((a, idx) => {
          const row = document.createElement('div');
          row.className = 'agent-row';
          row.innerHTML = 
            '<input placeholder="Name" value="' + String(a.name||'').replace(/"/g,'&quot;') + '" />' +
            '<input placeholder="Sprite URL" value="' + String(a.spriteUrl||'').replace(/"/g,'&quot;') + '" />' +
            '<select>' +
              '<option value="curious">curious</option>'+
              '<option value="brave">brave</option>'+
              '<option value="timid">timid</option>'+
              '<option value="friendly">friendly</option>'+
            '</select>'+
            '<input placeholder="Memory" value="' + String(a.memory||'').replace(/"/g,'&quot;') + '" />' +
            '<button class="del">Remove</button>';
          const [nameEl, spriteEl, personaEl, memEl, delBtn] = row.children;
          personaEl.value = a.persona || 'curious';
          function push(){
            const current = collectAgentsFromUI();
            document.getElementById('agents-json').value = JSON.stringify(current, null, 2);
          }
          nameEl.oninput = push; spriteEl.oninput = push; personaEl.onchange = push; memEl.oninput = push;
          delBtn.onclick = () => { agents.splice(idx,1); renderAgentsEditor(agents); document.getElementById('agents-json').value = JSON.stringify(agents, null, 2); };
          agentList.appendChild(row);
        });
      }
      function collectAgentsFromUI(){
        const rows = Array.from(agentList.querySelectorAll('.agent-row'));
        return rows.map(r => {
          const [nameEl, spriteEl, personaEl, memEl] = r.children;
          return { name: nameEl.value.trim(), spriteUrl: spriteEl.value.trim(), persona: personaEl.value, memory: memEl.value.trim() };
        });
      }
      document.getElementById('btn-agent-add')?.addEventListener('click', () => {
        const list = collectAgentsFromUI();
        list.push({ name: 'Agent '+(list.length+1), spriteUrl: '', persona: 'curious', memory: '' });
        renderAgentsEditor(list);
        document.getElementById('agents-json').value = JSON.stringify(list, null, 2);
      });
      if (btnEx){ btnEx.onclick = () => {
        const out = [];
        for (let i=0;i<6;i++) out.push({ name: 'Agent '+(i+1), spriteUrl: '/uploads/anon/sprites/a'+((i%4)+1)+'.png', persona: (i%2?'brave':'curious'), memory: '' });
        renderAgentsEditor(out);
        document.getElementById('agents-json').value = JSON.stringify(out, null, 2);
      }}
      // Initialize from JSON if present
      try{ const parsed = JSON.parse(document.getElementById('agents-json').value||'[]'); renderAgentsEditor(parsed);}catch{ renderAgentsEditor([]); }

      // Map Editor draft state (very lightweight placeholder editor)
      let currentDraftId = null;
      let currentMap = { width: 32, height: 32, tilewidth: 16, tileheight: 16, layers: [] };
      function updateMapStatus(msg){ document.getElementById('map-editor-status').textContent = msg; }
      document.getElementById('btn-new-map').onclick = () => { currentDraftId=null; currentMap={ width:32, height:32, tilewidth:16, tileheight:16, layers:[] }; updateMapStatus('New draft created.'); };
      document.getElementById('btn-save-map').onclick = async () => {
        const name = val('tpl-name') || 'Untitled Map';
        const r = await fetch('/api/maps/save',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id: currentDraftId, name, mapJson: currentMap }) });
        const j = await r.json(); if (j.ok){ currentDraftId=j.id; updateMapStatus('Draft saved: ' + j.id + ' at ' + j.updated_at); } else { updateMapStatus('ERR: ' + j.error); }
      };
      document.getElementById('btn-load-map').onclick = async () => {
        const id = prompt('Enter draft id'); if (!id) return; const r = await fetch('/api/maps/' + encodeURIComponent(id)); const j = await r.json(); if (j.ok){ currentDraftId=j.draft.id; currentMap=j.draft.mapJson; updateMapStatus('Loaded draft: ' + j.draft.id); } else { updateMapStatus('ERR: ' + j.error); }
      };
      document.getElementById('btn-publish-map').onclick = async () => {
        if (!currentDraftId){ updateMapStatus('Save a draft first.'); return; }
        const r = await fetch('/api/maps/publish',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id: currentDraftId }) });
        const j = await r.json(); if (j.ok){ document.getElementById('world-mapKey').value='/' + j.mapKey; updateMapStatus('Published. mapKey=/' + j.mapKey); } else { updateMapStatus('ERR: ' + j.error); }
      };
      document.getElementById('btn-upload-tileset').onclick = async () => {
        const f = document.getElementById('tileset-file').files[0]; if (!f){ alert('Pick a file'); return; }
        const fd = new FormData(); fd.append('file', f);
        const r = await fetch('/api/maps/upload-tileset', { method:'POST', body: fd });
        const j = await r.json(); if (j.ok){ document.getElementById('tileset-url').textContent = j.url; } else { alert('Upload error: ' + j.error); }
      };
    </script>
  </body>
  </html>`;
  res.send(html);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('Agentik server running on http://localhost:' + PORT);
  console.log('Network access on http://0.0.0.0:' + PORT);
  console.log('Main site: http://localhost:' + PORT);
  console.log('Simulation: http://localhost:' + PORT + '/agentik');
});
