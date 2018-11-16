import * as Redis from 'ioredis'
import {sign, verify} from 'jsonwebtoken'

describe('redis', () => {

  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    db: 0,
  })

  it('should set arr', async () => {
    await redis.del('key')
  })

  it('should get arr', async () => {
    const a = JSON.parse(await redis.get('key'))
    console.log(a||![].length)
  })

  it('should array', async () => {
    let arr = ['admin:getMenuAll',
      'admin:getRoleMenuKeys',
      'admin:getAccess',
      'admin:getRole',
      'admin:addRole',
      'admin:updateRole',
      'admin:delRole',
      'admin:getRoleAccess',
      'admin:roleAddAccess',
      'admin:roleAddMenu']
    await redis.set('key', JSON.stringify(arr))
  })

  it('should set json', async () => {
    await redis.hmset('key', {a: [1, 2, 3], b: 2})
  })

  it('should get json', async () => {
    redis.hgetall('key').then(function (result) {
      console.log(result)
    })
  })

  it('should keys', async () => {
    const a = await redis.keys('*')
    console.log(a)
  })

  it('should d', async () => {
    const a = sign({a: 1}, 'key', {expiresIn: 10})
    console.log(a)
  })


  it('should randomText', async () => {
    console.log(JSON.parse(JSON.stringify(1)))
  })

})
