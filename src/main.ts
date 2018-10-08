import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {FileUtil} from './utils/file.util'
import {MsInterceptor} from './common/interceptor/ms.interceptor'

(async () => {

  const app = await NestFactory.create(AppModule)

  // 全局拦截器
  app.useGlobalInterceptors(new MsInterceptor())

  await app.listen(3000, '0.0.0.0').then(() => {
    // 启动生成临时目录
    FileUtil.mkdirSync('temp')
  })

})()
