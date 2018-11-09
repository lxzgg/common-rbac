import {Body, Controller, Post} from '@nestjs/common'
import {Resource} from '../common/decorator/resource.decorator'
import {AdminService} from '../service/admin.service'
import {success} from '../utils/result.util'
import {ErrorException, param_err} from '../common/exceptions/error.exception'
import {addRoleSchema, roleAddAccessSchema, rolePageSchema, updateRoleSchema} from '../schema/admin.schema'
import {roleIdSchema} from '../schema/common.schema'

@Controller('admin')
@Resource({name: '管理员操作', identify: 'admin:manage'})
export class AdminController {

  constructor(private readonly adminService: AdminService) {
  }

  // 查询所有用户
  @Post('getMenu')
  async getMenu() {
    return success(await this.adminService.getMenu())
  }

  // 查询所有权限
  @Post('getAccess')
  // @Permission({name: '查询角色', identify: 'access:get'})
  async getAccess() {
    return success(await this.adminService.getAccess())
  }

  // 查询所有角色
  @Post('getRole')
  // @Permission({name: '查询角色', identify: 'role:get'})
  async getRole(@Body() body) {
    const {value, error} = rolePageSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    const page = value.page
    const limit = value.limit
    const roles = await this.adminService.getRole(page, limit)
    return success({list: roles[0], total: roles[1], page, limit})
  }

  // 添加角色
  @Post('addRole')
  async addRole(@Body() body) {
    const {value, error} = addRoleSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    return success(await this.adminService.addRole(value.name))
  }

  // 修改角色
  @Post('updateRole')
  async updateRole(@Body() body) {
    const {value, error} = updateRoleSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    return success(await this.adminService.updateRole(value.id, value.name))
  }

  // 查询角色已有权限
  @Post('getRoleAccess')
  // @Permission({name: '查询权限', identify: 'roleAccess:get'})
  async getRoleAccess(@Body() body) {
    const {value, error} = roleIdSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    return success(await this.adminService.getRoleAccess(value.role_id))
  }

  // 角色更新权限
  @Post('roleAddAccess')
  // @Permission({name: '查询权限', identify: 'roleAccess:get'})
  async roleAddAccess(@Body() body) {
    const {value, error} = roleAddAccessSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)

    const role_id = value.role_id
    const permissions = value.permission

    await this.adminService.roleAddAccess(role_id, permissions)

    return success()
  }

}
