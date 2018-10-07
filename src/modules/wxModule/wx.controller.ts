import {BadRequestException, Body, Controller, Post, Req} from '@nestjs/common'
import {WxService} from './wx.service'
import {closeOrderSchema, getOrderSchema, paySchema, refundQuerySchema, refundSchema} from './wx.schema'

@Controller('wx')
export class WxController {

  constructor(private readonly wxPayService: WxService) {
  }

  // 小程序,公众号支付
  @Post('pay')
  pay(@Body() body) {
    const {value, error} = paySchema.validate(body)
    if (error) throw new BadRequestException(error.details[0].message)
    return this.wxPayService.pay(value)
  }

  // H5支付
  @Post('webPay')
  webPay(@Body() body, @Req() request) {
    const {value, error} = paySchema.validate(body)
    if (error) throw new BadRequestException(error.details[0].message)
    return this.wxPayService.webPay(value, request.hostname)
  }

  // 查询订单
  @Post('orderQuery')
  orderQuery(@Body() body) {
    const {value, error} = getOrderSchema.validate(body)
    if (error) throw new BadRequestException(error.details[0].message)
    return this.wxPayService.orderQuery(value)
  }

  // 关闭订单
  @Post('closeOrder')
  closeOrder(@Body() body) {
    const {value, error} = closeOrderSchema.validate(body)
    if (error) throw new BadRequestException(error.details[0].message)
    return this.wxPayService.closeOrder(value)
  }

  // 申请退款
  @Post('refund')
  refund(@Body() body) {
    const {value, error} = refundSchema.validate(body)
    if (error) throw new BadRequestException(error.details[0].message)
    return this.wxPayService.refund(value)
  }

  // 退款查询
  @Post('refundQuery')
  refundQuery(@Body() body) {
    const {value, error} = refundQuerySchema.validate(body)
    if (error) throw new BadRequestException(error.details[0].message)
    return this.wxPayService.refundQuery(value)
  }

  // 支付成功回调
  @Post('pay_notify')
  pay_notify(@Body() body) {
    console.log(body)
    return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
  }

}
