import {BaseEntity, Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_group_role')
export class GroupRole extends BaseEntity {

  @PrimaryColumn()
  group_id: number

  @PrimaryColumn()
  role_id: number

}
