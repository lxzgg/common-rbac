import {ExecutionContext, NestInterceptor} from '@nestjs/common'
import {Observable} from 'rxjs'
import {tap} from 'rxjs/operators'

// 响应时间拦截器
export class MsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> | Promise<Observable<any>> {
    const start = Date.now()
    return call$.pipe(tap(() => {
      const response = context.switchToHttp().getResponse()
      const ms = Date.now() - start
      response.set('X-Response-Time', `${ms}ms`)
    }))
  }
}
