import * as Redis from 'ioredis'

describe('redis', () => {

  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    db: 0,
  })

  it('should keys', async () => {
    const keys = await redis.keys('*')
    console.log(keys)
  })

  it('should del', async () => {
    redis.keys('permissions_*').then(keys => {
      console.log(keys)
      if (keys.length) redis.del.apply(redis, keys)
    })
  })

  it('should set', async () => {
    await redis.setex('permissions_3', 3600, '666')
  })

  it('should get arr', async () => {
    const result = await redis.get('permissions_2')
    console.log(JSON.parse(result))
  })

  it('should set arr', async () => {
    await redis.del('permissions_*')
  })

})
