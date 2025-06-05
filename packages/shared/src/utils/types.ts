export type Awaitable<T> = T | Promise<T>

export type Fn<P extends any[] = never, T = void> = (...args: P) => T

export type AsyncFn<P extends any[] = never, T = void> = (...args: P) => Awaitable<T>
