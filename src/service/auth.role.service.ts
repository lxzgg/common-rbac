import {Injectable} from '@nestjs/common'
import {Connection} from 'typeorm'
import {Resource} from '../entity/auth.resource.entity'
import {Role} from '../entity/auth.role.entity'
import {RolePermission} from '../entity/auth.role_permission.entity'
import {RoleMenu} from '../entity/auth.role_menu.entity'
import {CommonService} from './common.service'

@Injectable()
export class AuthRoleService {

  constructor(private readonly connection: Connection,
              private readonly commonService: CommonService) {
  }

  // 查询所有权限
  getAccessAll() {
    return Resource.find({relations: ['permissions'], cache: {id: 'getAccessAll', milliseconds: 60000}})
  }

  // 添加角色
  addRole(name) {
    const role = new Role()
    role.name = name
    return role.save()
  }

  // 删除角色
  async delRole(id) {
    const result = await Role.delete(id)
    const rows = result.raw.affectedRows
    if (rows) this.commonService.clear_redis_permissions()
    return rows
  }

  // 修改角色
  updateRole(id, name) {
    return Role.update({id}, {name})
  }

  // 查询所有角色
  async getRoleAll() {
    return Role.find({cache: {id: 'getRoleAll', milliseconds: 60000}})
  }

  // 分页查询角色
  async getRolePage(page, limit) {
    return Role.findAndCount({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      skip: (page - 1) * limit,
      take: limit,
      cache: 60000,
    })
  }

  // 查询角色已有权限
  async getRoleAccess(role_id) {
    const roles = await RolePermission.find({where: {role_id}, cache: 60000})
    const arr = []
    for (let i = 0; i < roles.length; i++) {
      arr.push(roles[i].permission_id)
    }
    return arr
  }

  // 修改角色权限
  roleAddAccess(role_id, permissions) {
    const arr = []
    for (let i = 0; i < permissions.length; i++) {
      const rolePermission = new RolePermission()
      rolePermission.role_id = role_id
      rolePermission.permission_id = permissions[i]
      arr.push(rolePermission)
    }

    return this.connection.transaction(async entityManager => {
      await entityManager.getRepository(RolePermission).delete({role_id})
      if (arr.length > 0) {
        await entityManager.createQueryBuilder().insert().into(RolePermission).values(arr).updateEntity(false).execute()
      }
      this.commonService.clear_redis_permissions()
    })
  }

  // 查询角色已有菜单ID
  getRoleMenuKeys(role_id) {
    return RoleMenu.find({where: {role_id}, select: ['menu_id'], cache: 60000})
  }

  // 修改角色菜单
  roleAddMenu(role_id, menus) {
    const arr = []
    for (let i = 0; i < menus.length; i++) {
      const roleMenu = new RoleMenu()
      roleMenu.role_id = role_id
      roleMenu.menu_id = menus[i]
      arr.push(roleMenu)
    }

    return this.connection.transaction(async entityManager => {
      await entityManager.getRepository(RoleMenu).delete({role_id})
      if (arr.length > 0) {
        await entityManager.createQueryBuilder().insert().into(RoleMenu).values(arr).updateEntity(false).execute()
      }
    })
  }

}
