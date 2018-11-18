import {BaseEntity, Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_role_menu')
export class RoleMenu extends BaseEntity {

  @PrimaryColumn()
  role_id: number

  @PrimaryColumn()
  menu_id: number

}
