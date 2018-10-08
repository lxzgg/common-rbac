import {Body, Controller, FilesInterceptor, Get, Post, Req, UploadedFiles, UseInterceptors} from '@nestjs/common'
import {UserService} from '../service/user.service'
import {writeFileSync} from 'fs'
import {Permission} from '../modules/authModule/decorator/permission.decorator'
import {Resource} from '../modules/authModule/decorator/resource.decorator'
import {success} from '../utils/result.util'

@Resource({name: '用户', identify: 'Resource'})
@Controller()
export class UserController {

  constructor(private readonly userService: UserService) {
  }

  @Get()
  text() {
    return {code: 0}
  }

  @Get('admin')
  @Permission({name: 'text1', identify: 'Permission', action: 'create'})
  text1(@Req() req) {
    return {code: 888}
  }

  @Post('admin')
  text2(@Req() req) {
    console.log(req.user)
    return {code: 0}
  }


  @Post('addUser')
  async addUser(@Body() body) {
    const result = await this.userService.addUser(body)
    return success(result)
  }

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
