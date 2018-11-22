import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common'
import {success} from '../utils/result.util'
import {keyVerify, loginVerify, updatePasswordVerify} from '../verify/auth.verify'
import {AuthLoginService} from '../service/auth.login.service'
import {
  access_denied,
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
import {AuthGuard} from '../common/guard/auth.guard'

@Controller('login')
export class AuthLoginController {

  constructor(private readonly loginService: AuthLoginService,
              private readonly jwtService: JwtService) {
  }

  // 登录
  @Post()
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
    const admin = await this.loginService.login(value.username)
    // 用户不存在
    if (!admin) throw new ErrorException(user_not_found)
    // 密码是否正确
    if (!compareSync(value.password, admin.password)) throw new ErrorException(password_err)
    // 账户是否锁定
    if (!admin.status) throw new ErrorException(user_locked)
    // 生成token
    const token = this.jwtService.sign({id: admin.id, version: admin.version})

    await redis.setex(`password_version_${admin.id}`, 3600, admin.version)

    return success({id: admin.id, token})
  }

  // 验证码
  @Post('captcha')
  async captcha(@Body() body) {
    const {value, error} = keyVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.loginService.captcha(value.key))
  }

  // 退出登录
  @Post('sign_out')
  @UseGuards(AuthGuard)
  async sign_out(@Req() req) {
    // 删除redis缓存的权限
    await redis.del(`permissions_${req.payload.id}`)
    return success()
  }

  // 修改密码
  @Post('updatePassword')
  @UseGuards(AuthGuard)
  async updatePassword(@Req() req, @Body() body) {
    const {value, error} = updatePasswordVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (req.payload.id !== value.id) throw new ErrorException(access_denied)
    return success(await this.loginService.updatePassword(value))
  }

}
