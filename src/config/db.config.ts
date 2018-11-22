import * as Redis from 'ioredis'
import {TypeOrmModuleOptions} from '@nestjs/typeorm'
import {Admin} from '../entity/auth.admin.entity'
import {AdminGroup} from '../entity/auth.admin_group.entity'
import {AdminRole} from '../entity/auth.admin_role.entity'
import {Group} from '../entity/auth.group.entity'
import {GroupRole} from '../entity/auth.group_role.entity'
import {Role} from '../entity/auth.role.entity'
import {RoleMenu} from '../entity/auth.role_menu.entity'
import {Menu} from '../entity/auth.menu.entity'
import {RolePermission} from '../entity/auth.role_permission.entity'
import {Permission} from '../entity/auth.permission.entity'
import {Resource} from '../entity/auth.resource.entity'

export const jwtConfig = {
  secretOrPrivateKey: 'a59236fc3471490181556c294f41b48c',
  signOptions: {expiresIn: 3600},
}

const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  db: 0,
}

export const redis = new Redis(redisConfig)

export const DBConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'sa',
  database: 'battery',
  entities: [Admin, AdminGroup, AdminRole, Group, GroupRole, Menu, Permission, Resource, Role, RoleMenu, RolePermission],
  // cache: {type: 'redis', options: redisConfig, duration: 60000},
  // 每次建立连接时删除架构
  dropSchema: true,
  // 每次启动应用程序时自动创建数据库架构
  synchronize: true,
  logging: true,
}
