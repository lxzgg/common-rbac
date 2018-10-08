import {Connection, createConnection} from 'typeorm'
import {User} from '../src/entity/auth_user.entity'

describe('test', () => {
  let connection: Connection

  beforeAll(async () => {
    connection = await createConnection({
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
    })
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should find', async () => {
    const result = await connection.getRepository(User).findOne(1, {
      select: ['id'],
      relations: ['role', 'role.permission'],
    })
    console.log(JSON.stringify(result, null, 2))
  })

})
