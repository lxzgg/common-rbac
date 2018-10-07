import {Injectable, UnauthorizedException} from '@nestjs/common'
import {sign, verify} from 'jsonwebtoken'
import {AuthConfig} from './auth.config'

@Injectable()
export class AuthService {

  createToken(payload) {
    return sign(payload, AuthConfig.secret, {expiresIn: AuthConfig.expiresIn})
  }

  verifyToken(token: string) {
    try {
      token = token.includes('Bearer ') ? token.substring(7) : token
      return verify(token, AuthConfig.secret)
    } catch (e) {
      throw new UnauthorizedException(e)
    }
  }

}
