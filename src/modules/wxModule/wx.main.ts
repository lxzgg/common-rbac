import {NestFactory} from '@nestjs/core'
import {WxModule} from './wx.module'

(async () => {
  const app = await NestFactory.create(WxModule)
  await app.listen(3001)
})()
