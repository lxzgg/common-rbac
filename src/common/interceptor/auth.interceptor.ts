import {ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {AuthService} from '../../service/auth.service'
import {AuthConfig} from '../../config/auth.config'

/**
 * token即将过期处理
 */
@Injectable()
export class AuthInterceptor implements NestInterceptor {

  constructor(private readonly authService: AuthService) {
  }

  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> | Promise<Observable<any>> {
    return call$.pipe(map(data => {
      const payload = context.switchToHttp().getRequest().payload

      if (payload) {
        // 判断token离过期是否只剩指定时间
        const time = payload.exp - (Date.now() / 1000)
        // 生成新的token
        if (time < AuthConfig.remainingTime) data.token = this.authService.createToken({id: payload.id})
      }

      return data
    }))

  }
}
