import {Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_user_role')
export class UserRole {

  @PrimaryColumn()
  user_id: number

  @PrimaryColumn()
  role_id: number

}
