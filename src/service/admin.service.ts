import {Injectable} from '@nestjs/common'
import {Connection} from 'typeorm'
import {Menu} from '../entity/auth_menu.entity'
import {Resource} from '../entity/auth_resource.entity'
import {Role} from '../entity/auth_role.entity'
import {RolePermission} from '../entity/auth_role_permission.entity'

@Injectable()
export class AdminService {

  constructor(private readonly connection: Connection) {
  }

  // 查询所有用户
  getMenu() {
    return this.connection.getRepository(Menu).find({where: {parent_id: 1}, relations: ['menus', 'menus.menus']})
  }

  // 查询所有权限
  getAccess() {
    return this.connection.getRepository(Resource).find({relations: ['permission']})
  }

  // 添加角色
  addRole(name) {
    return this.connection.getRepository(Role).save({name})
  }

  // 修改角色
  updateRole(id, name) {
    return this.connection.getRepository(Role).save({id, name})
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
  async roleAddAccess(role_id, permissions) {
    const arr = []
    for (let i = 0; i < permissions.length; i++) {
      const rolePermission = new RolePermission()
      rolePermission.role_id = role_id
      rolePermission.permission_id = permissions[i]
      arr.push(rolePermission)
    }

    return await this.connection.transaction(async entityManager => {
      await entityManager.createQueryBuilder().delete().from(RolePermission).where({role_id}).execute()
      if (arr.length > 0) {
        await entityManager.createQueryBuilder().insert().into(RolePermission).values(arr).execute()
      }
    })
  }

}
