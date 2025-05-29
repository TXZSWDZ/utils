import { useMerge } from '@wthe/utils-shared'

interface StorageEventHooks {
  afterGet?: (key: string, value: any) => any
  beforeSet?: (key: string, value: any) => [key: string, value: any]
  beforeRemove?: (key: string) => string
  beforeClear?: () => boolean
}

interface Config {
  merge?: boolean
  expires?: boolean | number
}

interface options {
  type?: 'local' | 'session'
  config?: Config & StorageEventHooks
}

interface StorageService {
  get: (key: string) => any
  set: (key: string, value: any, options?: Config) => void
  remove: (key: string) => void
  clear: () => void
}

const storageInstances = new Map<'local' | 'session', StorageService>()

export function useStorage(
  options?: options,
): StorageService {
  class StorageProxy {
    private config: Config & StorageEventHooks
    private storage: Storage
    constructor(storage: Storage, config: Config) {
      this.storage = storage
      this.config = {
        afterGet: (key, value) => value,
        beforeSet: (key, value) => [key, value],
        beforeRemove: key => key,
        beforeClear: () => true,
        merge: false,
        expires: false,
        ...config,
      }
    }

    private getExpiryTime(options?: Config): number | boolean {
      const { expires: setExpires = false } = options || {}

      const { expires: configExpires } = this.config

      const expires = setExpires || configExpires

      if (!expires)
        return false

      if (typeof expires === 'number')
        return Date.now() + expires

      return Date.now() + 1000 * 60 * 60 * 24 * 30
    }

    getItem(key: string): any {
      const value = this.storage.getItem(key)

      if (value === null)
        return this.config.afterGet!(key, null)

      const { value: storedValue, expiry } = JSON.parse(value)

      if (expiry) {
        if (Date.now() > expiry) {
          this.removeItem(key)
          return this.config.afterGet!(key, null)
        }
        else {
          return this.config.afterGet!(key, storedValue)
        }
      }
      else {
        const storedValue = JSON.parse(value)
        return this.config.afterGet!(key, storedValue)
      }
    }

    setItem(key: string, value: any, options?: Config): void {
      const { merge: setMerge = undefined } = options || {}
      const { merge: configMerge } = this.config

      let [newKey, newValue] = this.config.beforeSet!(key, value)

      let isMerge
      if (setMerge !== undefined) {
        isMerge = setMerge
      }
      else {
        isMerge = configMerge
      }

      if (isMerge) {
        const storedValue = this.getItem(newKey)

        if (storedValue) {
          newValue = useMerge(storedValue, newValue)
        }
      }

      const expiry = this.getExpiryTime(options)

      if (expiry) {
        const payload = {
          value: newValue,
          expiry,
        }
        newValue = JSON.stringify(payload)
      }
      else {
        newValue = JSON.stringify(newValue)
      }

      this.storage.setItem(newKey, newValue)
    }

    removeItem(key: string): void {
      const newKey = this.config.beforeRemove!(key)

      this.storage.removeItem(newKey)
    }

    clear(): void {
      const shouldClear = this.config.beforeClear!()

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
    set: (key: string, value: any, options?: Config) => { storageInstance.setItem(key, value, options) },
    remove: (key: string) => { storageInstance.removeItem(key) },
    clear: () => { storageInstance.clear() },
  }

  storageInstances.set(type, service)

  return service
}
