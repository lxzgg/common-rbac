import {BaseEntity, Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_admin_group')
export class AdminGroup extends BaseEntity {

  @PrimaryColumn()
  admin_id: number

  @PrimaryColumn()
  group_id: number

}
