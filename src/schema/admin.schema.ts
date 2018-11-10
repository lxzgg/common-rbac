import {array, number, string} from 'joi'
import {schema} from './common.schema'

export const idSchema = schema.keys({
  id: number().required(),
})

// 查询角色所有菜单
export const roleMenuSchema = schema.keys({
  id: number().required(),
})

export const roleIdSchema = schema.keys({
  role_id: number().required(),
})

// 添加角色
export const addRoleSchema = schema.keys({
  name: string().required(),
})

// 修改角色
export const updateRoleSchema = schema.keys({
  id: number().required(),
  name: string().required(),
})

// 查询角色分页
export const rolePageSchema = schema.keys({
  page: number().default(1),
  limit: number().default(15),
})

// 查询角色已有权限
export const roleAddAccessSchema = schema.keys({
  role_id: number().required(),
  permission: array().items(number()).required(),
})

// 角色添加菜单
export const roleAddMenuSchema = schema.keys({
  role_id: number().required(),
  menus: array().items(number()).required(),
})
