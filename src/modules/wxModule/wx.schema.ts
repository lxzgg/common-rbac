import {number, object, string} from 'joi'

/**
 * abortEarly 停止对第一个错误的验证，否则返回找到的所有错误。默认为true
 * allowUnknown 允许对象包含被忽略的未知键。默认为false。
 */
const schema = object().options({abortEarly: false, allowUnknown: true})

// 微信支付
export const paySchema = schema.keys({
  order_sn: string().max(32).required(),
  total_fee: number().min(0.01).required(),
})

// 关闭订单
export const closeOrderSchema = schema.keys({
  out_trade_no: string().max(32).required(),
})

// 查询订单
export const getOrderSchema = schema.keys({
  transaction_id: string().max(32).empty(''),
  out_trade_no: string().max(32).empty(''),
}).or('transaction_id', 'out_trade_no')

// 申请退款
export const refundSchema = schema.keys({
  transaction_id: string().max(32).empty(''),
  out_trade_no: string().max(32).empty(''),
  out_refund_no: string().max(64).required(),
  total_fee: number().min(0.01).required(),
  refund_fee: number().min(0.01).required(),
  refund_desc: string().max(80).empty(''),
}).or('transaction_id', 'out_trade_no')

// 申请退款
export const refundQuerySchema = schema.keys({
  transaction_id: string().max(32).empty(''),
  out_trade_no: string().max(32).empty(''),
  out_refund_no: string().max(64).empty(''),
  refund_id: string().max(32).empty(''),
  offset: number().integer().empty(''),
}).or('transaction_id', 'out_trade_no', 'out_refund_no', 'refund_id')
