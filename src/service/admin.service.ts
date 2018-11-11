import {Injectable} from '@nestjs/common'
import {Connection} from 'typeorm'
import {Menu} from '../entity/auth_menu.entity'
import {Resource} from '../entity/auth_resource.entity'
import {Role} from '../entity/auth_role.entity'
import {RolePermission} from '../entity/auth_role_permission.entity'
import {RoleMenu} from '../entity/auth_role_menu.entity'

@Injectable()
export class AdminService {

  constructor(private readonly connection: Connection) {
  }

  // 查询所有用户
  getMenu() {
    return this.connection.getRepository(Menu).find({where: {parent_id: 1}, relations: ['menus', 'menus.menus']})
  }

  // 查询角色所有菜单
  async getRoleMenu(id) {
    const result = await this.connection.getRepository(Role).findOne({where: {id}, relations: ['menus']})

    const arr = result.menus

    const menus = []

    // 一级菜单
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].parent_id === 1) {
        arr[i]['menus'] = []

        // 二级菜单
        for (let j = 0; j < arr.length; j++) {
          if (arr[i].id === arr[j].parent_id) {
            arr[j]['menus'] = []

            // 三级菜单
            for (let k = 0; k < arr.length; k++) {
              if (arr[j].id === arr[k].parent_id) arr[j]['menus'].push(arr[k])
            }

            arr[i]['menus'].push(arr[j])
          }
        }

        menus.push(arr[i])
      }
    }

    return menus
  }

  getRoleMenuKeys(role_id) {
    return this.connection.getRepository(RoleMenu).find({where: {role_id}, select: ['menu_id']})
  }

  // 查询所有权限
  getAccess() {
    return this.connection.getRepository(Resource).find({relations: ['permissions']})
  }

  // 添加角色
  addRole(name) {
    return this.connection.getRepository(Role).save({name})
  }

  // 修改角色
  updateRole(id, name) {
    return this.connection.getRepository(Role).update({id}, {name})
  }

  // 删除角色
  delRole(id) {
    return this.connection.getRepository(Role).delete(id)
  }

  // 查询所有角色
  async getRole(page, limit) {
    return this.connection.getRepository(Role).findAndCount({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  // 查询角色已有权限
  async getRoleAccess(role_id) {
    const roles = await this.connection.getRepository(RolePermission).find({where: {role_id}})
    const arr = []
    for (let i = 0; i < roles.length; i++) {
      arr.push(roles[i].permission_id)
    }
    return arr
  }

  // 角色更新权限
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
        await entityManager.createQueryBuilder().insert().into(RolePermission).values(arr).execute()
      }
    })
  }

  // 角色添加菜单
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
        await entityManager.createQueryBuilder().insert().into(RoleMenu).values(arr).execute()
      }
    })
  }

}
