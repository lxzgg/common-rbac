import {BaseEntity, Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_user_role')
export class UserRole extends BaseEntity {

  @PrimaryColumn()
  user_id: number

  @PrimaryColumn()
  role_id: number

}
