import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    // Create a loading bar
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(240, 270, 320, 50)

    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    })
    percentText.setOrigin(0.5, 0.5)

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '14px monospace',
        color: '#ffffff'
      }
    })
    assetText.setOrigin(0.5, 0.5)

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(250, 280, 300 * value, 30)
      percentText.setText(Math.floor(value * 100) + '%')
    })

    let anyProgress = false
    let startedWorld = false
    const startWorld = () => {
      if (startedWorld) return
      startedWorld = true
      this.scene.start('World')
    }
    this.load.on('fileprogress', (file: any) => {
      anyProgress = true
      assetText.setText('Loading asset: ' + file.key)
    })
    this.load.on('loaderror', (_file: any) => {
      console.error('Asset load error:', _file?.src || _file?.key || _file)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
      assetText.destroy()
      startWorld()
    })

    // Skip Tiled assets for now to avoid loading issues
    console.log('Skipping external assets, using procedural generation only')

    // Generate procedural tileset if no assets are available (fallback)
    this.generateTileset()
    
    // Generate placeholder agent sprites (fallback)
    this.generateAgentSprites()

    // Start immediately since we're not loading external assets
    this.time.delayedCall(100, () => startWorld())
  }

  create() {
    // Create character animations if villager spritesheet loaded
    if (this.textures.exists('villager')) {
      this.createCharacterAnimations()
    }
  }

  private createCharacterAnimations() {
    const anims = this.anims
    const mk = (key: string, frames: number[]) =>
      anims.create({ 
        key, 
        frames: frames.map(f => ({ key: 'villager', frame: f })), 
        frameRate: 8, 
        repeat: -1 
      })

    // Example frame layout (customize for your sheet)
    // up: [0..3], left: [4..7], down: [8..11], right: [12..15]
    mk('walk-up',    [0,1,2,3])
    mk('walk-left',  [4,5,6,7])
    mk('walk-down',  [8,9,10,11])
    mk('walk-right', [12,13,14,15])

    mk('idle-up',    [0])
    mk('idle-left',  [4])
    mk('idle-down',  [8])
    mk('idle-right', [12])
  }

  private generateTileset() {
    // Create a simple procedural tileset (fallback)
    const tileset = this.add.renderTexture(0, 0, 160, 32) // 5 tiles of 32x32
    
    // Grass tile
    tileset.fill(0x4a7c59, 0, 0, 32, 32)
    tileset.fill(0x3a6c49, 0, 0, 32, 32, 0.3)
    
    // Forest tile
    tileset.fill(0x2d5016, 32, 0, 32, 32)
    tileset.fill(0x1d4006, 32, 0, 32, 32, 0.4)
    
    // Water tile
    tileset.fill(0x4a90e2, 64, 0, 32, 32)
    tileset.fill(0x3a80d2, 64, 0, 32, 32, 0.2)
    
    // Mountain tile
    tileset.fill(0x8b7355, 96, 0, 32, 32)
    tileset.fill(0x7b6345, 96, 0, 32, 32, 0.3)
    
    // Crystal tile
    tileset.fill(0x9b59b6, 128, 0, 32, 32)
    tileset.fill(0x8b49a6, 128, 0, 32, 32, 0.4)
    
    tileset.saveTexture('tileset')
  }

  private generateAgentSprites() {
    // Generate simple colored circles for agents (fallback)
    const agentTypes = ['duck', 'amoeba', 'wanderer', 'stalker', 'grass']
    const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00]
    
    agentTypes.forEach((type, index) => {
      const sprite = this.add.graphics()
      sprite.fillStyle(colors[index], 1)
      sprite.fillCircle(16, 16, 12)
      sprite.lineStyle(2, 0xffffff, 1)
      sprite.strokeCircle(16, 16, 12)
      
      sprite.generateTexture(`agent-${type}`, 32, 32)
      sprite.destroy()
    })
  }
}
