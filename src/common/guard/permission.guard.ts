import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Observable} from 'rxjs'
import {PERMISSION_DEFINITION} from '../decorator/permission.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('守卫执行')

    const permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())
    console.log(permission)

    return true
  }
}
