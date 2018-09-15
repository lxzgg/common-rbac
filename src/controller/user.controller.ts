import {Body, Controller, FilesInterceptor, Get, Post, UploadedFiles, UseInterceptors} from '@nestjs/common'
import {UserService} from '../service/user.service'
import {Repository} from 'typeorm'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from '../entity/user.entity'
import {writeFileSync} from 'fs'
import {Permission} from '../common/decorator/permission.decorator'
import {Resource} from '../common/decorator/resource.decorator'
import {success} from '../utils/result.util'

@Resource({name: 'Resource', identify: 'Resource'})
@Controller()
export class UserController {

  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
    private readonly userService: UserService,
  ) {
  }

  @Get()
  @Permission({name: 'text', identify: 'text432', action: 'create'})
  text() {
    return 16661
  }

  @Permission({name: 'Permission', identify: 'Permission33', action: 'create'})
  @Post('addUser')
  async addUser(@Body() body) {
    const result = await this.userService.addUser(body)
    return success(result)
  }

  @Permission({name: 'Permission', identify: 'Permission14', action: 'find'})
  @Post('getUser')
  async getUser() {
    const result = await this.userService.getUser()
    return success(result)
  }

  @Post('updateUser')
  async updateUser(@Body() body) {
    const result = await this.userService.updateUser(body)
    return success(result)
  }

  @Post('delUser')
  async delUser(@Body() body) {
    const result = await this.userService.delUser(body)
    return success(result)
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(@UploadedFiles() files) {

    for (let i = 0; i < files.length; i++) {
      writeFileSync('temp/' + files[i].originalname, files[i].buffer)
    }

    return success()
  }
}
