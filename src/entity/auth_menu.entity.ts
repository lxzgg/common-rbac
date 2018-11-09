import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Role} from './auth_role.entity'

@Entity('auth_menu')
export class Menu {

  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '菜单名称'})
  name: string

  @Column({length: 50, default: '', comment: '菜单的访问url'})
  url: string

  @Column({length: 50, default: '', comment: '菜单图标'})
  icon: string

  @Column({default: 0, comment: '菜单排序'})
  order: number

  @Column({nullable: true, comment: '父菜单id'})
  parent_id: number

  @ManyToOne(() => Menu, menu => menu.menus)
  @JoinColumn({name: 'parent_id'})
  menu: Menu

  @OneToMany(() => Menu, menu => menu.menu)
  menus: Menu[]

  @ManyToMany(() => Role)
  @JoinTable({name: 'auth_role_menu', joinColumn: {name: 'menu_id'}, inverseJoinColumn: {name: 'role_id'}})
  role: Role[]

}
