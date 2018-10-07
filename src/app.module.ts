import {HttpModule, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserController} from './controller/user.controller'
import {UserService} from './service/user.service'
import {DBConfig} from './config/db.config'
import {User} from './entity/user.entity'
import {UserRepository} from './repository/user.repository'
import {WxModule} from './modules/wxModule/wx.module'
import {Resource} from './entity/resource.entity'
import {Permission} from './entity/permission.entity'
import {Role} from './entity/role.entity'
import {AuthModule} from './modules/authModule/auth.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(DBConfig),
    TypeOrmModule.forFeature([User, UserRepository, Resource, Permission, Role]),
    HttpModule,
    AuthModule,
    WxModule,
  ],
  controllers: [
    UserController,
  ],
  providers: [
    UserService,
  ],
})
export class AppModule {
}
