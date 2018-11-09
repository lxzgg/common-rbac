import {Connection, createConnection} from 'typeorm'
import {Menu} from '../src/entity/auth_menu.entity'

describe('test', () => {
  let connection: Connection

  before(async () => {
    connection = await createConnection({
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
      // 每次建立连接时删除架构
      dropSchema: false,
      // 每次启动应用程序时自动创建数据库架构
      synchronize: false,
      logging: true,
    })
  })

  after(async () => {
    await connection.close()
  })

  it('查询所有菜单', async () => {
    const result = await connection.getRepository(Menu).find({
      where: {parent_id: 1},
      select: ['id', 'name'],
      relations: ['menus'],
    })
    console.log(JSON.stringify(result, null, 2))
  })

  it('添加菜单',async () => {

  })

})
