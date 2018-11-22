import {HttpModule, Module} from '@nestjs/common'
import {WxService} from './wx.service'
import {WxController} from './wx.controller'

/**
 * 微信支付模块
 */
@Module({
  imports: [HttpModule],
  controllers: [WxController],
  providers: [WxService],
  exports: [WxService],
})
export class WxModule {
}
