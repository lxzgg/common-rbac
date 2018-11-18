import {Injectable} from '@nestjs/common'
import {Organization} from '../entity/auth_organization.entity'
import {CommonService} from './common.service'

@Injectable()
export class OrganizationService {

  constructor(private readonly commonService: CommonService) {
  }

  // 查询所有组织
  getOrganizationAll(page, limit) {
    return Organization.findAndCount({
      select: ['id', 'name', 'createdAt', 'updatedAt'],
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  // 添加组织
  addOrganization(name) {
    const organization = new Organization()
    organization.name = name
    return organization.save()
  }

  // 删除组织
  async delOrganization(id) {
    const result = await Organization.delete(id)
    const rows = result.raw.affectedRows
    if (rows) this.commonService.clear_redis_permissions()
    return rows
  }

  // 修改组织
  updateOrganization(id, name) {
    return Organization.update({id}, {name})
  }

}
