import * as Redis from 'ioredis'
import {TypeOrmModuleOptions} from '@nestjs/typeorm'

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
  entities: [
    '*/entity/**.entity{.ts,.js}',
    'entity/**.entity{.ts,.js}',
  ],
  cache: true,
  // cache: {type: 'redis', options: redisConfig, duration: 60000},
  // 每次建立连接时删除架构
  dropSchema: true,
  // 每次启动应用程序时自动创建数据库架构
  synchronize: true,
  logging: true,
}
