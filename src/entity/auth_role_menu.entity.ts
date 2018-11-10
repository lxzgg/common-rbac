import {Entity, PrimaryColumn} from 'typeorm'

@Entity('auth_role_menu')
export class RoleMenu {

  @PrimaryColumn()
  role_id: number

  @PrimaryColumn()
  menu_id: number

}
