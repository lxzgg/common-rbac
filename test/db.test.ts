import {Connection, createConnection} from 'typeorm'
import {Menu} from '../src/entity/auth_menu.entity'
import {User} from '../src/entity/auth_user.entity'

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

    const result = await connection.getRepository(User).findOne(2, {
      select: ['id'],
      relations: ['roles', 'roles.menus'],
    })

    let arr: Menu[] = []
    for (let i = 0; i < result.roles.length; i++) {
      arr = arr.concat(result.roles[i].menus)
    }

    const arrId: any = []
    const list: Menu[] = []
    for (let i = 0; i < arr.length; i++) {
      if (!arrId.includes(arr[i].id)) {
        arrId.push(arr[i].id)
        list.push(arr[i])
      }
    }

    const menus: Menu[] = []

    // 一级菜单
    for (let i = 0; i < list.length; i++) {
      if (list[i].parent_id === 1) {
        list[i]['menus'] = []

        // 二级菜单
        for (let j = 0; j < list.length; j++) {
          if (list[i].id === list[j].parent_id) {
            list[j]['menus'] = []

            // 三级菜单
            for (let k = 0; k < list.length; k++) {
              if (list[j].id === list[k].parent_id) list[j]['menus'].push(list[k])
            }

            list[i]['menus'].push(list[j])
          }
        }

        menus.push(list[i])
      }
    }

    console.log(JSON.stringify(menus, null, 2))
  })

})
