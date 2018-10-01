import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Resource} from './resource.entity'

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column({default: '', comment: '权限名称,如:添加用户'})
  name: string

  @Column({comment: '权限操作类型:create、delete、update、find'})
  action: string

  @Column({unique: true, nullable: false, comment: '权限唯一标识,如:用户管理=>user:createUser'})
  identify: string

  @ManyToOne(() => Resource, resource => resource.permission, {onDelete: 'CASCADE'})
  resource: Resource

}
