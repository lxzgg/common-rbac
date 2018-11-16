import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {Resource} from '../common/decorator/resource.decorator'
import {AdminService} from '../service/admin.service'
import {success} from '../utils/result.util'
import {
  addRoleVerify,
  idVerify,
  menuSortVerify,
  pageVerify,
  roleAddAccessVerify,
  roleAddMenuVerify,
  roleIdVerify,
  updateRoleVerify,
} from '../verify/admin.verify'
import {Permission} from '../common/decorator/permission.decorator'
import {AuthGuard} from '../common/guard/auth.guard'
import {ErrorException, param_err} from '../common/exceptions/error.exception'

@Controller('admin')
@UseGuards(AuthGuard)
@Resource({name: '管理员操作', identify: 'admin:manage'})
export class AdminController {

  constructor(private readonly adminService: AdminService) {
  }

  // 查询所有菜单
  @Post('getMenuAll')
  @Permission({name: '查询所有菜单', identify: 'admin:getMenuAll'})
  async getMenuAll() {
    return success(await this.adminService.getMenuAll())
  }

  // 查询角色已有菜单ID
  @Post('getRoleMenuKeys')
  @Permission({name: '查询角色已有菜单ID', identify: 'admin:getRoleMenuKeys'})
  async getRoleMenuKeys(@Body() body) {
    const {value, error} = roleIdVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.getRoleMenuKeys(value.role_id))
  }

  // 查询所有权限
  @Post('getAccess')
  @Permission({name: '查询所有权限', identify: 'admin:getAccess'})
  async getAccess() {
    return success(await this.adminService.getAccess())
  }

  // 查询所有角色
  @Post('getRole')
  @Permission({name: '查询所有角色', identify: 'admin:getRole'})
  async getRole(@Body() body) {
    const {value, error} = pageVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    const page = value.page
    const limit = value.limit
    const roles = await this.adminService.getRole(page, limit)
    return success({list: roles[0], total: roles[1], page, limit})
  }

  // 添加角色
  @Post('addRole')
  @Permission({name: '添加角色', identify: 'admin:addRole'})
  async addRole(@Body() body) {
    const {value, error} = addRoleVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.addRole(value.name))
  }

  // 修改角色
  @Post('updateRole')
  @Permission({name: '修改角色', identify: 'admin:updateRole'})
  async updateRole(@Body() body) {
    const {value, error} = updateRoleVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    await this.adminService.updateRole(value.id, value.name)
    return success()
  }

  // 删除角色
  @Post('delRole')
  @Permission({name: '删除角色', identify: 'admin:delRole'})
  async delRole(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    await this.adminService.delRole(value.id)
    return success()
  }

  // 查询角色已有权限
  @Post('getRoleAccess')
  @Permission({name: '查询角色已有权限', identify: 'admin:getRoleAccess'})
  async getRoleAccess(@Body() body) {
    const {value, error} = roleIdVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.getRoleAccess(value.role_id))
  }

  // 角色添加权限
  @Post('roleAddAccess')
  @Permission({name: '角色添加权限', identify: 'admin:roleAddAccess'})
  async roleAddAccess(@Body() body) {
    const {value, error} = roleAddAccessVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)

    const role_id = value.role_id
    const permissions = value.permissions

    return success(await this.adminService.roleAddAccess(role_id, permissions))
  }

  // 角色添加菜单
  @Post('roleAddMenu')
  @Permission({name: '角色添加菜单', identify: 'admin:roleAddMenu'})
  async roleAddMenu(@Body() body) {
    const {value, error} = roleAddMenuVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)

    const role_id = value.role_id
    const menus = value.menus

    return success(await this.adminService.roleAddMenu(role_id, menus))
  }

  // 菜单管理
  @Post('menuSort')
  @Permission({name: '菜单管理', identify: 'admin:menuSort'})
  async menuSort(@Body() body) {
    const {value, error} = menuSortVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.adminService.menuSort(value.sort))
  }
}
