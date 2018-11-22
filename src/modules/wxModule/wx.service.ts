import {HttpService, Injectable} from '@nestjs/common'
import {WxConfig} from './wx.config'
import {createDecipheriv, createHash} from 'crypto'
import {Builder, Parser} from 'xml2js'
import {stringify} from 'qs'
import {Agent} from 'https'
import {readFileSync} from 'fs'
import {ErrorException, param_err} from '../../common/exceptions/error.exception'
import {Result} from './wx.dto'

export const xmlParserConfig = {
  //不获取根节点
  explicitRoot: false,
  //true始终将子节点放入数组中; false则只有存在多个数组时才创建数组。
  explicitArray: false,
}

@Injectable()
export class WxService {

  constructor(private readonly httpService: HttpService) {
  }


  private readonly parser = new Parser(xmlParserConfig)
  private readonly builder = new Builder({
    //根节点名称
    rootName: 'xml',
  })
  // 统一下单
  private readonly UNIFIED_ORDER_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
  // 查询订单
  private readonly ORDER_QUERY_URL = 'https://api.mch.weixin.qq.com/pay/orderquery'
  // 关闭订单
  private readonly CLOSE_ORDER_URL = 'https://api.mch.weixin.qq.com/pay/closeorder'
  // 申请退款
  private readonly REFUND_URL = 'https://api.mch.weixin.qq.com/secapi/pay/refund'
  // 查询退款
  private readonly REFUND_QUERY_URL = 'https://api.mch.weixin.qq.com/pay/refundquery'

