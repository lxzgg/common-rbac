import {Connection, createConnection} from 'typeorm'
import {Menu} from '../src/entity/auth_menu.entity'
import {Admin} from '../src/entity/auth_admin.entity'

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

  it('should user', async () => {
    Admin.find().then(res => {
      console.log(res)
    })
  })

  it('should roles', function () {
    connection.getRepository(Admin).findOne(2, {
      select: ['id'],
      relations: ['roles', 'roles.permissions', 'groups', 'groups.roles', 'groups.roles.permissions'],
    }).then(res => {


      const userPermission = []

      res.roles.forEach(role => {
        role.permissions.forEach(permission => {
          if (!userPermission.includes(permission.identify)) {
            userPermission.push(permission.identify)
          }
        })
      })
      res.groups.forEach(Group => {
        Group.roles.forEach(role => {
          role.permissions.forEach(permission => {
            if (!userPermission.includes(permission.identify)) {
              userPermission.push(permission.identify)
            }
          })
        })
      })

      console.log(JSON.stringify(res, null, 2))
      console.log(JSON.stringify(userPermission, null, 2))
    })
  })

  it('查询所有菜单', async () => {
    const result = await connection.getRepository(Admin).findOne(2, {
      select: ['id'],
      relations: ['roles', 'roles.menus', 'groups', 'groups.roles', 'groups.roles.menus'],
    })

    // 合并数组
    let arr: Menu[] = []
    result.roles.forEach(role => {
      arr = arr.concat(role.menus)
    })

    result.groups.forEach(Group => {
      Group.roles.forEach(role => {
        arr = arr.concat(role.menus)
      })
    })

    console.log(JSON.stringify(arr, null, 2))
  })

})
