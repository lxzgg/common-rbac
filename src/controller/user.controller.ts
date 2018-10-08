import {Controller, Post} from '@nestjs/common'
import {Permission} from '../modules/authModule/decorator/permission.decorator'
import {Resource} from '../modules/authModule/decorator/resource.decorator'
import {success} from '../utils/result.util'
import {UserService} from '../service/user.service'

@Controller()
@Resource({name: 'Resource', identify: 'Resource'})
export class UserController {

  constructor(private readonly userService: UserService) {
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
