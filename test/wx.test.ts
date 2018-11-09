import * as request from 'supertest'
import {INestApplication} from '@nestjs/common'
import {AppModule} from '../src/app.module'
import {Test} from '@nestjs/testing'
import {UserService} from '../src/service/user.service'

describe('test', () => {

  let app: INestApplication
  let wxService: UserService


  // 测试前只执行一次
  before(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserService],
    }).compile()

    wxService = module.get<UserService>(UserService)

    app = module.createNestApplication()
    await app.init()
  })

  // 测试后只执行一次
  after(async () => {
    await app.close()
  })

  // it(`/GET cats`, async () => {
  //   await request(app.getHttpServer())
  //     .get('/getAdmin')
  //     .expect(200)
  // })

  it('should aa', async () => {

    // wxService['admin'] = jest.fn(() => {
    //   return {code: 666}
    // })

    await request(app.getHttpServer())
      .post('/getUser').send()
      .expect(201).then(res => {

      })
  })

})
