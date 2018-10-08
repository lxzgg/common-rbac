import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common'
import {PERMISSION_DEFINITION} from './decorator/permission.decorator'
import {Permission} from '../../entity/auth_permission.entity'
import {AuthService} from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())
    if (!permission) return true

    const token = request.headers.authorization
    if (!token) throw new ForbiddenException('Token Is Null')

    const payload: any = this.authService.verifyToken(token)
    //超级管理员不用权限验证
    if (payload.id === 1) return true

    const user = await this.authService.findUserPermission(payload.id)
    if (!user) throw new ForbiddenException('User does not exist')

    const userPermission: any = []
    user.role.forEach(role => {
      role.permission.forEach(permission => {
        userPermission.push(permission.identify)
      })
    })

    // 验证用户是否有该权限
    if (!userPermission.includes(permission.identify)) throw new ForbiddenException('Insufficient permissions')

    return true
  }
}
