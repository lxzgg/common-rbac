import {BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Resource} from './auth.resource.entity'
import {Role} from './auth.role.entity'

@Entity('auth_permission')
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '权限名称,如:添加用户'})
  name: string

  @Column({length: 50, unique: true, nullable: false, comment: '权限唯一标识,如:用户管理=>user:createUser'})
  identify: string

  @ManyToMany(() => Role, role => role.permissions)
  @JoinTable({
    name: 'auth_role_permission',
    joinColumn: {name: 'permission_id'},
    inverseJoinColumn: {name: 'role_id'},
  })
  roles: Role[]

  @ManyToOne(() => Resource, resource => resource.permissions, {nullable: false, onDelete: 'CASCADE'})
  @JoinColumn({name: 'resource_id'})
  resource: Resource
}
