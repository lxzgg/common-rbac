import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {AuthGuard} from '../common/guard/auth.guard'
import {Resource} from '../common/decorator/resource.decorator'
import {Permission} from '../common/decorator/permission.decorator'
import {
  addNameVerify,
  idVerify,
  pageVerify,
  roleAddAccessVerify,
  roleAddMenuVerify,
  roleIdVerify,
  updateNameVerify,
} from '../verify/admin.verify'
import {ErrorException, param_err} from '../common/exceptions/error.exception'
import {success} from '../utils/result.util'
import {RoleService} from '../service/role.service'

@Controller('role')
@UseGuards(AuthGuard)
@Resource({name: '角色管理', identify: 'role:manage'})
export class RoleController {

  constructor(private readonly roleService: RoleService) {
  }

  // 查询所有权限
  @Post('getAccessAll')
  @Permission({name: '权限列表', identify: 'access:getAccessAll'})
  async getAccessAll() {
    return success(await this.roleService.getAccessAll())
  }

  // 查询角色
  @Post('getRoleAll')
  @Permission({name: '角色列表', identify: 'role:getRoleAll'})
  async getRoleAll(@Body() body) {
    const {value, error} = pageVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const page = value.page
    const limit = value.limit
    const roles = await this.roleService.getRoleAll(page, limit)
    return success({list: roles[0], total: roles[1], page, limit})
  }

  // 添加角色
  @Post('addRole')
  @Permission({name: '添加角色', identify: 'role:addRole'})
  async addRole(@Body() body) {
    const {value, error} = addNameVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.roleService.addRole(value.name))
  }

  // 删除角色
  @Post('delRole')
  @Permission({name: '删除角色', identify: 'role:delRole'})
  async delRole(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const result = await this.roleService.delRole(value.id)
    return success(Boolean(result))
  }

  // 修改角色
  @Post('updateRole')
  @Permission({name: '修改角色', identify: 'role:updateRole'})
  async updateRole(@Body() body) {
    const {value, error} = updateNameVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const result = await this.roleService.updateRole(value.id, value.name)
    return success(Boolean(result.raw.affectedRows))
  }

  // 查询角色已有权限
  @Post('getRoleAccess')
  async getRoleAccess(@Body() body) {
    const {value, error} = roleIdVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.roleService.getRoleAccess(value.role_id))
  }

  // 修改角色权限
  @Post('roleAddAccess')
  @Permission({name: '修改角色权限', identify: 'role:roleAddAccess'})
  async roleAddAccess(@Body() body) {
    const {value, error} = roleAddAccessVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)

    const role_id = value.role_id
    const permissions = value.permissions

    return success(await this.roleService.roleAddAccess(role_id, permissions))
  }

  // 查询角色已有菜单ID
  @Post('getRoleMenuKeys')
  async getRoleMenuKeys(@Body() body) {
    const {value, error} = roleIdVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.roleService.getRoleMenuKeys(value.role_id))
  }

  // 修改角色菜单
  @Post('roleAddMenu')
  @Permission({name: '修改角色菜单', identify: 'role:roleAddMenu'})
  async roleAddMenu(@Body() body) {
    const {value, error} = roleAddMenuVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)

    const role_id = value.role_id
    const menus = value.menus

    return success(await this.roleService.roleAddMenu(role_id, menus))
  }

}
