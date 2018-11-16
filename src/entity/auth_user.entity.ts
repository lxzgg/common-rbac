import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Role} from './auth_role.entity'
import {DateFormat} from '../utils/date.util'
import {Organization} from './auth_organization.entity'

@Entity('auth_user')
export class User {

  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '姓名'})
  name: string

  @Index()
  @Column({length: 50, default: '', comment: '账号'})
  username: string

  @Column({length: 60, default: '', select: false, comment: '密码'})
  password: string

  @Index()
  @Column({length: 50, default: '', comment: '手机'})
  mobile: string

  @Column({length: 50, default: '', comment: '邮箱'})
  email: string

  @Column({default: true, width: 1, comment: '封禁状态 1.有效 0:无效'})
  status: boolean

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'auth_user_role',
    joinColumn: {name: 'user_id'},
    inverseJoinColumn: {name: 'role_id'},
  })
  roles: Role[]

  @ManyToMany(() => Organization, organization => organization.users)
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
