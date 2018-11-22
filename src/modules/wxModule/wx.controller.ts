import {Body, Controller, Header, HttpCode, Post, Req} from '@nestjs/common'
import {WxService} from './wx.service'
import {closeOrderVerify, getOrderVerify, payVerify, refundQueryVerify, refundVerify} from './wx.verify'
import {ErrorException, param_err} from '../../common/exceptions/error.exception'
import {Result} from './wx.dto'

@Controller('wx')
export class WxController {

  constructor(private readonly wxPayService: WxService) {
  }

  private readonly SUCCESS = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
  private readonly FAIL = '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>'

  // 小程序,公众号支付
  @Post('pay')
  pay(@Body() body) {
    const {value, error} = payVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return this.wxPayService.pay(value)
  }

  // H5支付
  @Post('webPay')
  webPay(@Body() body, @Req() request) {
    const {value, error} = payVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return this.wxPayService.webPay(value, request.hostname)
  }

  // 查询订单
  @Post('orderQuery')
  orderQuery(@Body() body) {
    const {value, error} = getOrderVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return this.wxPayService.orderQuery(value)
  }

  // 关闭订单
  @Post('closeOrder')
  closeOrder(@Body() body) {
    const {value, error} = closeOrderVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return this.wxPayService.closeOrder(value)
  }

  // 申请退款
  @Post('refund')
  refund(@Body() body) {
    const {value, error} = refundVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return this.wxPayService.refund(value)
  }

  // 退款查询
  @Post('refundQuery')
  refundQuery(@Body() body) {
    const {value, error} = refundQueryVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return this.wxPayService.refundQuery(value)
  }

  // 支付成功回调
  @Post('pay_notify')
  @HttpCode(200)
  @Header('Content-Type', 'text/xml')
  async pay_notify(@Req() req, @Body() body: Result) {
    if (body.result_code !== 'SUCCESS') return this.FAIL
    const sign = body.sign
    // 参数签名时过滤sign参数
    body.sign = undefined
    if (this.wxPayService.getSign(body) !== sign) return this.FAIL

    // 支付成功逻辑处理
    // .....
    // .....

    return this.SUCCESS
  }

}
