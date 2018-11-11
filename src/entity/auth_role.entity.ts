import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Permission} from './auth_permission.entity'
import {DateFormat} from '../utils/date.util'
import {User} from './auth_user.entity'
import {Organization} from './auth_organization.entity'
import {Menu} from './auth_menu.entity'

@Entity('auth_role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '角色名'})
  name: string

  @ManyToMany(() => User, user => user.roles)
  users: User[]

  @ManyToMany(() => Menu)
  @JoinTable({name: 'auth_role_menu', joinColumn: {name: 'role_id'}, inverseJoinColumn: {name: 'menu_id'}})
  menus: Menu[]

  @ManyToMany(() => Permission, permission => permission.roles)
  permissions: Permission[]

  @ManyToMany(() => Organization, organization => organization.roles)
  organizations: Organization[]

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
