import {Injectable} from '@nestjs/common'
import {User} from '../entity/auth_user.entity'
import {Connection} from 'typeorm'

@Injectable()
export class AuthService {

  constructor(private readonly connection: Connection) {
  }

  // 查询用户拥有的权限
  async findUserPermission(userId) {
    return await this.connection.getRepository(User).findOne(userId, {
      select: ['id'],
      relations: ['role', 'role.permission'],
    })
  }

}
