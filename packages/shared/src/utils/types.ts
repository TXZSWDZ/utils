export type Fn = () => void

export type AsyncFn<T = void> = () => Promise<T>

export type Awaitable<T> = T | Promise<T>
