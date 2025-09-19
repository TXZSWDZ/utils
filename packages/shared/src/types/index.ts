export type Awaitable<T> = T | Promise<T> | PromiseLike<T>

export type Fn<P extends unknown[] = [], T = void> = (...args: P) => T

export type AsyncFn<P extends unknown[] = [], T = void> = (...args: P) => Awaitable<T>
