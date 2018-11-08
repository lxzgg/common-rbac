import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {MsInterceptor} from './common/interceptor/ms.interceptor'

// 客户端请求 ---> 中间件 ---> 守卫 ---> 拦截器之前 ---> 管道 ---> 控制器处理并响应 ---> 拦截器之后 ---> 过滤器
(async () => {

  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalInterceptors(new MsInterceptor())

  await app.listen(3000, '0.0.0.0')

})()
