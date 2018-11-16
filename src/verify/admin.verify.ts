import {array, number, string} from 'joi'
import {verify} from './common.verify'


// 通用ID
export const idVerify = verify.keys({
  id: number().required(),
})

// 通用分页
export const pageVerify = verify.keys({
  page: number().default(1),
  limit: number().default(10),
})

// 通用角色ID
export const roleIdVerify = verify.keys({
  role_id: number().required(),
})

// 登录
export const loginVerify = verify.keys({
  username: string().required(),
  password: string().required(),
  captcha: string().required(),
  key: string().required(),
})

// 验证码
export const keyVerify = verify.keys({
  key: string().length(38).allow(''),
})

// 添加角色
export const addRoleVerify = verify.keys({
  name: string().max(50).required(),
})

// 修改角色
export const updateRoleVerify = verify.keys({
  id: number().required(),
  name: string().max(50).required(),
})

// 角色添加权限
export const roleAddAccessVerify = verify.keys({
  role_id: number().required(),
  permissions: array().items(number()).required(),
})

// 角色添加菜单
export const roleAddMenuVerify = verify.keys({
  role_id: number().required(),
  menus: array().items(number()).required(),
})

// 菜单管理
export const menuSortVerify = verify.keys({
  sort: array().items({id: number(), order: number(), icon: string()}).required(),
})
