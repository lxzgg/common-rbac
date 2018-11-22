import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm'

@Entity('auth_menu')
export class Menu extends BaseEntity {

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

}
