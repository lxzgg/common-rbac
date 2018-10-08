import {Injectable} from '@nestjs/common'
import {Repository} from 'typeorm'
import {User} from '../entity/auth_user.entity'
import {InjectRepository} from '@nestjs/typeorm'

@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
  }

  // 查询所有用户
  findAll() {
    return this.userRepository.find()
  }

}
