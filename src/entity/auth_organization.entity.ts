import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Role} from './auth_role.entity'
import {DateFormat} from '../utils/date.util'
import {User} from './auth_user.entity'

@Entity('auth_organization')
export class Organization {

  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', select: false, comment: '用户组名称'})
  name: string

  @ManyToMany(() => User, user => user.organizations)
  @JoinTable({
    name: 'auth_organization_user',
    joinColumn: {name: 'organization_id'},
    inverseJoinColumn: {name: 'user_id'},
  })
  users: User[]

  @ManyToMany(() => Role, role => role.organizations)
  @JoinTable({
    name: 'auth_organization_role',
    joinColumn: {name: 'organization_id'},
    inverseJoinColumn: {name: 'role_id'},
  })
  roles: Role[]

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
