import {Connection, createConnection} from 'typeorm'
import {User} from '../src/entity/user.entity'
import {Role} from '../src/entity/role.entity'

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
      synchronize: true,
      logging: true,
    })
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should find', async () => {
    const result = await connection.getRepository(User).findOne({relations: ['role']})
    console.log(JSON.stringify(result, null, 2))
  })

  it('should s', async () => {
    const result = await connection.createQueryBuilder().insert().into(User).values([]).getQuery()
    console.log(result)
  })

  it('should raw', async () => {
    const result = await connection.query('select * from user where id=?', [2])
    console.log(result)
  })

  it('should get', async () => {
    const result = await connection.getRepository(User).find({relations: ['role']})
    console.log(JSON.stringify(result, null, 2))
  })

  it('should role', async () => {
    const role = new Role()
    role.name = '3'
    const result = await connection.getRepository(Role).update({id: 1}, role)
    console.log(JSON.stringify(result, null, 2))
  })

  it('should save', async () => {
    const user = new User()
    user.name = 'user'

    const role = new Role()
    role.name = 'role'

    const role1 = new Role()
    role1.name = 'role1'

    user.role = [role, role1]

    const result1 = await connection.getRepository(Role).save(role)
    const result2 = await connection.getRepository(Role).save(role1)
    const result3 = await connection.getRepository(User).save(user)
    console.log(result1)
    console.log(result2)
    console.log(result3)

  })
})
