import {HttpModule, Module} from '@nestjs/common'
import {WxController} from './controller/wx.controller'
import {WxService} from './service/wx.service'

@Module({
  imports: [HttpModule],
  controllers: [WxController],
  providers: [WxService],
})
export class WxModule {
}
