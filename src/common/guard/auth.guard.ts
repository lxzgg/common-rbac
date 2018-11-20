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
import {Admin} from '../../entity/auth_admin.entity'
import {Connection} from 'typeorm'
import {redis} from '../../config/db.config'

/**
 * 权限守卫(权限认证入口)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  // 缓存权限
  private REDIS_PERMISSIONS = null
  // 缓存密码版本
  private REDIS_PASSWORD_VERSION = null

  constructor(private readonly connection: Connection,
              private readonly jwtService: JwtService) {
  }

  // token验证=>是否超级管理员=>有没权限注解=>权限验证
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // 获取用户header传过来的token
    const token = request.headers.authorization
    if (!token) throw new ErrorException(token_is_empty)

    let payload = null
    try {
      // 验证token,获取用户信息
      payload = this.jwtService.verify(token)
    } catch (e) {
      throw new ErrorException(token_has_expired)
    }
    // 用户信息放入request用户token过期判断
    request.payload = payload

    this.REDIS_PASSWORD_VERSION = `password_version_${payload.id}`

    let password_version: any = await redis.get(this.REDIS_PASSWORD_VERSION)

    if (!password_version) {
      const adminVersion = await Admin.findOne(payload.id, {select: ['version']})
      password_version = adminVersion.version
      await redis.setex(this.REDIS_PASSWORD_VERSION, 3600, adminVersion.version)
    }

    if (Number(payload.version) !== Number(password_version)) throw new ErrorException(token_has_expired)

    //超级管理员不用权限验证
    if (payload.id === 1) return true

    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())
    // 没有权限注解直接通过
    if (!permission) return true

    this.REDIS_PERMISSIONS = `permissions_${payload.id}`

    // redis取权限,如为null则初始化数组
    let adminPermissions: string[] = JSON.parse(await redis.get(this.REDIS_PERMISSIONS)) || []

    // 权限数组有无值,没有则去数据库查询
    if (!adminPermissions.length) adminPermissions = await this.userPermissions(payload.id)

    // 验证用户是否有该权限
    if (!adminPermissions.includes(permission.identify)) throw new ErrorException(permission_denied)

    return true
  }

  // 查询用户权限
  async userPermissions(id) {
    let adminPermissions: string[] = []
    // 数据库查询用户权限
    const admin = await Admin.findOne(id, {
      select: ['id'],
      relations: ['roles', 'roles.permissions', 'groups', 'groups.roles', 'groups.roles.permissions'],
    })

    if (!admin) throw new ErrorException(user_not_found)

    admin.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (!adminPermissions.includes(permission.identify)) {
          adminPermissions.push(permission.identify)
        }
      })
    })

    admin.groups.forEach(Group => {
      Group.roles.forEach(role => {
        role.permissions.forEach(permission => {
          if (!adminPermissions.includes(permission.identify)) {
            adminPermissions.push(permission.identify)
          }
        })
      })
    })

    await redis.setex(this.REDIS_PERMISSIONS, 3600, JSON.stringify(adminPermissions))
    return adminPermissions
  }
}
