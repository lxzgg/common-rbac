import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Permission} from './permission.entity'

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  id: number

  @Column({default: '', comment: '资源名称,如:用户管理'})
  name: string

  @Column({unique: true, nullable: false, comment: '资源唯一标识,如:用户管理=>user:manage'})
  identify: string

  @OneToMany(() => Permission, permission => permission.resource)
  permission: Permission[]
}
