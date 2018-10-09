import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Resource} from './auth_resource.entity'
import {DateFormat} from '../utils/date.util'
import {Role} from './auth_role.entity'

@Entity('auth_permission')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    length: 50,
    default: '',
    select: false,
    comment: '权限名称,如:添加用户',
  })
  name: string

  @Column({
    length: 50,
    select: false,
    comment: '权限操作类型:create、delete、update、find',
  })
  action: string

  @Column({
    length: 50,
    unique: true,
    nullable: false,
    comment: '权限唯一标识,如:用户管理=>user:createUser',
  })
  identify: string

  @ManyToMany(() => Role, role => role.permission)
  role: Role[]

  @ManyToOne(() => Resource, resource => resource.permission, {nullable: false, onDelete: 'CASCADE'})
  @JoinColumn({name: 'resource_id'})
  resource: Resource

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
