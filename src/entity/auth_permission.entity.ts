import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Resource} from './auth_resource.entity'
import {Role} from './auth_role.entity'

@Entity('auth_permission')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '权限名称,如:添加用户'})
  name: string

  @Column({length: 50, unique: true, select: false, nullable: false, comment: '权限唯一标识,如:用户管理=>user:createUser'})
  identify: string

  @ManyToMany(() => Role, role => role.permission)
  role: Role[]

  @ManyToOne(() => Resource, resource => resource.permission, {nullable: false, onDelete: 'CASCADE'})
  @JoinColumn({name: 'resource_id'})
  resource: Resource
}
