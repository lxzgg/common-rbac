import {Injectable} from '@nestjs/common'
import {Admin} from '../entity/auth.admin.entity'
import {ErrorException, user_already_exists} from '../common/exceptions/error.exception'
import {hashSync} from 'bcryptjs'
import {AdminGroup} from '../entity/auth.admin_group.entity'
import {AdminRole} from '../entity/auth.admin_role.entity'
import {Connection} from 'typeorm'
import {CommonService} from './common.service'

@Injectable()
export class AuthAdminService {

  constructor(private readonly connection: Connection,
              private readonly commonService: CommonService) {
  }

  // 分页查询管理员
  getAdminPage(page, limit) {
    return Admin.findAndCount({
      select: ['id', 'name', 'username', 'status', 'createdAt', 'updatedAt'],
      skip: (page - 1) * limit,
      take: limit,
      cache: 60000,
    })
  }

  // 创建管理员
  async addAdmin(data) {
    const exist = await Admin.findOne({where: {username: data.username}})
    if (exist) throw new ErrorException(user_already_exists)

    const admin = new Admin()
    admin.name = data.name
    admin.username = data.username
    admin.password = hashSync(data.password)
    const adminInfo = await admin.save()
    adminInfo.password = undefined
    return adminInfo
  }

  // 封号/解封
  async adminStatus(id, status) {
    const result = await Admin.update(id, {status})
    return result.raw.affectedRows
  }

  // 删除管理员
  delAdmin(id) {
    return Admin.delete(id)
  }

  // 修改管理员
  async updateAdmin(data) {
    const admin = new Admin()
    admin.id = data.id
    admin.name = data.name
    admin.username = data.username
    admin.password = hashSync(data.password)
    const adminInfo = await admin.save()
    adminInfo.password = undefined
    return adminInfo
  }

  // 获取管理员组织
  getAdminGroups(id) {
    return AdminGroup.find({where: {admin_id: id}, select: ['group_id']})
  }

  // 修改管理员组织
  saveAdminGroups(admin_id, groups) {
    const arr = []
    for (let i = 0; i < groups.length; i++) {
      const adminGroup = new AdminGroup()
      adminGroup.admin_id = admin_id
      adminGroup.group_id = groups[i]
      arr.push(adminGroup)
    }

    return this.connection.transaction(async entityManager => {
      await entityManager.getRepository(AdminGroup).delete({admin_id})
      if (arr.length > 0) {
        await entityManager.createQueryBuilder().insert().into(AdminGroup).values(arr).updateEntity(false).execute()
      }
      this.commonService.clear_redis_admin_permissions(admin_id)
    })
  }

  // 获取管理员角色
  getAdminRoles(id) {
    return AdminRole.find({where: {admin_id: id}, select: ['role_id']})
  }

  // 修改管理员角色
  saveAdminRoles(admin_id, roles) {
    const arr = []
    for (let i = 0; i < roles.length; i++) {
      const adminRole = new AdminRole()
      adminRole.admin_id = admin_id
      adminRole.role_id = roles[i]
      arr.push(adminRole)
    }

    return this.connection.transaction(async entityManager => {
      await entityManager.getRepository(AdminRole).delete({admin_id})
      if (arr.length > 0) {
        await entityManager.createQueryBuilder().insert().into(AdminRole).values(arr).updateEntity(false).execute()
      }
      this.commonService.clear_redis_admin_permissions(admin_id)
    })
  }

}
