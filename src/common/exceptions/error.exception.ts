import {HttpException, HttpStatus} from '@nestjs/common'

/**
 * 自定义错误
 */
export class ErrorException extends HttpException {

  constructor(code?: number, message?: string | object | any) {
    super(
      {code, message},
      HttpStatus.BAD_REQUEST,
    )
  }

}

export enum param_err {code = 10001, message = '参数错误'}

export enum password_err {code = 10002, message = '密码错误'}

export enum captcha_expired {code = 10003, message = '验证码过期'}

export enum captcha_err {code = 10004, message = '验证码错误'}

export enum user_not_found {code = 10005, message = '用户不存在'}
