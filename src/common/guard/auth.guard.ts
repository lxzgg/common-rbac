import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {PERMISSION_DEFINITION} from '../decorator/permission.decorator'
import {Permission} from '../../entity/auth_permission.entity'
import {JwtService} from '@nestjs/jwt'
import {
  ErrorException,
  permission_denied,
  token_has_expired,
  token_is_empty,
  user_not_found,
} from '../exceptions/error.exception'
import {User} from '../../entity/auth_user.entity'
import {Connection} from 'typeorm'
import {redis} from '../../config/db.config'

/**
 * 权限守卫
 */
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly connection: Connection,
              private readonly jwtService: JwtService) {
  }

  // token验证=>有没有限注解=>是否超级管理员=>权限验证
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // 获取用户header传过来的token
    const token = request.headers.authorization
    if (!token) throw new ErrorException(token_is_empty)

    let payload
    try {
      // 验证token,获取用户信息
      payload = this.jwtService.verify(token)
    } catch (e) {
      throw new ErrorException(token_has_expired)
    }
    // 用户信息放入request用户token过期判断
    request.payload = payload

    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())
    // 没有权限注解直接通过
    if (!permission) return true

    //超级管理员不用权限验证
    if (payload.id === 1) return true

    let userPermission: any = JSON.parse(await redis.get(`permission_${payload.id}`)) || []

    if (!userPermission.length) {
      // 数据库查询用户权限
      const user = await this.connection.getRepository(User).findOne(payload.id, {
        select: ['id'],
        relations: ['roles', 'roles.permissions'],
      })

      if (!user) throw new ErrorException(user_not_found)

      user.roles.forEach(role => {
        role.permissions.forEach(permission => {
          userPermission.push(permission.identify)
        })
      })

      userPermission = [...new Set(userPermission)]

      await redis.setex(`permission_${payload.id}`, 3600, JSON.stringify(userPermission))
    }
    // 验证用户是否有该权限
    if (!userPermission.includes(permission.identify)) throw new ErrorException(permission_denied)
    return true
  }
}
