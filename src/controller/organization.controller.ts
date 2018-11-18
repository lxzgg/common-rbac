import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {AuthGuard} from '../common/guard/auth.guard'
import {OrganizationService} from '../service/organization.service'
import {success} from '../utils/result.util'
import {Permission} from '../common/decorator/permission.decorator'
import {addNameVerify, idVerify, pageVerify, updateNameVerify} from '../verify/admin.verify'
import {ErrorException, param_err} from '../common/exceptions/error.exception'
import {Resource} from '../common/decorator/resource.decorator'

@Controller('organization')
@UseGuards(AuthGuard)
@Resource({name: '组织管理', identify: 'organization:manage'})
export class OrganizationController {

  constructor(private readonly organizationService: OrganizationService) {
  }

  // 查询所有组织
  @Post('getOrganizationAll')
  @Permission({name: '组织列表', identify: 'organization:getOrganizationAll'})
  async getOrganizationAll(@Body() body) {
    const {value, error} = pageVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const page = value.page
    const limit = value.limit
    const organizations = await this.organizationService.getOrganizationAll(page, limit)
    return success({list: organizations[0], total: organizations[1], page, limit})
  }

  // 添加组织
  @Post('addOrganization')
  @Permission({name: '添加组织', identify: 'organization:addOrganization'})
  async addOrganization(@Body() body) {
    const {value, error} = addNameVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.organizationService.addOrganization(value.name))
  }

  // 删除组织
  @Post('delOrganization')
  @Permission({name: '删除组织', identify: 'organization:delOrganization'})
  async delOrganization(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const result = await this.organizationService.delOrganization(value.id)
    return success(Boolean(result))
  }

  // 修改组织
  @Post('updateOrganization')
  @Permission({name: '修改组织', identify: 'organization:updateOrganization'})
  async updateOrganization(@Body() body) {
    const {value, error} = updateNameVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const result = await this.organizationService.updateOrganization(value.id, value.name)
    return success(Boolean(result.raw.affectedRows))
  }

}
