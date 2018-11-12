import {HttpModule, Module, OnModuleInit} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserController} from './controller/user.controller'
import {UserService} from './service/user.service'
import {DBConfig} from './config/db.config'
import {User} from './entity/auth_user.entity'
import {WxModule} from './modules/wxModule/wx.module'
import {Resource} from './entity/auth_resource.entity'
import {Permission} from './entity/auth_permission.entity'
import {Role} from './entity/auth_role.entity'
import {AuthService} from './service/auth.service'
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core'
import {AuthGuard} from './common/guard/auth.guard'
import {AuthInterceptor} from './common/interceptor/auth.interceptor'
import {MetadataScanner} from '@nestjs/core/metadata-scanner'
import {Connection, In, Not} from 'typeorm'
import {ModulesContainer} from '@nestjs/core/injector'
import {RESOURCE_DEFINITION} from './common/decorator/resource.decorator'
import {PERMISSION_DEFINITION} from './common/decorator/permission.decorator'
import {hashSync} from 'bcryptjs'
import {MsInterceptor} from './common/interceptor/ms.interceptor'
import {Menu} from './entity/auth_menu.entity'
import {AdminController} from './controller/admin.controller'
import {AdminService} from './service/admin.service'
import {JwtModule} from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.register({
      secretOrPrivateKey: 'a59236fc3471490181556c294f41b48c',
      signOptions: {expiresIn: 3600},
    }),
    TypeOrmModule.forRoot(DBConfig),
    HttpModule,
    WxModule,
  ],
  controllers: [
    AdminController,
    UserController,
  ],
  providers: [
    {// 权限守卫
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {// 权限过期拦截器
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
    {// 相应时间拦截器
      provide: APP_INTERCEPTOR,
      useClass: MsInterceptor,
    },
    AdminService,
    AuthService,
    UserService,
  ],
})

export class AppModule implements OnModuleInit {

  // 元数据扫描程序
  private readonly metadataScanner: MetadataScanner = new MetadataScanner()

  constructor(
    private readonly connection: Connection,
    private readonly modulesContainer: ModulesContainer,// 模块容器
  ) {
  }

  // 模块初始化
  async onModuleInit() {
    await this.loadResourcesAndPermissions()
    await this.createDefaultRole()
    await this.createSuperAdmin()
    await this.initMenu()
    await this.initRole()
  }

  /**
   * 加载资源、权限注解，并将其保存到数据库
   */
  async loadResourcesAndPermissions() {
    // 资源唯一标识数组
    const resources: Resource[] = []
    // 权限唯一标识数组
    const permissions: Permission[] = []
    // 遍历模块
    this.modulesContainer.forEach((moduleValue) => {
      // 遍历模块路由,获取控制器
      moduleValue.routes.forEach(routeValue => {
        // 获取资源
        const scanResource: Resource = Reflect.getMetadata(RESOURCE_DEFINITION, routeValue.metatype)
        // 资源为空则跳出本次循环
        if (!scanResource) return
        // 获取权限
        const scanPermission: Permission[] = this.metadataScanner.scanFromPrototype(null, routeValue.instance, name => Reflect.getMetadata(PERMISSION_DEFINITION, routeValue.instance[name]))
        // 权限为空则跳出本次循环
        if (!scanPermission.length) return

        scanPermission.forEach(permission => permission.resource = scanResource)
        resources.push(scanResource)
        permissions.push(...scanPermission)
      })
    })
    if (!resources.length || !permissions.length) return
    // identify不能为空字符串
    if (resources.find(resource => !resource.identify)) throw new TypeError('identify is empty')
    // 开启事务
    await this.connection.transaction(async entityManager => {
      const resourceRepository = entityManager.getRepository(Resource)
      const permissionRepository = entityManager.getRepository(Permission)
      // 查询不存在的资源
      const notExistResources = await resourceRepository.find({where: {identify: Not(In(resources.map(v => v.identify)))}})
      // 清除不存在的资源
      if (notExistResources.length) await resourceRepository.remove(notExistResources)
      // 查询不存在的权限
      const notExistPermissions = await permissionRepository.find({where: {identify: Not(In(permissions.map(v => v.identify)))}})
      // 清除不存在的权限
      if (notExistPermissions.length) await permissionRepository.remove(notExistPermissions)

      // 查询存在的资源
      const existResources = await resourceRepository.find()
      // 存在资源唯一标识数组
      const existResourceIdentifies = existResources.map(resource => resource.identify)
      // 找出新的资源
      const newResources = resources.filter(resource => existResourceIdentifies.indexOf(resource.identify) === -1)
      // 保存新的资源
      if (newResources.length) existResources.push(...await resourceRepository.save(newResources))
      // 更新已存在资源
      existResources.forEach(resource => resource.name = resources.find(v => v.identify === resource.identify).name)
      // 保存更新的资源
      await resourceRepository.save(existResources)

      // 更新权限的资源对象,首位拦截时可以查看权限所属资源
      permissions.forEach(permission => permission.resource = existResources.find(resource => resource.identify === permission.resource.identify))
      // 查询存在的权限
      const existPermissions = await permissionRepository.find()
      // 存在权限唯一标识数组
      const existPermissionIdentifies = existPermissions.map(permission => permission.identify)
      // 找出新的权限
      const newPermissions = permissions.filter(permission => existPermissionIdentifies.indexOf(permission.identify) === -1)
      // 保存新的权限
      if (newPermissions.length) existPermissions.push(...await permissionRepository.save(newPermissions))
      // 更新已存在的权限
      existPermissions.forEach(permission => {
        const newPermission = permissions.find(v => v.identify === permission.identify)
        permission.name = newPermission.name
        // permission.action = newPermission.action
      })
      // 保存更新的权限
      await permissionRepository.save(existPermissions)
      // 完善元数据信息,守卫拦截时可以查看ID和所属资源
      permissions.forEach(permission => permission.id = existPermissions.find(v => v.identify === permission.identify).id)
    })
  }

