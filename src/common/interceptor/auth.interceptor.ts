import {ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {JwtService} from '@nestjs/jwt'

/**
 * token即将过期处理
 */
@Injectable()
export class AuthInterceptor implements NestInterceptor {

  constructor(private readonly jwtService: JwtService) {
  }

  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> | Promise<Observable<any>> {
    return call$.pipe(map(data => {
      const payload = context.switchToHttp().getRequest().payload
      if (payload) {
        // 判断token离过期是否只剩指定时间
        const time = payload.exp - (Date.now() / 1000)
        // token过期时间剩余30分钟则生成新的token
        if (time < 1800) data.token = this.jwtService.sign({id: payload.id})
      }
      return data
    }))
  }
}
