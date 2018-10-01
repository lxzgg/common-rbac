import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {FileUtil} from './utils/file.util'
import {MsInterceptor} from './common/interceptor/ms.interceptor'
import {PermissionGuard} from './common/guard/permission.guard'

(async () => {

  const app = await NestFactory.create(AppModule)

  // 全局拦截器
  app.useGlobalInterceptors(new MsInterceptor())
  // 全局守卫
  app.useGlobalGuards(new PermissionGuard())

  await app.listen(3000).then(() => {
    // 启动生成临时目录
    FileUtil.mkdirSync('temp')
  })

})()
