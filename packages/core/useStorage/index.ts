interface StorageEventHooks {
  afterGet?: (key: string, value: any) => any
  beforeSet?: (key: string, value: any) => [key: string, value: any]
  beforeRemove?: (key: string) => string
  beforeClear?: () => boolean
}

interface Config extends StorageEventHooks {
  merge?: boolean
  expires?: boolean | number
}

interface options {
  type?: 'local' | 'session'
  config?: Config
}

interface StorageService {
  get: (key: string) => any
  set: (key: string, value: any) => void
  remove: (key: string) => void
  clear: () => void
}

const storageInstances = new Map<'local' | 'session', StorageService>()

export function useStorage(
  options?: options,
): StorageService {
  class StorageProxy {
    private config: Config
    private storage: Storage
    constructor(storage: Storage, config: Config) {
      this.storage = storage
      this.config = {
        afterGet: (key, value) => value,
        beforeSet: (key, value) => [key, value],
        beforeRemove: key => key,
        beforeClear: () => true,
        merge: false,
        expires: true,
        ...config,
      }
    }

    private getExpiryTime(): number | boolean {
      const { expires } = this.config
      if (!expires)
        return false
      if (typeof expires === 'number')
        return Date.now() + expires
      return Date.now() + 1000 * 60 * 60 * 24 * 30
    }

    getItem(key: string): any {
      const value = this.storage.getItem(key)
      if (!value)
        return this.config.afterGet(key, null)
      const { value: storedValue, expiry } = JSON.parse(value)
      if (expiry && expiry < Date.now()) {
        this.storage.removeItem(key)
        return this.config.afterGet(key, null)
      }
      else {
        return this.config.afterGet(key, storedValue)
      }
    }

    setItem(key: string, value: any): void {
      const [newKey, newValue] = this.config.beforeSet(key, value)
      if (newKey !== undefined || newValue !== undefined)
        return
      let finalValue = newValue

      if (this.config.merge && typeof newValue === 'object') {
        const existingValue = this.getItem(newKey)
        if (existingValue && typeof existingValue === 'object') {
          finalValue = { ...existingValue, ...newValue }
        }
      }

      const expiry = this.getExpiryTime()

      if (expiry) {
        const payload = {
          value: newValue,
          expiry,
        }
        finalValue = JSON.stringify(payload)
      }
      this.storage.setItem(newKey, finalValue)
    }

    removeItem(key: string): void {
      const newKey = this.config.beforeRemove(key)
      if (newKey !== undefined) {
        this.storage.removeItem(newKey)
      }
    }

    clear(): void {
      const shouldClear = this.config.beforeClear()
      if (shouldClear) {
        this.storage.clear()
      }
    }
  }

  const { type = 'local', config = {} } = options || {}
  if (storageInstances.has(type)) {
    return storageInstances.get(type)!
  }
  const storage: Storage = type === 'local' ? window.localStorage : window.sessionStorage
  const storageInstance = new StorageProxy(storage, config)
  const service = {
    get: (key: string) => storageInstance.getItem(key),
    set: (key: string, value: any) => { storageInstance.setItem(key, value) },
    remove: (key: string) => { storageInstance.removeItem(key) },
    clear: () => { storageInstance.clear() },
  }
  storageInstances.set(type, service)
  return service
}
