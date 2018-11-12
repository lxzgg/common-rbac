import * as Redis from 'ioredis'
import {sign, verify} from 'jsonwebtoken'

describe('redis', () => {

  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    db: 0,
  })

  it('should 1', async () => {
    await redis.set('key', '110')
  })

  it('should 2', function () {
    redis.get('key').then(function (result) {
      console.log(result)
    })
  })

  it('should d', function () {
    const a = sign({a: 1}, 'key', {expiresIn: 10})
    console.log(a)
  })

  it('should randomText', function () {
    const s = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjE1NDIwMTA1MjYsImV4cCI6MTU0MjAxMDUzNn0.vLzysYEDtYc9Onuxj1mwh7vGsUkuLoQnGP-jywMXgDU'
    const b = verify(s, 'key')
    console.log(b)
  })

})
