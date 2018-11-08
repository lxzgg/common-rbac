import {Controller, Get} from '@nestjs/common'
import {AuthService} from '../service/auth.service'

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Get('getToken')
  createToken() {
    const token = this.authService.createToken({id: 1})
    return {code: 0, message: 'success', token}
  }

}
