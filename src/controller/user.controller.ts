import {Body, Controller, Post} from '@nestjs/common'
import {success} from '../utils/result.util'
import {idVerify, keyVerify, loginVerify} from '../verify/admin.verify'
import {UserService} from '../service/user.service'
import {AdminService} from '../service/admin.service'
import {
  captcha_err,
  captcha_expired,
  ErrorException,
  param_err,
  password_err,
  user_locked,
  user_not_found,
} from '../common/exceptions/error.exception'
import {redis} from '../config/db.config'
import {compareSync} from 'bcryptjs'
import {JwtService} from '@nestjs/jwt'
import {create, randomText} from 'svg-captcha'


@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService,
              private readonly adminService: AdminService,
              private readonly jwtService: JwtService) {
  }

  // 登录
  @Post('login')
  async login(@Body() body) {
    const {value, error} = loginVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    // 取出redis验证码
    const captcha = await redis.get(value.key)
    // 删除redis验证码
    await redis.del(value.key)
    // 验证码存不存在
    if (!captcha) throw new ErrorException(captcha_expired)
    // 验证码是否一致
    if (value.captcha.toUpperCase() !== captcha.toUpperCase()) throw new ErrorException(captcha_err)
    // 查询用户信息
    const user = await this.userService.login(value.username)
    // 用户不存在
    if (!user) throw new ErrorException(user_not_found)
    // 密码是否正确
    if (!compareSync(value.password, user.password)) throw new ErrorException(password_err)
    // 账户是否锁定
    if (!user.status) throw new ErrorException(user_locked)
    // 生成token
    const token = this.jwtService.sign({id: user.id})

    return success({id: user.id, token})
  }

  @Post('captcha')
  async captcha(@Body() body) {
    const {value, error} = keyVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)

    const code = create({height: 40, color: true, ignoreChars: '0o1ig'})
    const randomKey = value.key || 'captcha_' + randomText(30)
    await redis.setex(randomKey, 60, code.text)
    return success({key: randomKey, data: code.data})
  }

  // 查询用户所有菜单
  @Post('getUserMenu')
  async getUserMenu(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (value.id === 1) return success(await this.adminService.getMenuAll())
    return success(await this.userService.getRoleMenu(value.id))
  }

  // 查询用户所有菜单
  @Post('sign_out')
  async sign_out(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    // 删除redis缓存的权限
    await redis.del(`permission_${value.id}`)
    return success()
  }

}
