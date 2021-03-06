import {Injectable} from '@nestjs/common'
import {CommonService} from './common.service'
import {Connection} from 'typeorm'
import {Group} from '../entity/auth.group.entity'
import {GroupRole} from '../entity/auth.group_role.entity'

@Injectable()
export class AuthGroupService {

  constructor(private readonly connection: Connection,
              private readonly commonService: CommonService) {
  }

  // 查询所有组织
  getGroupAll() {
    return Group.find({cache: 60000})
  }

  // 分页查询组织
  getGroupPage(page, limit) {
    return Group.findAndCount({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      skip: (page - 1) * limit,
      take: limit,
      cache: 60000,
    })
  }

  // 添加组织
  addGroup(name) {
    const group = new Group()
    group.name = name
    return group.save()
  }

  // 删除组织
  async delGroup(id) {
    const result = await Group.delete(id)
    const rows = result.raw.affectedRows
    if (rows) this.commonService.clear_redis_permissions()
    return rows
  }

  // 修改组织
  updateGroup(id, name) {
    return Group.update({id}, {name})
  }

  // 获取组织已有角色
  getGroupRoles(id) {
    return GroupRole.find({where: {group_id: id}, select: ['role_id']})
  }

  // 修改组织角色
  saveGroupRoles(group_id, roles) {
    const arr = []
    for (let i = 0; i < roles.length; i++) {
      const groupRole = new GroupRole()
      groupRole.group_id = group_id
      groupRole.role_id = roles[i]
      arr.push(groupRole)
    }

    return this.connection.transaction(async entityManager => {
      await entityManager.getRepository(GroupRole).delete({group_id})
      if (arr.length > 0) {
        await entityManager.createQueryBuilder().insert().into(GroupRole).values(arr).updateEntity(false).execute()
      }
      this.commonService.clear_redis_permissions()
      return true
    })
  }

}
