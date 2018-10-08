import {Injectable} from '@nestjs/common'
import {User} from '../entity/auth_user.entity'
import {UserRepository} from '../repository/user.repository'
import {InjectRepository} from '@nestjs/typeorm'

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
  }

  async addUser(param) {
    const user = new User()
    user.name = param.name
    return await this.userRepository.save(user)
  }

  async getUser() {
    return await this.userRepository.find()
  }

  async updateUser(param) {
    const user = new User()
    user.name = param.name

    return await this.userRepository.update({id: param.id}, user)
  }

  async delUser(param) {
    return await this.userRepository.delete({id: param.id})
  }

}