  /**
   * 创建默认角色
   */
  private async createDefaultRole() {
    const roleRepository = this.connection.getRepository(Role)
    const role = await roleRepository.findOne(1)
    if (role) return
    await roleRepository.save({id: 1, name: 'admin'})
  }

  /**
   * 创建超级管理员
   */
  private async createSuperAdmin() {
    const userRepository = this.connection.getRepository(User)
    const superAdmin = await userRepository.findOne(1)
    if (superAdmin) return
    await userRepository.save({id: 1, username: 'admin', password: hashSync('admin')})
  }

  /**
   * 初始化菜单
   */
  private async initMenu() {
    const menuRepository = this.connection.getRepository(Menu)
    // 添加总菜单
    await this.connection.getRepository(Menu).insert({name: '菜单'})
    // 添加根菜单
    const menu1 = await menuRepository.insert({
      name: '用户管理',
      url: '/user',
      icon: 'el-icon-bell',
      order: 0,
      parent_id: 1,
    })
    const menu2 = await menuRepository.insert({
      name: '角色管理',
      url: '/role',
      icon: 'el-icon-bell',
      order: 0,
      parent_id: 1,
    })
    const menu3 = await menuRepository.insert({
      name: '权限管理',
      url: '/access',
      icon: 'el-icon-bell',
      order: 0,
      parent_id: 1,
    })

    await menuRepository.insert({name: '用户管理1', url: '/admin/user', parent_id: menu1.identifiers[0].id})
    await menuRepository.insert({name: '用户管理2', url: '/admin/user', parent_id: menu1.identifiers[0].id})
    await menuRepository.insert({name: '用户管理1', url: '/admin/user', parent_id: menu2.identifiers[0].id})
    await menuRepository.insert({name: '用户管理3', url: '/admin/user', parent_id: menu2.identifiers[0].id})
    await menuRepository.insert({name: '用户管理5', url: '/admin/user', parent_id: menu3.identifiers[0].id})
    await menuRepository.insert({name: '用户管理7', url: '/admin/user', parent_id: menu3.identifiers[0].id})
    const pmenu3 = await menuRepository.insert({name: '用户管理1', url: '/admin/user', parent_id: menu3.identifiers[0].id})

    await menuRepository.insert({name: '用户管理144', url: '/admin/user', parent_id: pmenu3.identifiers[0].id})
    await menuRepository.insert({name: '用户管理441', url: '/admin/user', parent_id: pmenu3.identifiers[0].id})
    await menuRepository.insert({name: '用户管理156', url: '/admin/user', parent_id: pmenu3.identifiers[0].id})

  }

  /**
   * 初始化角色
   */
  private async initRole() {
    await this.connection.createQueryBuilder().insert().into(Role).values([
      {name: '普通用户'},
      {name: '会议用户'},
      {name: '会⚪用户'},
      {name: '超级用户'},
      {name: '666用户'},
      {name: '888用户'},
    ]).execute()
  }

}
