import {Injectable} from '@nestjs/common'
import {Admin} from '../entity/auth_admin.entity'
import {create, randomText} from 'svg-captcha'
import {redis} from '../config/db.config'
import {compareSync, hashSync} from 'bcryptjs'
import {ErrorException, rawPassword_err} from '../common/exceptions/error.exception'
import {CommonService} from './common.service'

@Injectable()
export class LoginService {

  constructor(private readonly commonService: CommonService) {
  }

  // 登录
  login(username) {
    return Admin.findOne({
      select: ['id', 'username', 'password', 'status', 'version'],
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

  // 修改密码
  async updatePassword(data) {
    const adminInfo = await Admin.findOne(data.id, {select: ['id', 'password']})
    if (!compareSync(data.rawPassword, adminInfo.password)) throw new ErrorException(rawPassword_err)
    adminInfo.password = hashSync(data.newPassword)
    const admin = await adminInfo.save()
    admin.password = undefined
    this.commonService.clear_redis_password_version(data.id)
    return admin
  }

}
