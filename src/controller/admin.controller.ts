import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {Permission} from '../common/decorator/permission.decorator'
import {Resource} from '../common/decorator/resource.decorator'
import {AdminService} from '../service/admin.service'
import {adminGroups, adminRoles, adminStatusVerify, adminVerify, idVerify, pageVerify} from '../verify/admin.verify'
import {access_denied, ErrorException, param_err} from '../common/exceptions/error.exception'
import {success} from '../utils/result.util'
import {AuthGuard} from '../common/guard/auth.guard'

@Controller('admin')
@UseGuards(AuthGuard)
@Resource({name: '管理员管理', identify: 'manage:admin'})
export class AdminController {

  constructor(private readonly adminService: AdminService) {
  }

  // 查询管理员
  @Post('getAdmins')
  @Permission({name: '查询管理', identify: 'admin:getAdmins'})
  async getAdmins(@Body() body) {
    const {value, error} = pageVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const page = value.page
    const limit = value.limit
    const groups = await this.adminService.getAdminPage(page, limit)
    return success({list: groups[0], total: groups[1], page, limit})
  }

  // 封号/解封
  @Post('adminStatus')
  @Permission({name: '封号/解封', identify: 'admin:adminStatus'})
  async adminStatus(@Body() body) {
    const {value, error} = adminStatusVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (value.id === 1) throw new ErrorException(access_denied)
    const result = await this.adminService.adminStatus(value.id, value.status)
    return success(Boolean(result))
  }

  // 创建管理员
  @Post('addAdmin')
  @Permission({name: '创建管理', identify: 'admin:addAdmin'})
  async addAdmin(@Body() body) {
    const {value, error} = adminVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.addAdmin(value))
  }

  // 删除管理员
  @Post('delAdmin')
  @Permission({name: '删除管理', identify: 'admin:delAdmin'})
  async delAdmin(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (value.id === 1) throw new ErrorException(access_denied)
    return success(await this.adminService.delAdmin(value.id))
  }

  // 修改管理员
  @Post('updateAdmin')
  @Permission({name: '修改管理', identify: 'admin:updateAdmin'})
  async updateAdmin(@Body() body) {
    const {value, error} = adminVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (!value.id || value.id === 1) throw new ErrorException(access_denied)
    return success(await this.adminService.updateAdmin(value))
  }

  // 获取管理员角色
  @Post('getAdminGroups')
  async getAdminGroups(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.getAdminGroups(value.id))
  }

  // 修改管理员组织
  @Post('saveAdminGroups')
  @Permission({name: '修改组织', identify: 'admin:saveAdminGroups'})
  async saveAdminGroups(@Body() body) {
    const {value, error} = adminGroups.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.saveAdminGroups(value.admin_id, value.groups))
  }

  // 获取管理员角色
  @Post('getAdminRoles')
  async getAdminRoles(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.getAdminRoles(value.id))
  }

  // 修改管理员角色
  @Post('saveAdminRoles')
  @Permission({name: '修改角色', identify: 'admin:saveAdminRoles'})
  async saveAdminRoles(@Body() body) {
    const {value, error} = adminRoles.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.saveAdminRoles(value.admin_id, value.roles))
  }

}
