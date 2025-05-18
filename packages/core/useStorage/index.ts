type storageTypes = 'local' | 'session'

enum methodType {
  GET = 'getItem',
  SET = 'setItem',
  REMOVE = 'removeItem',
  CLEAR = 'clear',
}

interface StorageHooks {
  afterGet?: (key: string | null) => any
  beforeSet?: (key: string, value: any) => any
  beforeRemove?: (key: string) => any
  beforeClear?: () => any
}

interface Config extends StorageHooks {
  expires?: boolean | number
}

// 声明StorageProxy类
class StorageProxy {
  #config: Config
  #originalMethods: { [K in methodType]: Storage[K] }
  constructor(private storage: Storage, config: Config) {
    this.#init(storage, config)
  }

  #init(storage: Storage, config: Config) {
    this.#originalMethods = Object.fromEntries(
      Object.values(methodType).map(key => [
        key,
        storage[key].bind(storage),
      ]),
    ) as { [K in methodType]: Storage[K] }

    this.#config = {
      afterGet: config.afterGet ?? (value => value),
      beforeSet: config.beforeSet ?? ((key, value) => [key, value]),
      beforeRemove: config.beforeRemove ?? (key => key),
      beforeClear: config.beforeClear ?? (() => {}),
      expires: config.expires ?? true,
    }
  }

  getItem(key: string): any {
    const value = this.#originalMethods.getItem(key)
    return this.#config.afterGet(value)
  }

  setItem(key: string, value: any): void {
    const [newKey, newValue] = this.#config.beforeSet(key, value)

    if (newKey !== undefined && newValue !== undefined) {
      this.#originalMethods.setItem(newKey, newValue)
    }
  }

  removeItem(key: string): void {
    const newKey = this.#config.beforeRemove(key)
    if (newKey !== undefined) {
      this.#originalMethods.removeItem(newKey)
    }
  }

  clear(): void {
    this.#config.beforeClear()
    this.#originalMethods.clear()
  }
}

interface options {
  type?: storageTypes
  config?: Config
}

interface StorageService {
  get: (key: string) => any
  set: (key: string, value: any) => void
  remove: (key: string) => void
  clear: () => void
}

export function useStorage(
  options?: options,
): StorageService {
  const { type = 'local', config = {} } = options || {}

  const storage: Storage = type === 'local' ? window.localStorage : window.sessionStorage

  const storageInterface = new StorageProxy(storage, config)

  return {
    get: (key: string) => storageInterface.getItem(key),
    set: (key: string, value: any) => storageInterface.setItem(key, value),
    remove: (key: string) => storageInterface.removeItem(key),
    clear: () => storageInterface.clear,
  }
}
