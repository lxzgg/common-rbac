import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Role} from './role.entity'

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number

  @Column({default: '', comment: '姓名'})
  name: string

  @Column('tinyint', {width: 1, default: true, comment: '封禁状态 1.有效 0:无效'})
  status: number

  @ManyToMany(() => Role)
  @JoinTable({name: 'user_role'})
  role: Role[]
}
