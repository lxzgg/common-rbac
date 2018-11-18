import {Injectable} from '@nestjs/common'
import {User} from '../entity/auth_user.entity'
import {Connection} from 'typeorm'
import {create, randomText} from 'svg-captcha'
import {redis} from '../config/db.config'

@Injectable()
export class UserService {

  constructor(private readonly connection: Connection) {
  }

  // 登录
  login(username) {
    return this.connection.getRepository(User).findOne({
      select: ['id', 'username', 'password', 'status'],
      where: {username},
    })
  }

  // 验证码
  async captcha(key) {
    const code = create({height: 40, color: true, ignoreChars: '0o1ig'})
    const randomKey = key || 'captcha_' + randomText(30)
    await redis.setex(randomKey, 60, code.text)
    return {key: randomKey, data: code.data}
  }

}
