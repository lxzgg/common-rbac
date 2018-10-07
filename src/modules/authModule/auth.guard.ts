import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
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
    const token = request.headers.authorization
    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())


    if (token) {
      const user = this.authService.verifyToken(token)
      request.user = user
    }

    if (permission && token) {
      // this.authService.verifyToken(token)
    }
    return true
  }
}
