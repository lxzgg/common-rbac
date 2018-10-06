import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Observable} from 'rxjs'
import {PERMISSION_DEFINITION} from '../decorator/permission.decorator'
import {Permission} from '../../entity/permission.entity'

@Injectable()
export class PermissionGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const permission: Permission = Reflect.getMetadata(PERMISSION_DEFINITION, context.getHandler())

    return true
  }
}
