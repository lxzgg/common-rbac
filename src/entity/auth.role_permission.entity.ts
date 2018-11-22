import {BaseEntity, Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_role_permission')
export class RolePermission extends BaseEntity {

  @PrimaryColumn()
  role_id: number

  @PrimaryColumn()
  permission_id: number

}
