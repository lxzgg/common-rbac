import {Body, Controller, Post, Req} from '@nestjs/common'
import {WxService} from './wx.service'
import {closeOrderVerify, getOrderVerify, payVerify, refundQueryVerify, refundVerify} from './wx.verify'
import {ErrorException, param_err} from '../../common/exceptions/error.exception'


@Controller('wx')
export class WxController {

  constructor(private readonly wxPayService: WxService) {
  }

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
  pay_notify(@Body() body) {
    console.log(body)
    return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
  }

}
