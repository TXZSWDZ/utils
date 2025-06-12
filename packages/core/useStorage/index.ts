import { useMerge } from '@wthe/utils-shared'

interface StorageEventHooks {
  afterGet?: (key: string, value: any) => any
  beforeSet?: (key: string, value: any) => [key: string, value: any]
  beforeRemove?: (key: string) => string
  beforeClear?: () => boolean
}

interface GetConfig {
  needParse?: boolean
}

interface SetConfig {
  merge?: boolean
  expires?: boolean | number
}

interface options {
  type?: 'local' | 'session'
  config?: SetConfig & StorageEventHooks
}

interface StorageService {
  get: (key: string) => any
  set: (key: string, value: any, options?: SetConfig) => void
  remove: (key: string) => void
  clear: () => void
}

const storageInstances = new Map<'local' | 'session', StorageService>()

function readValue(value: any, options: GetConfig = {}) {
  if (options.needParse) {
    try {
      return JSON.parse(value)
    }
    catch (e) {
      return value
    }
  }
  else {
    return value
  }
}

function getExpiryTime(expires: boolean | number): number | boolean {
  if (typeof expires === 'number')
    return Date.now() + expires

  return Date.now() + 1000 * 60 * 60 * 24 * 30
}

export class StorageProxy {
  private config: SetConfig & StorageEventHooks
  private storage: Storage
  constructor(storage: Storage, config: SetConfig) {
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

  getItem(key: string, options?: GetConfig): any
  getItem<T>(key: string, options?: GetConfig): T
  getItem(key: string, options: GetConfig = {}) {
    const payload = readValue(this.storage.getItem(key), { needParse: true })

    if (payload === null)
      return this.config.afterGet!(key, null)

    if (payload.expiry) {
      if (Date.now() > payload.expiry) {
        this.removeItem(key)
        return this.config.afterGet!(key, null)
      }
      else {
        return this.config.afterGet!(key, payload.value)
      }
    }
    else {
      return this.config.afterGet!(key, readValue(payload, options))
    }
  }

  setItem(key: string, value: any, options?: SetConfig): void {
    const finalOptions = { ...this.config, ...options }

    let [newKey, newValue] = this.config.beforeSet!(key, value)

    if (finalOptions.merge) {
      const storedValue = this.getItem(newKey)

      if (storedValue) {
        newValue = useMerge(storedValue, newValue)
      }
    }

    if (typeof newValue !== 'string') {
      if (finalOptions.expires) {
        const payload = {
          value: newValue,
          expiry: getExpiryTime(finalOptions.expires),
        }
        newValue = payload
      }
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

export function useStorage(
  options?: options,
): StorageService {
  const { type = 'local', config = {} } = options || {}
  if (storageInstances.has(type)) {
    return storageInstances.get(type)!
  }

  const storage: Storage = type === 'local' ? window.localStorage : window.sessionStorage

  const storageInstance = new StorageProxy(storage, config)

  const service = {
    get: (key: string) => storageInstance.getItem(key),
    set: (key: string, value: any, options?: SetConfig) => { storageInstance.setItem(key, value, options) },
    remove: (key: string) => { storageInstance.removeItem(key) },
    clear: () => { storageInstance.clear() },
  }

  storageInstances.set(type, service)

  return service
}
