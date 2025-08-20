import random
from flask import Flask, jsonify, request, render_template, send_from_directory
import os

app = Flask(__name__)

# Global simulation state
simulation_state = None
simulation_running = False

@app.route('/')
def index():
    return render_template('index.html')

# Serve Agentik static frontend (Phaser build) if present
# Build with: (from /agentik) `npm run build` so files appear in ../agentik/dist
AGENTIK_DIST = os.path.join(os.path.dirname(__file__), 'agentik', 'dist')
AGENTIK_SRC_ASSETS = os.path.join(os.path.dirname(__file__), 'agentik', 'src', 'assets')

@app.route('/agentik/')
@app.route('/agentik/<path:path>')
def serve_agentik(path: str = 'index.html'):
    if os.path.isdir(AGENTIK_DIST) and os.path.exists(AGENTIK_DIST):
        # Default file
        if not path or path == '/':
            path = 'index.html'
        # Fallback to index for client routing
        full_path = os.path.join(AGENTIK_DIST, path)
        if not os.path.isfile(full_path):
            path = 'index.html'
        return send_from_directory(AGENTIK_DIST, path)
    return jsonify({'error': 'Agentik build not found. Run npm run build inside /agentik.'}), 404

@app.route('/assets/<path:path>')
def serve_agentik_assets(path: str):
    """Serve built Agentik assets at absolute /assets/* as emitted by Vite build."""
    assets_dir = os.path.join(AGENTIK_DIST, 'assets')
    if os.path.isdir(assets_dir):
        return send_from_directory(assets_dir, path)
    return jsonify({'error': 'Assets not found. Build Agentik first.'}), 404

@app.route('/assets/<path:path>')
def serve_agentik_built_assets(path: str):
    """Serve built assets from the dist/assets directory for the embedded Phaser app."""
    assets_dir = os.path.join(AGENTIK_DIST, 'assets')
    if os.path.isdir(assets_dir):
        return send_from_directory(assets_dir, path)
    return jsonify({'error': 'Built assets not found. Run npm run build.'}), 404

@app.route('/src/assets/<path:path>')
def serve_agentik_src_assets(path: str):
    """Serve Phaser loaders that reference /src/assets/* at runtime.
    This maps to the source assets used by the game (tilemaps, tilesets, sprites).
    """
    if os.path.isdir(AGENTIK_SRC_ASSETS):
        return send_from_directory(AGENTIK_SRC_ASSETS, path)
    return jsonify({'error': 'Source assets directory not found.'}), 404

@app.route('/agentik/src/assets/<path:path>')
def serve_agentik_src_assets_under_agentik(path: str):
    """Serve the same source assets under /agentik/src/assets/* for relative loader paths."""
    if os.path.isdir(AGENTIK_SRC_ASSETS):
        return send_from_directory(AGENTIK_SRC_ASSETS, path)
    return jsonify({'error': 'Source assets directory not found.'}), 404

