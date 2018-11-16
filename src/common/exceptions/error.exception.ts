import {HttpException, HttpStatus} from '@nestjs/common'

/**
 * 自定义错误
 */
export class ErrorException extends HttpException {

  constructor(result: Result, message?: string | object) {
    super(
      {code: result.code || -1, message: message || result.message || '未知错误'},
      result.status || HttpStatus.BAD_REQUEST,
    )
  }

}

interface Result {
  code,
  message,
  status
}

// 参数
export const param_err: Result = {code: 10001, message: '参数错误', status: HttpStatus.BAD_REQUEST}

export const captcha_expired: Result = {code: 10002, message: '验证码过期', status: HttpStatus.BAD_REQUEST}

export const captcha_err: Result = {code: 10003, message: '验证码错误', status: HttpStatus.BAD_REQUEST}

// 用户
export const password_err: Result = {code: 20001, message: '密码错误', status: HttpStatus.BAD_REQUEST}

export const user_not_found: Result = {code: 20002, message: '用户不存在', status: HttpStatus.BAD_REQUEST}

export const user_locked: Result = {code: 20003, message: '用户已锁定', status: HttpStatus.UNAUTHORIZED}

export const token_is_empty: Result = {code: 20004, message: 'token是空的', status: HttpStatus.UNAUTHORIZED}

export const token_has_expired: Result = {code: 20005, message: 'token已过期', status: HttpStatus.UNAUTHORIZED}

export const permission_denied: Result = {code: 20006, message: '权限不足', status: HttpStatus.FORBIDDEN}
