import { useTimeoutFn } from './index'

const { pause, resume, cancel } = useTimeoutFn(() => {
}, 1000)
