/**
 * 请求成功
 * @param data 结果
 */
export const success = (data?: any) => {
  return {code: 0, message: 'success', data}
}
