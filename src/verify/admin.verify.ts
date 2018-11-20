import {array, boolean, number, string} from 'joi'
import {verify} from './common.verify'

// 通用ID
export const idVerify = verify.keys({
  id: number().required(),
})

// 通用分页
export const pageVerify = verify.keys({
  page: number().default(1),
  limit: number().default(10),
  all: boolean().default(false),
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

// 添加
export const addNameVerify = verify.keys({
  name: string().max(50).required(),
})

// 修改
export const updateNameVerify = verify.keys({
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
  sort: array().items({id: number(), order: number(), icon: string().allow('')}).required(),
})

// 组织角色
export const groupRolesVerify = verify.keys({
  group_id: number().required(),
  roles: array().items(number()).required(),
})

// 管理员组织
export const adminGroups = verify.keys({
  admin_id: number().required(),
  groups: array().items(number()).required(),
})

// 管理员角色
export const adminRoles = verify.keys({
  admin_id: number().required(),
  roles: array().items(number()).required(),
})

// 创建管理员
export const adminVerify = verify.keys({
  id: number(),
  name: string().max(50).required(),
  username: string().max(50).required(),
  password: string().max(50).required(),
})

// 创建管理员
export const adminStatusVerify = verify.keys({
  id: number().required(),
  status: boolean().required(),
})
