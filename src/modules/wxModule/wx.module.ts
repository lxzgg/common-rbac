import {HttpModule, Module} from '@nestjs/common'
import {WxController} from './wx.controller'
import {WxService} from './wx.service'

/**
 * 微信支付模块
 */
@Module({
  imports: [HttpModule],
  controllers: [WxController],
  providers: [WxService],
})
export class WxModule {
}
