import {TypeOrmModuleOptions} from '@nestjs/typeorm'

export const DBConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'sa',
  database: 'nest',
  entities: [
    '*/entity/**.entity{.ts,.js}',
    'entity/**.entity{.ts,.js}',
  ],
  // 每次建立连接时删除架构
  dropSchema: false,
  // 每次启动应用程序时自动创建数据库架构
  synchronize: false,
  logging: true,
}
