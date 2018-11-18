import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Permission} from './auth_permission.entity'

@Entity('auth_resource')
export class Resource extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 50, default: '', comment: '资源名称,如:用户管理'})
  name: string

  @Column({length: 50, unique: true, nullable: false, comment: '资源唯一标识,如:用户管理=>user:manage'})
  identify: string

  @OneToMany(() => Permission, permission => permission.resource)
  permissions: Permission[]

}
