import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
import {Permission} from './auth_permission.entity'
import {DateFormat} from '../utils/date.util'

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    length: 50,
    default: '',
    comment: '资源名称,如:用户管理',
  })
  name: string

  @Column({
    length: 50,
    unique: true,
    nullable: false,
    comment: '资源唯一标识,如:用户管理=>user:manage',
  })
  identify: string

  @OneToMany(() => Permission, permission => permission.resource)
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
