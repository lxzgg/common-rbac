import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common'
import {PERMISSION_DEFINITION} from '../decorator/permission.decorator'
import {Permission} from '../../entity/auth_permission.entity'
import {AuthService} from '../../service/auth.service'

/**
 * 权限守卫
 */
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())
    // 没有权限注解直接通过
    if (!permission) return true

    const request = context.switchToHttp().getRequest()
    // 获取用户header传过来的token
    const token = request.headers.authorization
    if (!token) throw new ForbiddenException('Token is null')

    // 验证token,获取用户信息
    const payload: any = this.authService.verifyToken(token)
    // 用户信息放入request用户token过期判断
    request.payload = payload

    //超级管理员不用权限验证
    if (payload.id === 1) return true

    // 数据库查询用户权限
    const user = await this.authService.findUserPermission(payload.id)
    if (!user) throw new ForbiddenException('用户不存在')

    const userPermission: any = []
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        userPermission.push(permission.identify)
      })
    })

    // 验证用户是否有该权限
    if (!userPermission.includes(permission.identify)) throw new ForbiddenException('权限不足')

    return true//不允许访问
  }
}
