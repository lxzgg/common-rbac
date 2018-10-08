import {ForbiddenException, Injectable} from '@nestjs/common'
import {sign, verify} from 'jsonwebtoken'
import {AuthConfig} from './auth.config'
import {User} from '../../entity/auth_user.entity'
import {Connection} from 'typeorm'

@Injectable()
export class AuthService {

  constructor(private readonly connection: Connection) {
  }

  createToken(payload) {
    return sign(payload, AuthConfig.secret, {expiresIn: AuthConfig.expiresIn})
  }

  verifyToken(token: string) {
    try {
      token = token.includes('Bearer ') ? token.substring(7) : token
      return verify(token, AuthConfig.secret)
    } catch (e) {
      throw new ForbiddenException(e)
    }
  }

  async findUserPermission(userId) {
    return await this.connection.getRepository(User).findOne(userId, {
      select: ['id'],
      relations: ['role', 'role.permission'],
    })
  }

}
