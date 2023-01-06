import pino from 'pino'

pino.transport({
  target: './myTransport.ts',
  options: { destination: '/dev/null' },
})

export default pino({
  level: process.env.PINO_LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})
