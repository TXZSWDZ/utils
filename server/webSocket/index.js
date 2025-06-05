import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    ws.send(`你发送的消息已收到: ${message}`)
  })

  ws.on('close', () => {
    console.warn('客户端已断开连接')
  })

  ws.on('error', (err) => {
    console.warn('连接错误:', err)
  })
})