  /**
   * 获取openid、session_key
   */
  getOpenId(code) {
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WxConfig.appID}&secret=${WxConfig.appSecret}&js_code=${code}&grant_type=authorization_code`
    return this.httpService.post(url).toPromise().then(res => res.data)
  }

  /**
   * 解密手机号
   */
  decryptData(sessionKey, encryptedData, iv) {
    encryptedData = Buffer.from(encryptedData, 'base64')
    sessionKey = Buffer.from(sessionKey, 'base64')
    iv = Buffer.from(iv, 'base64')

    //创建aes-128-cbc解码对象
    let decipher = createDecipheriv('aes-128-cbc', sessionKey, iv)
    //encryptedData是Buffer则忽略inputEncoding参数
    let decoded = decipher.update(encryptedData, 'base64', 'utf8')
    decoded += decipher.final('utf8')

    return JSON.parse(decoded)
  }

  /**
   * 小程序,公众号支付
   */
  pay(params) {
    // 交易类型
    params.trade_type = 'JSAPI'

    return this.unifiedOrder(params).then((res: any) => {
      // 小程序支付所需参数
      const appletParams: any = {
        appId: res.appid,
        timeStamp: Date.now().toString(),
        nonceStr: res.nonce_str,
        package: `prepay_id=${res.prepay_id}`,
        signType: 'MD5',
      }
      // 加密参数
      appletParams.paySign = this.getSign(appletParams)
      return appletParams
    })
  }

  /**
   * H5支付
   */
  webPay(param, host) {
    // 交易类型
    param.trade_type = 'MWEB'
    param.scene_info = {h5_info: {type: 'Wap', wap_url: host, wap_name: WxConfig.wap_name}}
    return this.unifiedOrder(param).then(res => {
      console.log(res)
    })
  }

  /**
   * 查询订单
   */
  orderQuery(param) {
    let orderParam: Result = {
      // 小程序ID
      appid: WxConfig.appID,
      // 商户号
      mch_id: WxConfig.mch_id,
      // 随机字符串
      nonce_str: this.randomString(),
      // 微信的订单号,优先使用
      transaction_id: param.transaction_id,
      // 商户订单号
      out_trade_no: param.out_trade_no,
    }
    return this.requestURL(this.ORDER_QUERY_URL, orderParam)
  }

  /**
   * 关闭订单
   */
  closeOrder(param) {
    let orderParam: Result = {
      // 小程序ID
      appid: WxConfig.appID,
      // 商户号
      mch_id: WxConfig.mch_id,
      // 随机字符串
      nonce_str: this.randomString(),
      // 商户订单号
      out_trade_no: param.out_trade_no,
    }
    return this.requestURL(this.CLOSE_ORDER_URL, orderParam)
  }

  /**
   * 查询退款
   */
  refundQuery(param) {
    let orderParam: Result = {
      // 小程序ID
      appid: WxConfig.appID,
      // 商户号
      mch_id: WxConfig.mch_id,
      // 随机字符串
      nonce_str: this.randomString(),
      // 微信的订单号,优先使用
      transaction_id: param.transaction_id,
      // 商户订单号
      out_trade_no: param.out_trade_no,
      // 商户退款单号
      out_refund_no: param.out_refund_no,
      // 微信退款单号
      refund_id: param.refund_id,
      // 偏移量
      offset: param.offset,
    }
    return this.requestURL(this.REFUND_QUERY_URL, orderParam)
  }

  /**
   * 申请退款
   */
  refund(param) {
    let orderParam: Result = {
      // 小程序ID
      appid: WxConfig.appID,
      // 商户号
      mch_id: WxConfig.mch_id,
      // 随机字符串
      nonce_str: this.randomString(),
      // 微信的订单号,优先使用
      transaction_id: param.transaction_id,
      // 商户订单号
      out_trade_no: param.out_trade_no,
      // 商户退款单号
      out_refund_no: param.out_refund_no,
      // 订单金额
      total_fee: parseInt(String(param.total_fee * 100)),
      // 退款金额
      refund_fee: parseInt(String(param.refund_fee * 100)),
      // 退款原因
      refund_desc: param.refund_desc,
      // 退款结果通知url
      notify_url: param.notify_url,
    }
    const agent = new Agent({pfx: readFileSync('')})
    return this.requestURL(this.REFUND_URL, orderParam, agent)
  }

  /**
   * 统一下单
   */
  private unifiedOrder(params) {
    // 提交一次订单后取消不支付,那么订单号,价格,body不能修改,不一致会导致prepay_id获取不到
    let orderParam: Result = {
      // 小程序ID
      appid: WxConfig.appID,
      // 商户号
      mch_id: WxConfig.mch_id,
      // 随机字符串
      nonce_str: this.randomString(),
      // 商品描述
      body: params.body || WxConfig.body,
      // 订单号
      out_trade_no: params.order_sn,
      // 订单金额
      total_fee: 1 || parseInt(String(params.total_fee * 100)),
      // 终端IP
      spbill_create_ip: params.ip,
      // 通知地址
      notify_url: WxConfig.notify_url,
      // 交易类型
      trade_type: params.trade_type,
      // 用户标识
      openid: params.openid,
    }
    return this.requestURL(this.UNIFIED_ORDER_URL, orderParam)
  }

  /**
   * 通用请求
   * @param url 请求接口
   * @param orderParam 请求参数
   * @param agent pfx证书
   */
  private async requestURL(url, orderParam, agent?: Agent) {
    // 参数签名
    orderParam.sign = this.getSign(orderParam)
    // 生成xml
    const xml = this.builder.buildObject(orderParam)
    // 请求微信接口
    const result = await this.httpService.post(url, xml, {httpsAgent: agent}).toPromise()
    return new Promise(resolve => {
      // 解析微信返回的xml
      this.parser.parseString(result.data, (err, res: any) => {
        if (err) throw new ErrorException(param_err, 'xml解析失败')
        // 判断请求是否成功
        if (res.result_code !== 'SUCCESS') throw new ErrorException(param_err, res.err_code_des || res.return_msg)
        // 获取返回签名
        const sign = res.sign
        // 返回参数签名时过滤sign参数
        res.sign = undefined
        // 返回参数签名并比对
        if (this.getSign(res) !== sign) throw new ErrorException(param_err, '签名不一致')
        resolve(res)
      })
    })
  }

  /**
   * 参数签名
   * @param orderParam 统一下单参数
   */
  getSign(orderParam) {
    const signParam = {}
    for (const key of Object.keys(orderParam).sort()) {
      // 过滤空值,不参与签名
      if (orderParam[key]) signParam[key] = orderParam[key]
    }
    const signParamString = decodeURIComponent(stringify(signParam) + `&key=${WxConfig.mch_key}`)
    return createHash('md5').update(signParamString, 'utf8').digest('hex').toUpperCase()
  }

  /**
   * 生成随机字符串
   * @param stringLength 返回的字符串长度,默认32
   */
  randomString(stringLength = 32) {
    const encodeChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const charsLength = encodeChars.length
    let randomString = ''
    for (let i = 0; i < stringLength; i++) {
      randomString += encodeChars.charAt(Math.floor(Math.random() * charsLength))
    }
    return randomString
  }

  /**
   * 生成随机数字
   * @param stringLength 返回的字符串长度,默认32
   */
  randomNumber(stringLength = 32) {
    const encodeChars = '0123456789'
    const charsLength = encodeChars.length
    let randomString = ''
    for (let i = 0; i < stringLength; i++) {
      randomString += encodeChars.charAt(Math.floor(Math.random() * charsLength))
    }
    return randomString
  }

}
