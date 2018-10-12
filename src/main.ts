import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {MsInterceptor} from './common/interceptor/ms.interceptor'

(async () => {

  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalInterceptors(new MsInterceptor())

  await app.listen(3000, '0.0.0.0')

})()
