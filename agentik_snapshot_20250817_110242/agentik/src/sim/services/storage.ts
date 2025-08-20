import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'agentik'
const DB_VERSION = 1

interface WorldData {
  name: string
  timestamp: number
  data: any
}

interface Settings {
  key: string
  value: any
}

class StorageService {
  private db: IDBPDatabase | null = null

  async initialize(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('worlds')) {
            db.createObjectStore('worlds', { keyPath: 'name' })
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
        }
      })
      console.log('Storage service initialized')
    } catch (error) {
      console.error('Failed to initialize storage service:', error)
    }
  }

  async saveWorld(name: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized')
    
    const worldData: WorldData = {
      name,
      timestamp: Date.now(),
      data
    }
    
    await this.db.put('worlds', worldData)
  }

  async loadWorld(name: string): Promise<any | null> {
    if (!this.db) throw new Error('Storage not initialized')
    
    const worldData = await this.db.get('worlds', name)
    return worldData?.data || null
  }

  async listWorlds(): Promise<string[]> {
    if (!this.db) throw new Error('Storage not initialized')
    
    const worlds = await this.db.getAll('worlds')
    return worlds.map(w => w.name)
  }

  async deleteWorld(name: string): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized')
    
    await this.db.delete('worlds', name)
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized')
    
    const setting: Settings = { key, value }
    await this.db.put('settings', setting)
  }

  async loadSetting(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Storage not initialized')
    
    const setting = await this.db.get('settings', key)
    return setting?.value || null
  }

  async deleteSetting(key: string): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized')
    
    await this.db.delete('settings', key)
  }
}

export const storageService = new StorageService()

// Auto-initialize when module is imported
storageService.initialize().catch(console.error)
