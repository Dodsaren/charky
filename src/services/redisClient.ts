const { REDIS_HOST } = process.env
import Redis from 'ioredis'
import RedisMock from 'ioredis-mock'
export default REDIS_HOST ? new Redis(6379, REDIS_HOST) : new RedisMock(6379)
