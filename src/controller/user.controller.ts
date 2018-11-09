import {Body, Controller, FileInterceptor, Get, Post, UseInterceptors} from '@nestjs/common'
import {Permission} from '../common/decorator/permission.decorator'
import {Resource} from '../common/decorator/resource.decorator'
import {success} from '../utils/result.util'
import {UserService} from '../service/user.service'

@Controller()
@Resource({name: '用户管理', identify: 'Resource'})
export class UserController {

  constructor(private readonly userService: UserService) {
  }

  @Get('go')
  async a() {
    // throw new ErrorException(param_err.code, param_err.message)
    return {a: 1}
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async all(@Body() body) {
    return success(body)
  }

  @Post('findAll')
  async findAll() {
    return success(await this.userService.findAll())
  }

  @Post('permission')
  @Permission({name: '查询权限', identify: 'Permission11'})
  async permission() {
    return success()
  }

  @Post('permission')
  @Permission({name: '查询权限2', identify: 'Permission121'})
  async permission2() {
    return success()
  }

}
