import Redis from 'ioredis'
import RedisMock from 'ioredis-mock'
const { REDIS_HOST } = process.env
export default REDIS_HOST ? new Redis(6379, REDIS_HOST) : new RedisMock(6379)
