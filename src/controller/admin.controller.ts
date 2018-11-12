import {Body, Controller, Post} from '@nestjs/common'
import {Resource} from '../common/decorator/resource.decorator'
import {AdminService} from '../service/admin.service'
import {success} from '../utils/result.util'
import {captcha_err, captcha_expired, ErrorException, param_err} from '../common/exceptions/error.exception'
import {
  addRoleSchema,
  idSchema,
  keySchema,
  loginSchema,
  pageSchema,
  roleAddAccessSchema,
  roleAddMenuSchema,
  roleIdSchema,
  updateRoleSchema,
} from '../schema/admin.schema'
import {create, randomText} from 'svg-captcha'
import {redis} from '../config/db.config'
import {JwtService} from '@nestjs/jwt'

@Controller('admin')
@Resource({name: '管理员操作', identify: 'admin:manage'})
export class AdminController {

  constructor(private readonly adminService: AdminService,
              private readonly jwtService: JwtService) {
  }

  @Post('login')
  async login(@Body() body) {
    const {value, error} = loginSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    const captcha = await redis.get(value.key)

    if (!captcha) throw new ErrorException(captcha_expired.code, captcha_expired.message)
    if (value.captcha.toUpperCase() !== captcha.toUpperCase()) throw new ErrorException(captcha_err.code, captcha_err.message)

    const token = this.jwtService.sign({a: 1})

    return success()
  }

  @Post('captcha')
  async captcha() {
    const code = create({height: 40, color: true, ignoreChars: '0o1ig'})
    const randomKey = randomText(30)
    await redis.setex(randomKey, 60 * 3, code.text)
    return success({key: randomKey, data: code.data})
  }

  @Post('newCaptcha')
  async newCaptcha(@Body() body) {
    const {value, error} = keySchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    const code = create({height: 40, color: true, ignoreChars: '0o1ig'})
    await redis.setex(value.key, 60 * 3, code.text)
    return success(code.data)
  }

  // 查询所有菜单
  @Post('getMenu')
  async getMenu() {
    return success(await this.adminService.getMenu())
  }

  // 查询角色已有菜单
  @Post('getRoleMenu')
  async getRoleMenu(@Body() body) {
    const {value, error} = idSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    return success(await this.adminService.getRoleMenu(value.id))
  }

  // 查询角色已有菜单ID
  @Post('getRoleMenuKeys')
  async getRoleMenuKeys(@Body() body) {
    const {value, error} = roleIdSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    return success(await this.adminService.getRoleMenuKeys(value.role_id))
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
    const {value, error} = pageSchema.validate(body)
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
    await this.adminService.updateRole(value.id, value.name)
    return success()
  }

  // 删除角色
  @Post('delRole')
  async delRole(@Body() body) {
    const {value, error} = idSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    await this.adminService.delRole(value.id)
    return success()
  }

  // 查询角色已有权限
  @Post('getRoleAccess')
  // @Permission({name: '查询权限', identify: 'roleAccess:get'})
  async getRoleAccess(@Body() body) {
    const {value, error} = roleIdSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)
    return success(await this.adminService.getRoleAccess(value.role_id))
  }

  // 角色添加权限
  @Post('roleAddAccess')
  // @Permission({name: '查询权限', identify: 'roleAccess:get'})
  async roleAddAccess(@Body() body) {
    const {value, error} = roleAddAccessSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)

    const role_id = value.role_id
    const permissions = value.permissions

    return success(await this.adminService.roleAddAccess(role_id, permissions))
  }

  // 角色添加菜单
  @Post('roleAddMenu')
  async roleAddMenu(@Body() body) {
    const {value, error} = roleAddMenuSchema.validate(body)
    if (error) throw new ErrorException(param_err.code, error.details)

    const role_id = value.role_id
    const menus = value.menus

    return success(await this.adminService.roleAddMenu(role_id, menus))
  }
}
