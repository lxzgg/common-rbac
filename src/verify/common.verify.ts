import {object} from 'joi'

/**
 * joi公共配置
 * abortEarly 停止对第一个错误的验证，否则返回找到的所有错误。默认为true
 * allowUnknown 允许对象包含被忽略的未知键。默认为false。
 */
export const verify = object().options({abortEarly: false, allowUnknown: true})