@app.route('/api/start_simulation', methods=['POST'])
def start_simulation():
    """Start the simulation"""
    global simulation_state, simulation_running
    
    try:
        data = request.get_json()
        test_env = data.get('test_env')
        fortress_file = data.get('fortress_file')
        
        if test_env:
            simulation_state = create_test_environment(test_env)
        elif fortress_file:
            simulation_state = import_fortress_file(fortress_file)
        else:
            simulation_state = create_simple_simulation()
        
        simulation_running = True
        
        return jsonify({
            'status': 'success',
            'message': 'Simulation started successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stop_simulation', methods=['POST'])
def stop_simulation():
    """Stop the simulation"""
    global simulation_running
    simulation_running = False
    
    return jsonify({
        'status': 'success',
        'message': 'Simulation stopped'
    })

@app.route('/api/simulation_state')
def get_simulation_state():
    """Get current simulation state"""
    global simulation_state
    
    if simulation_state is None:
        simulation_state = create_simple_simulation()
    
    return jsonify(simulation_state)

@app.route('/api/step_simulation', methods=['POST'])
def step_simulation():
    """Step the simulation forward with intelligent agent behavior"""
    global simulation_state
    
    try:
        if simulation_state is None:
            simulation_state = create_simple_simulation()
        
        # Step the simulation with intelligent logic
        simulation_state = step_intelligent_simulation(simulation_state)
        
        return jsonify({
            'status': 'success',
            'fortress_state': simulation_state
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_simple_simulation():
    """Create a simple simulation state for demonstration"""
    return {
        'width': 25,
        'height': 19,
        'entities': [
            {'type': 'D', 'pos': [5, 5], 'state': 'exploring', 'energy': 85, 'social': 70, 'target': None, 'conversations': [], 'mood': 'curious', 'personality': 'extroverted'},
            {'type': 'A', 'pos': [8, 7], 'state': 'feeding', 'energy': 92, 'social': 45, 'target': None, 'conversations': [], 'mood': 'content', 'personality': 'peaceful'},
            {'type': 'G', 'pos': [12, 10], 'state': 'growing', 'energy': 78, 'social': 20, 'target': None, 'conversations': [], 'mood': 'peaceful', 'personality': 'peaceful'},
            {'type': 'W', 'pos': [3, 8], 'state': 'wandering', 'energy': 88, 'social': 80, 'target': None, 'conversations': [], 'mood': 'excited', 'personality': 'extroverted'},
            {'type': 'S', 'pos': [15, 3], 'state': 'patrolling', 'energy': 95, 'social': 30, 'target': None, 'conversations': [], 'mood': 'alert', 'personality': 'aggressive'}
        ],
        'map': [[0] * 25 for _ in range(19)],
        'step': 0,
        'logs': [
            '🌍 World initialized with intelligent autonomous agents',
            '🦆 Duck (D) is exploring the environment',
            '🦠 Amoeba (A) is feeding on resources',
            '🌱 Grass (G) is growing and spreading',
            '🚶 Wanderer (W) is seeking social interaction',
            '🦁 Stalker (S) is patrolling territory'
        ],
        'conversations': [],
        'social_events': [],
        'environmental_changes': []
    }

def step_intelligent_simulation(state):
    """Step the simulation with intelligent, coherent behavior"""
    state['step'] += 1
    
    # Create a logical world map
    state['map'] = generate_logical_world_map(state['width'], state['height'])
    
    # Process each agent with intelligent behavior
    for entity in state['entities']:
        entity = process_agent_intelligence(entity, state)
    
    # Generate meaningful interactions
    state['conversations'] = generate_meaningful_conversations(state['entities'])
    state['social_events'] = generate_logical_social_events(state['entities'])
    state['environmental_changes'] = generate_environmental_changes(state)
    
    # Update logs with meaningful events
    new_logs = generate_meaningful_logs(state)
    state['logs'].extend(new_logs)
    
    # Keep only recent logs
    if len(state['logs']) > 20:
        state['logs'] = state['logs'][-20:]
    
    return state

def generate_logical_world_map(width, height):
    """Generate a logical, coherent world map"""
    world_map = [[0 for _ in range(width)] for _ in range(height)]
    
    # Create logical zones
    for y in range(height):
        for x in range(width):
            # Center area - safe zone
            if 8 <= x <= 16 and 6 <= y <= 12:
                world_map[y][x] = 1  # Grass
            # Water areas
            elif (x < 3 or x > width-4) and (y < 3 or y > height-4):
                world_map[y][x] = 2  # Water
            # Mountain areas
            elif (x < 5 or x > width-6) and (y < 5 or y > height-6):
                world_map[y][x] = 3  # Mountain
            # Forest areas
            elif (6 <= x <= 8 or 17 <= x <= 19) and (4 <= y <= height-5):
                world_map[y][x] = 4  # Forest
            # Crystal deposits
            elif (x == 10 or x == 14) and (y == 2 or y == height-3):
                world_map[y][x] = 5  # Crystal
            else:
                world_map[y][x] = 1  # Default to grass
    
    return world_map

def process_agent_intelligence(entity, world_state):
    """Process agent behavior with intelligent decision making"""
    
    # Get nearby entities and terrain
    nearby_entities = get_nearby_entities(entity, world_state['entities'], 3)
    nearby_terrain = get_nearby_terrain(entity, world_state['map'], 2)
    
    # Apply agent-specific intelligence
    if entity['type'] == 'D':  # Duck
        entity = process_duck_intelligence(entity, nearby_entities, nearby_terrain, world_state)
    elif entity['type'] == 'A':  # Amoeba
        entity = process_amoeba_intelligence(entity, nearby_entities, nearby_terrain, world_state)
    elif entity['type'] == 'G':  # Grass
        entity = process_grass_intelligence(entity, nearby_entities, nearby_terrain, world_state)
    elif entity['type'] == 'W':  # Wanderer
        entity = process_wanderer_intelligence(entity, nearby_entities, nearby_terrain, world_state)
    elif entity['type'] == 'S':  # Stalker
        entity = process_stalker_intelligence(entity, nearby_entities, nearby_terrain, world_state)
    
    # Natural energy and social decay
    entity['energy'] = max(0, min(100, entity['energy'] - random.uniform(0.5, 1.0)))
    entity['social'] = max(0, min(100, entity['social'] - random.uniform(0.3, 0.7)))
    
    return entity

def process_duck_intelligence(duck, nearby_entities, nearby_terrain, world_state):
    """Intelligent duck behavior"""
    
    # Find threats (stalkers)
    threats = [e for e in nearby_entities if e['type'] == 'S']
    
    if threats:
        # Flee from threats
        duck['state'] = 'fleeing'
        duck['target'] = None
        duck['mood'] = 'frightened'
        
        # Move away from nearest threat
        threat = threats[0]
        dx = duck['pos'][0] - threat['pos'][0]
        dy = duck['pos'][1] - threat['pos'][1]
        
        # Move in opposite direction
        new_x = max(0, min(world_state['width']-1, duck['pos'][0] + (1 if dx < 0 else -1)))
        new_y = max(0, min(world_state['height']-1, duck['pos'][1] + (1 if dy < 0 else -1)))
        
        duck['pos'] = [new_x, new_y]
        duck['energy'] -= 2
    
    elif duck['energy'] < 40:
        # Find food (grass)
        duck['state'] = 'foraging'
        duck['mood'] = 'hungry'
        
        # Look for grass in nearby terrain
        grass_positions = []
        for y in range(max(0, duck['pos'][1]-2), min(world_state['height'], duck['pos'][1]+3)):
            for x in range(max(0, duck['pos'][0]-2), min(world_state['width'], duck['pos'][0]+3)):
                if world_state['map'][y][x] == 1:  # Grass
                    grass_positions.append([x, y])
        
        if grass_positions:
            # Move towards nearest grass
            target_grass = min(grass_positions, key=lambda pos: abs(pos[0] - duck['pos'][0]) + abs(pos[1] - duck['pos'][1]))
            duck['target'] = target_grass
            
            # Move towards target
            if duck['pos'][0] < target_grass[0]: duck['pos'][0] += 1
            elif duck['pos'][0] > target_grass[0]: duck['pos'][0] -= 1
            if duck['pos'][1] < target_grass[1]: duck['pos'][1] += 1
            elif duck['pos'][1] > target_grass[1]: duck['pos'][1] -= 1
            
            # Eat if close enough
            if abs(duck['pos'][0] - target_grass[0]) <= 1 and abs(duck['pos'][1] - target_grass[1]) <= 1:
                duck['energy'] += 5
                duck['state'] = 'eating'
                duck['mood'] = 'satisfied'
        else:
            # Random foraging movement
            if random.random() < 0.3:
                duck['pos'][0] = max(0, min(world_state['width']-1, duck['pos'][0] + random.choice([-1, 1])))
                duck['pos'][1] = max(0, min(world_state['height']-1, duck['pos'][1] + random.choice([-1, 1])))
    
    elif duck['social'] > 75:
        # Find social companions
        duck['state'] = 'seeking_company'
        duck['mood'] = 'lonely'
        
        social_targets = [e for e in nearby_entities if e['type'] in ['D', 'W'] and e != duck]
        if social_targets:
            target = social_targets[0]
            duck['target'] = target['pos']
            
            # Move towards social target
            if duck['pos'][0] < target['pos'][0]: duck['pos'][0] += 1
            elif duck['pos'][0] > target['pos'][0]: duck['pos'][0] -= 1
            if duck['pos'][1] < target['pos'][1]: duck['pos'][1] += 1
            elif duck['pos'][1] > target['pos'][1]: duck['pos'][1] -= 1
            
            # Socialize if close enough
            if abs(duck['pos'][0] - target['pos'][0]) <= 1 and abs(duck['pos'][1] - target['pos'][1]) <= 1:
                duck['social'] += 3
                duck['state'] = 'socializing'
                duck['mood'] = 'happy'
    
    else:
        # Normal exploration
        duck['state'] = 'exploring'
        duck['mood'] = 'curious'
        
        # Gentle exploration movement
        if random.random() < 0.2:
            duck['pos'][0] = max(0, min(world_state['width']-1, duck['pos'][0] + random.choice([-1, 0, 1])))
            duck['pos'][1] = max(0, min(world_state['height']-1, duck['pos'][1] + random.choice([-1, 0, 1])))
    
    return duck

def process_amoeba_intelligence(amoeba, nearby_entities, nearby_terrain, world_state):
    """Intelligent amoeba behavior"""
    
    # Find resources (grass)
    resources = []
    for y in range(max(0, amoeba['pos'][1]-2), min(world_state['height'], amoeba['pos'][1]+3)):
        for x in range(max(0, amoeba['pos'][0]-2), min(world_state['width'], amoeba['pos'][0]+3)):
            if world_state['map'][y][x] == 1:  # Grass
                resources.append([x, y])
    
    if amoeba['energy'] < 30:
        # Desperately seek food
        amoeba['state'] = 'starving'
        amoeba['mood'] = 'desperate'
        
        if resources:
            # Move towards nearest resource
            target_resource = min(resources, key=lambda pos: abs(pos[0] - amoeba['pos'][0]) + abs(pos[1] - amoeba['pos'][1]))
            amoeba['target'] = target_resource
            
            if amoeba['pos'][0] < target_resource[0]: amoeba['pos'][0] += 1
            elif amoeba['pos'][0] > target_resource[0]: amoeba['pos'][0] -= 1
            if amoeba['pos'][1] < target_resource[1]: amoeba['pos'][1] += 1
            elif amoeba['pos'][1] > target_resource[1]: amoeba['pos'][1] -= 1
            
            # Consume if close enough
            if abs(amoeba['pos'][0] - target_resource[0]) <= 1 and abs(amoeba['pos'][1] - target_resource[1]) <= 1:
                amoeba['energy'] += 8
                amoeba['state'] = 'feeding'
                amoeba['mood'] = 'satisfied'
        else:
            # Random search movement
            if random.random() < 0.4:
                amoeba['pos'][0] = max(0, min(world_state['width']-1, amoeba['pos'][0] + random.choice([-1, 1])))
                amoeba['pos'][1] = max(0, min(world_state['height']-1, amoeba['pos'][1] + random.choice([-1, 1])))
    
    elif amoeba['energy'] > 80:
        # Look for reproduction opportunities
        amoeba['state'] = 'seeking_mate'
        amoeba['mood'] = 'focused'
        
        other_amoebas = [e for e in nearby_entities if e['type'] == 'A' and e != amoeba]
        if other_amoebas:
            mate = other_amoebas[0]
            amoeba['target'] = mate['pos']
            
            # Move towards mate
            if amoeba['pos'][0] < mate['pos'][0]: amoeba['pos'][0] += 1
            elif amoeba['pos'][0] > mate['pos'][0]: amoeba['pos'][0] -= 1
            if amoeba['pos'][1] < mate['pos'][1]: amoeba['pos'][1] += 1
            elif amoeba['pos'][1] > mate['pos'][1]: amoeba['pos'][1] -= 1
            
            # Reproduce if close enough
            if abs(amoeba['pos'][0] - mate['pos'][0]) <= 1 and abs(amoeba['pos'][1] - mate['pos'][1]) <= 1:
                amoeba['energy'] -= 20
                amoeba['state'] = 'reproducing'
                amoeba['mood'] = 'excited'
    
    else:
        # Normal growth and movement
        amoeba['state'] = 'growing'
        amoeba['mood'] = 'content'
        
        # Slow growth movement
        if random.random() < 0.1:
            amoeba['pos'][0] = max(0, min(world_state['width']-1, amoeba['pos'][0] + random.choice([-1, 0, 1])))
            amoeba['pos'][1] = max(0, min(world_state['height']-1, amoeba['pos'][1] + random.choice([-1, 0, 1])))
    
    return amoeba

def process_wanderer_intelligence(wanderer, nearby_entities, nearby_terrain, world_state):
    """Intelligent wanderer behavior"""
    
    # Find social opportunities
    social_targets = [e for e in nearby_entities if e['type'] in ['D', 'W', 'A'] and e != wanderer]
    
    if wanderer['social'] > 85:
        # Desperately seek social contact
        wanderer['state'] = 'desperately_lonely'
        wanderer['mood'] = 'panicked'
        
        if social_targets:
            target = social_targets[0]
            wanderer['target'] = target['pos']
            
            # Rush towards social target
            if wanderer['pos'][0] < target['pos'][0]: wanderer['pos'][0] += 2
            elif wanderer['pos'][0] > target['pos'][0]: wanderer['pos'][0] -= 2
            if wanderer['pos'][1] < target['pos'][1]: wanderer['pos'][1] += 2
            elif wanderer['pos'][1] > target['pos'][1]: wanderer['pos'][1] -= 2
            
            # Socialize if close enough
            if abs(wanderer['pos'][0] - target['pos'][0]) <= 1 and abs(wanderer['pos'][1] - target['pos'][1]) <= 1:
                wanderer['social'] += 5
                wanderer['state'] = 'socializing'
                wanderer['mood'] = 'relieved'
        else:
            # Panic movement
            if random.random() < 0.6:
                wanderer['pos'][0] = max(0, min(world_state['width']-1, wanderer['pos'][0] + random.choice([-2, -1, 1, 2])))
                wanderer['pos'][1] = max(0, min(world_state['height']-1, wanderer['pos'][1] + random.choice([-2, -1, 1, 2])))
    
    elif wanderer['personality'] == 'extroverted' and social_targets:
        # Actively seek social contact
        wanderer['state'] = 'seeking_company'
        wanderer['mood'] = 'excited'
        
        target = social_targets[0]
        wanderer['target'] = target['pos']
        
        # Move towards social target
        if wanderer['pos'][0] < target['pos'][0]: wanderer['pos'][0] += 1
        elif wanderer['pos'][0] > target['pos'][0]: wanderer['pos'][0] -= 1
        if wanderer['pos'][1] < target['pos'][1]: wanderer['pos'][1] += 1
        elif wanderer['pos'][1] > target['pos'][1]: wanderer['pos'][1] -= 1
    
    else:
        # Normal exploration
        wanderer['state'] = 'wandering'
        wanderer['mood'] = 'curious'
        
        # Purposeful exploration
        if random.random() < 0.3:
            wanderer['pos'][0] = max(0, min(world_state['width']-1, wanderer['pos'][0] + random.choice([-1, 1])))
            wanderer['pos'][1] = max(0, min(world_state['height']-1, wanderer['pos'][1] + random.choice([-1, 1])))
    
    return wanderer

def process_stalker_intelligence(stalker, nearby_entities, nearby_terrain, world_state):
    """Intelligent stalker behavior"""
    
    # Find prey and threats
    prey = [e for e in nearby_entities if e['type'] in ['D', 'A']]
    threats = [e for e in nearby_entities if e['type'] == 'S' and e != stalker]
    
    if threats:
        # Defend territory
        stalker['state'] = 'territorial_defense'
        stalker['mood'] = 'aggressive'
        
        threat = threats[0]
        stalker['target'] = threat['pos']
        
        # Move aggressively towards threat
        if stalker['pos'][0] < threat['pos'][0]: stalker['pos'][0] += 2
        elif stalker['pos'][0] > threat['pos'][0]: stalker['pos'][0] -= 2
        if stalker['pos'][1] < threat['pos'][1]: stalker['pos'][1] += 2
        elif stalker['pos'][1] > threat['pos'][1]: stalker['pos'][1] -= 2
        
        stalker['energy'] -= 3
    
    elif prey and stalker['energy'] < 70:
        # Hunt prey
        stalker['state'] = 'hunting'
        stalker['mood'] = 'focused'
        
        target_prey = prey[0]
        stalker['target'] = target_prey['pos']
        
        # Stealthy approach
        if random.random() < 0.7:
            if stalker['pos'][0] < target_prey['pos'][0]: stalker['pos'][0] += 1
            elif stalker['pos'][0] > target_prey['pos'][0]: stalker['pos'][0] -= 1
            if stalker['pos'][1] < target_prey['pos'][1]: stalker['pos'][1] += 1
            elif stalker['pos'][1] > target_prey['pos'][1]: stalker['pos'][1] -= 1
        else:
            # Pounce attack
            if stalker['pos'][0] < target_prey['pos'][0]: stalker['pos'][0] += 3
            elif stalker['pos'][0] > target_prey['pos'][0]: stalker['pos'][0] -= 3
            if stalker['pos'][1] < target_prey['pos'][1]: stalker['pos'][1] += 3
            elif stalker['pos'][1] > target_prey['pos'][1]: stalker['pos'][1] -= 3
            
            # Catch prey if close enough
            if abs(stalker['pos'][0] - target_prey['pos'][0]) <= 1 and abs(stalker['pos'][1] - target_prey['pos'][1]) <= 1:
                stalker['energy'] += 15
                stalker['state'] = 'feeding'
                stalker['mood'] = 'satisfied'
    
    else:
        # Patrol territory
        stalker['state'] = 'patrolling'
        stalker['mood'] = 'alert'
        
        # Systematic patrol movement
        if random.random() < 0.4:
            stalker['pos'][0] = max(0, min(world_state['width']-1, stalker['pos'][0] + random.choice([-1, 1])))
            stalker['pos'][1] = max(0, min(world_state['height']-1, stalker['pos'][1] + random.choice([-1, 1])))
    
    return stalker

def process_grass_intelligence(grass, nearby_entities, nearby_terrain, world_state):
    """Intelligent grass behavior"""
    
    # Find water sources and consumers
    water_sources = []
    for y in range(max(0, grass['pos'][1]-2), min(world_state['height'], grass['pos'][1]+3)):
        for x in range(max(0, grass['pos'][0]-2), min(world_state['width'], grass['pos'][0]+3)):
            if world_state['map'][y][x] == 2:  # Water
                water_sources.append([x, y])
    
    consumers = [e for e in nearby_entities if e['type'] in ['D', 'A']]
    
    if consumers:
        # Being consumed
        grass['state'] = 'being_consumed'
        grass['mood'] = 'stressed'
        grass['energy'] -= 3
        
        # Try to regrow
        if grass['energy'] > 20:
            grass['energy'] += 2
    
    elif water_sources and grass['energy'] < 60:
        # Absorb water
        grass['state'] = 'absorbing_water'
        grass['mood'] = 'content'
        grass['energy'] += 3
    
    elif grass['energy'] > 80:
        # Spread to new areas
        grass['state'] = 'spreading'
        grass['mood'] = 'productive'
        
        # Look for empty grass spots nearby
        empty_spots = []
        for y in range(max(0, grass['pos'][1]-1), min(world_state['height'], grass['pos'][1]+2)):
            for x in range(max(0, grass['pos'][0]-1), min(world_state['width'], grass['pos'][0]+2)):
                if world_state['map'][y][x] == 1:  # Grass
                    # Check if no entity is there
                    if not any(e['pos'] == [x, y] for e in world_state['entities']):
                        empty_spots.append([x, y])
        
        if empty_spots and random.random() < 0.05:  # 5% chance to spread
            new_pos = random.choice(empty_spots)
            world_state['entities'].append({
                'type': 'G', 'pos': new_pos, 'state': 'growing', 
                'energy': 30, 'social': 10, 'target': None, 
                'conversations': [], 'mood': 'new', 'personality': 'peaceful'
            })
            grass['energy'] -= 20
    
    else:
        # Normal photosynthesis
        grass['state'] = 'photosynthesizing'
        grass['mood'] = 'peaceful'
        grass['energy'] += 1
    
    return grass

def get_nearby_entities(entity, all_entities, max_distance):
    """Get entities within a certain distance"""
    nearby = []
    for other in all_entities:
        if other != entity:
            distance = ((entity['pos'][0] - other['pos'][0])**2 + (entity['pos'][1] - other['pos'][1])**2)**0.5
            if distance <= max_distance:
                nearby.append(other)
    return nearby

def get_nearby_terrain(entity, world_map, max_distance):
    """Get terrain information near an entity"""
    nearby_terrain = []
    for y in range(max(0, entity['pos'][1]-max_distance), min(len(world_map), entity['pos'][1]+max_distance+1)):
        for x in range(max(0, entity['pos'][0]-max_distance), min(len(world_map[0]), entity['pos'][0]+max_distance+1)):
            if world_map[y][x] != 0:
                nearby_terrain.append((x, y, world_map[y][x]))
    return nearby_terrain

def generate_meaningful_conversations(entities):
    """Generate meaningful conversations between nearby agents"""
    conversations = []
    
    for i, entity1 in enumerate(entities):
        for j, entity2 in enumerate(entities[i+1:], i+1):
            distance = ((entity1['pos'][0] - entity2['pos'][0])**2 + (entity1['pos'][1] - entity2['pos'][1])**2)**0.5
            
            if distance <= 2 and entity1['social'] > 50 and entity2['social'] > 50:
                conversation = generate_meaningful_conversation(entity1, entity2)
                conversations.append(conversation)
    
    return conversations

def generate_meaningful_conversation(entity1, entity2):
    """Generate a meaningful conversation based on agent states and moods"""
    
    # Conversation based on current states and moods
    if entity1['state'] == 'fleeing' and entity2['state'] == 'fleeing':
        messages = [
            f"{entity1['type']}: 'There's a threat nearby! We should stick together!'",
            f"{entity2['type']}: 'Agreed! Safety in numbers!'"
        ]
    elif entity1['mood'] == 'lonely' and entity2['mood'] == 'lonely':
        messages = [
            f"{entity1['type']}: 'I'm so glad I found you! I was feeling really lonely.'",
            f"{entity2['type']}: 'Me too! Let's explore together!'"
        ]
    elif entity1['state'] == 'hunting' and entity2['type'] in ['D', 'A']:
        messages = [
            f"{entity1['type']}: 'I can see you there...'",
            f"{entity2['type']}: 'Oh no! I need to get away!'"
        ]
    else:
        messages = [
            f"{entity1['type']}: 'Hello {entity2['type']}! How are you today?'",
            f"{entity2['type']}: 'Hi {entity1['type']}! I'm doing well, thanks!'"
        ]
    
    return {
        'participants': [entity1['type'], entity2['type']],
        'messages': messages,
        'step': 0
    }

def generate_logical_social_events(entities):
    """Generate logical social events"""
    events = []
    
    # Group formations
    social_entities = [e for e in entities if e['social'] > 70 and e['state'] in ['socializing', 'seeking_company']]
    if len(social_entities) >= 2:
        events.append({
            'type': 'group_formation',
            'participants': [e['type'] for e in social_entities[:2]],
            'description': f"{social_entities[0]['type']} and {social_entities[1]['type']} formed a social group!"
        })
    
    # Hunting events
    hunters = [e for e in entities if e['state'] == 'hunting']
    if hunters:
        events.append({
            'type': 'hunting_behavior',
            'participants': [e['type'] for e in hunters],
            'description': f"{hunters[0]['type']} is actively hunting for prey"
        })
    
    return events

def generate_environmental_changes(world_state):
    """Generate environmental changes"""
    changes = []
    
    # Weather effects
    if random.random() < 0.1:
        changes.append({
            'type': 'weather',
            'description': 'A gentle breeze is blowing through the world'
        })
    
    # Resource regeneration
    if random.random() < 0.05:
        changes.append({
            'type': 'resource',
            'description': 'New grass patches are growing in fertile areas'
        })
    
    return changes

def generate_meaningful_logs(world_state):
    """Generate meaningful logs based on simulation state"""
    logs = []
    
    # Energy-based events
    low_energy = [e for e in world_state['entities'] if e['energy'] < 20]
    if low_energy:
        logs.append(f"⚠️ Warning: {low_energy[0]['type']} is critically low on energy!")
    
    # Social events
    high_social = [e for e in world_state['entities'] if e['social'] > 90]
    if high_social:
        logs.append(f"💬 {high_social[0]['type']} is feeling extremely social and seeking interaction")
    
    # Hunting events
    hunters = [e for e in world_state['entities'] if e['state'] == 'hunting']
    if hunters:
        logs.append(f"🦁 {hunters[0]['type']} is stalking prey in the area")
    
    # Fleeing events
    fleeing = [e for e in world_state['entities'] if e['state'] == 'fleeing']
    if fleeing:
        logs.append(f"🏃 {fleeing[0]['type']} is fleeing from a threat!")
    
    return logs

def create_test_environment(test_type):
    """Create a test environment"""
    return create_simple_simulation()

def import_fortress_file(fortress_file):
    """Import a fortress file"""
    return create_simple_simulation()

@app.route('/api/available_tests')
def available_tests():
    """Get list of available test environments"""
    tests = ['DUCK', 'AMOEBA', 'GRASS', 'WANDERER', 'STALKER', 'BOKO', 'GORON', 'BLUPEE', 'KOROK', 'POKEMON']
    return jsonify(tests)

@app.route('/api/available_fortresses')
def available_fortresses():
    """Get list of available fortress files"""
    demo_worlds = ['DEMO_WORLD_1', 'DEMO_WORLD_2', 'DEMO_WORLD_3']
    return jsonify(demo_worlds)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
