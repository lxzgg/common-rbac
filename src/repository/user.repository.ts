import {EntityRepository, Repository} from 'typeorm'
import {User} from '../entity/auth_user.entity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {

}
