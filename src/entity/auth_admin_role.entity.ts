import {BaseEntity, Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_admin_role')
export class AdminRole extends BaseEntity {

  @PrimaryColumn()
  admin_id: number

  @PrimaryColumn()
  role_id: number

}
