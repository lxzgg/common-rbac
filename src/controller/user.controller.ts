import {Body, Controller, FileInterceptor, Get, Post, UseInterceptors} from '@nestjs/common'
import {Permission} from '../common/decorator/permission.decorator'
import {Resource} from '../common/decorator/resource.decorator'
import {success} from '../utils/result.util'
import {UserService} from '../service/user.service'

@Controller()
@Resource({name: 'Resource', identify: 'Resource'})
export class UserController {

  constructor(private readonly userService: UserService) {
  }

  @Get('go')
  @Permission({name: 'Permission', identify: 'Permission1', action: 'find'})
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
  @Permission({name: 'Permission', identify: 'Permission', action: 'find'})
  async permission() {
    return success()
  }

}
