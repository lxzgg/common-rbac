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
import {Role} from './auth_role.entity'
import {DateFormat} from '../utils/date.util'
import {Admin} from './auth_admin.entity'

@Entity('auth_group')
export class Group extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '组织名称'})
  name: string

  @ManyToMany(() => Admin, admin => admin.groups)
  @JoinTable({
    name: 'auth_admin_group',
    joinColumn: {name: 'group_id'},
    inverseJoinColumn: {name: 'admin_id'},
  })
  admins: Admin[]

  @ManyToMany(() => Role, role => role.groups)
  @JoinTable({
    name: 'auth_group_role',
    joinColumn: {name: 'group_id'},
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
