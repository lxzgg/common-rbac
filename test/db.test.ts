import {Connection, createConnection} from 'typeorm'
import {Menu} from '../src/entity/auth_menu.entity'
import {Role} from '../src/entity/auth_role.entity'

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

  it('角色菜单', async () => {
    const result = await connection.getRepository(Role).findOne({where: {id: 1}, relations: ['menus']})

    const arr = result.menus

    const menus = []

    // 一级菜单
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].parent_id === 1) {
        arr[i]['menus'] = []

        // 二级菜单
        for (let j = 0; j < arr.length; j++) {
          if (arr[i].id === arr[j].parent_id) {
            arr[j]['menus'] = []

            // 三级菜单
            for (let k = 0; k < arr.length; k++) {
              if (arr[j].id === arr[k].parent_id) arr[j]['menus'].push(arr[k])
            }

            arr[i]['menus'].push(arr[j])
          }
        }

        menus.push(arr[i])
      }
    }

    console.log(JSON.stringify(menus, null, 2))
  })

  it('should d', async () => {
    const result = await connection.getRepository(Role).find({
      where: {id: 1},
      relations: ['menus'],
    })
    console.log(JSON.stringify(result, null, 2))
  })


})
