import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Permission} from './auth.permission.entity'
import {DateFormat} from '../utils/date.util'
import {Admin} from './auth.admin.entity'
import {Menu} from './auth.menu.entity'
import {Group} from './auth.group.entity'

@Entity('auth_role')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '角色名'})
  name: string

  @ManyToMany(() => Admin, admin => admin.roles)
  admins: Admin[]

  @ManyToMany(() => Menu)
  @JoinTable({name: 'auth_role_menu', joinColumn: {name: 'role_id'}, inverseJoinColumn: {name: 'menu_id'}})
  menus: Menu[]

  @ManyToMany(() => Permission, permission => permission.roles)
  permissions: Permission[]

  @ManyToMany(() => Group, group => group.roles)
  groups: Group[]

  @CreateDateColumn({
    select: false, comment: '创建时间', transformer: {
      from: (date: Date) => DateFormat(date, 'YYYY-MM-DD HH:mm:ss'),
      to: () => new Date(),
    },
  })
  createdAt: Date

  @UpdateDateColumn({
    select: false, comment: '更新时间', transformer: {
      from: (date: Date) => DateFormat(date, 'YYYY-MM-DD HH:mm:ss'),
      to: () => new Date(),
    },
  })
  updatedAt: Date
}
