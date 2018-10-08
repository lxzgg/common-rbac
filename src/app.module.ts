import {HttpModule, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserController} from './controller/user.controller'
import {UserService} from './service/user.service'
import {DBConfig} from './config/db.config'
import {User} from './entity/auth_user.entity'
import {WxModule} from './modules/wxModule/wx.module'
import {Resource} from './entity/auth_resource.entity'
import {Permission} from './entity/auth_permission.entity'
import {Role} from './entity/auth_role.entity'
import {AuthModule} from './modules/authModule/auth.module'
import {Organization} from './entity/auth_organization.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot(DBConfig),
    TypeOrmModule.forFeature([Organization, Permission, Resource, Role, User]),
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
