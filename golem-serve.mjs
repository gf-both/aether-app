import { createServer } from '/Users/gastonfrydlewski/Downloads/golem-app/node_modules/vite/dist/node/index.js'

const server = await createServer({
  root: '/Users/gastonfrydlewski/Downloads/golem-app',
  server: { port: 5176, host: true },
})
await server.listen()
server.printUrls()
