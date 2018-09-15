import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Permission} from './permission.entity'
import {DateFormat} from '../utils/date.util'

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({default: '', comment: '角色名'})
  name: string

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

  @ManyToMany(type => Permission)
  @JoinTable({name: 'role_permission'})
  Permission: Permission
}
