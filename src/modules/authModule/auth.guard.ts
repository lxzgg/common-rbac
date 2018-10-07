import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common'
import {Observable} from 'rxjs'
import {PERMISSION_DEFINITION} from './decorator/permission.decorator'
import {Permission} from '../../entity/permission.entity'
import {AuthService} from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()

    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())
    if (!permission) return true

    const token = request.headers.authorization
    if (!token) throw new UnauthorizedException('Token Is Null')

    const user: any = this.authService.verifyToken(token)
    // 超级管理员放行
    if (user.id === 1) return true

    return true
  }
}
