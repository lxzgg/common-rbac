import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'

// 客户端请求 ---> 中间件开始 --->  守卫  --->  中间件结束 ---> 拦截器之前 ---> 管道 ---> 控制器处理并响应 ---> 拦截器之后 ---> 异常过滤器
(async () => {

  const app = await NestFactory.create(AppModule)
  app.enableCors()

  await app.listen(3000, '0.0.0.0')

})()
