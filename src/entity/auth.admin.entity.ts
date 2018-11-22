import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm'
import {Role} from './auth.role.entity'
import {DateFormat} from '../utils/date.util'
import {Group} from './auth.group.entity'

@Entity('auth_admin')
export class Admin extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '昵称'})
  name: string

  @Index()
  @Column({length: 50, default: '', comment: '账号'})
  username: string

  @Column({length: 60, default: '', select: false, comment: '密码'})
  password: string

  @Column({default: true, width: 1, comment: '封禁状态 1.有效 0:无效'})
  status: boolean

  @VersionColumn({comment: '信息版本'})
  version: number

  @ManyToMany(() => Role, role => role.admins)
  @JoinTable({
    name: 'auth_admin_role',
    joinColumn: {name: 'admin_id'},
    inverseJoinColumn: {name: 'role_id'},
  })
  roles: Role[]

  @ManyToMany(() => Group, group => group.admins)
  @JoinTable({
    name: 'auth_admin_group',
    joinColumn: {name: 'admin_id'},
    inverseJoinColumn: {name: 'group_id'},
  })
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
