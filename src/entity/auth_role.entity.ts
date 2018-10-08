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

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '角色名'})
  name: string

  @ManyToMany(() => User, user => user.role)
  user: User[]

  @ManyToMany(() => Permission, permission => permission.role)
  @JoinTable({name: 'role_permission'})
  permission: Permission[]

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
