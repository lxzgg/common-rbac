import {ForbiddenException, Injectable} from '@nestjs/common'
import {sign, verify} from 'jsonwebtoken'
import {AuthConfig} from '../config/auth.config'
import {User} from '../entity/auth_user.entity'
import {Connection} from 'typeorm'

@Injectable()
export class AuthService {

  constructor(private readonly connection: Connection) {
  }

  // 生成token
  createToken(payload) {
    return sign(payload, AuthConfig.secret, {expiresIn: AuthConfig.expiresIn})
  }

  // 验证token
  verifyToken(token: string) {
    try {
      token = token.includes('Bearer ') ? token.substring(7) : token
      return verify(token, AuthConfig.secret)
    } catch (e) {
      throw new ForbiddenException(e)
    }
  }

  // 查询用户拥有的权限
  async findUserPermission(userId) {
    return await this.connection.getRepository(User).findOne(userId, {
      select: ['id'],
      relations: ['role', 'role.permission'],
    })
  }

}
