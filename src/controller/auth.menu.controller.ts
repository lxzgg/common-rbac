import {Body, Controller, Post, UseGuards} from '@nestjs/common'
import {AuthGuard} from '../common/guard/auth.guard'
import {success} from '../utils/result.util'
import {Permission} from '../common/decorator/permission.decorator'
import {idVerify, menuSortVerify} from '../verify/auth.verify'
import {ErrorException, param_err} from '../common/exceptions/error.exception'
import {Resource} from '../common/decorator/resource.decorator'
import {AuthMenuService} from '../service/auth.menu.service'

@Controller('menu')
@UseGuards(AuthGuard)
@Resource({name: '菜单管理', identify: 'manage:menu'})
export class AuthMenuController {

  constructor(private readonly menuService: AuthMenuService) {
  }

  // 查询用户所有菜单
  @Post('getUserMenu')
  async getUserMenu(@Body() body) {
    const {value, error} = idVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    if (value.id === 1) return success(await this.menuService.getMenuAll())
    return success(await this.menuService.getRoleMenu(value.id))
  }

  // 查询所有菜单
  @Post('getMenuAll')
  @Permission({name: '查询菜单', identify: 'admin:getMenuAll'})
  async getMenuAll() {
    return success(await this.menuService.getMenuAll())
  }

  // 菜单管理
  @Post('menuSort')
  @Permission({name: '菜单管理', identify: 'admin:menuSort'})
  async menuSort(@Body() body) {
    const {value, error} = menuSortVerify.validate(body)
    if (error) throw new ErrorException(param_err, error.details)
    return success(await this.menuService.menuSort(value.sort))
  }

}
