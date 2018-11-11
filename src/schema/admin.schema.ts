import {array, number, string} from 'joi'
import {schema} from './common.schema'


// 通用ID
export const idSchema = schema.keys({
  id: number().required(),
})

// 通用分页
export const pageSchema = schema.keys({
  page: number().default(1),
  limit: number().default(10),
})

// 通用角色ID
export const roleIdSchema = schema.keys({
  role_id: number().required(),
})

// 登录
export const loginSchema = schema.keys({
  username: string().required(),
  password: string().required(),
})

// 添加角色
export const addRoleSchema = schema.keys({
  name: string().max(50).required(),
})

// 修改角色
export const updateRoleSchema = schema.keys({
  id: number().required(),
  name: string().max(50).required(),
})

// 角色添加权限
export const roleAddAccessSchema = schema.keys({
  role_id: number().required(),
  permissions: array().items(number()).required(),
})

// 角色添加菜单
export const roleAddMenuSchema = schema.keys({
  role_id: number().required(),
  menus: array().items(number()).required(),
})
