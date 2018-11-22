import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {AuthGuard} from '../common/guard/auth.guard'
import {success} from '../utils/result.util'
import {Permission} from '../common/decorator/permission.decorator'
import {addNameVerify, groupRolesVerify, idVerify, pageVerify, updateNameVerify} from '../verify/auth.verify'
import {ErrorException, param_err} from '../common/exceptions/error.exception'
import {Resource} from '../common/decorator/resource.decorator'
import {AuthGroupService} from '../service/auth.group.service'

@Controller('Group')
@UseGuards(AuthGuard)
@Resource({name: '组织管理', identify: 'manage:Group'})
export class AuthGroupController {

  constructor(private readonly groupService: AuthGroupService) {
  }

  // 查询所有组织
  @Post('getGroupAll')
  @Permission({name: '组织列表', identify: 'Group:getGroupAll'})
  async getGroupAll(@Body() body) {
    const {value, error} = pageVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (value.all) {
      return success(await this.groupService.getGroupAll())
    } else {
      const page = value.page
      const limit = value.limit
      const groups = await this.groupService.getGroupPage(page, limit)
      return success({list: groups[0], total: groups[1], page, limit})
    }
  }

  // 添加组织
  @Post('addGroup')
  @Permission({name: '添加组织', identify: 'Group:addGroup'})
  async addGroup(@Body() body) {
    const {value, error} = addNameVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.groupService.addGroup(value.name))
  }

  // 删除组织
  @Post('delGroup')
  @Permission({name: '删除组织', identify: 'Group:delGroup'})
  async delGroup(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const result = await this.groupService.delGroup(value.id)
    return success(Boolean(result))
  }

  // 修改组织
  @Post('updateGroup')
  @Permission({name: '修改组织', identify: 'Group:updateGroup'})
  async updateGroup(@Body() body) {
    const {value, error} = updateNameVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const result = await this.groupService.updateGroup(value.id, value.name)
    return success(Boolean(result.raw.affectedRows))
  }

  // 获取组织已有角色
  @Post('getGroupRoles')
  async getGroupRoles(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.groupService.getGroupRoles(value.id))
  }

  // 修改组织角色
  @Post('saveGroupRoles')
  @Permission({name: '修改角色', identify: 'Group:saveGroupRoles'})
  async saveGroupRoles(@Body() body) {
    const {value, error} = groupRolesVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.groupService.saveGroupRoles(value.group_id, value.roles))
  }

}
