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
import {APP_INTERCEPTOR} from '@nestjs/core'
import {AuthInterceptor} from './common/interceptor/auth.interceptor'
import {MetadataScanner} from '@nestjs/core/metadata-scanner'
import {Connection, In, Not} from 'typeorm'
import {ModulesContainer} from '@nestjs/core/injector'
import {RESOURCE_DEFINITION} from './common/decorator/resource.decorator'
import {PERMISSION_DEFINITION} from './common/decorator/permission.decorator'
import {hashSync} from 'bcryptjs'
import {MsInterceptor} from './common/interceptor/ms.interceptor'
import {Menu} from './entity/auth_menu.entity'
import {RoleService} from './service/role.service'
import {JwtModule} from '@nestjs/jwt'
import {UserRole} from './entity/auth_user_role.entity'
import {MenuController} from './controller/menu.controller'
import {RoleController} from './controller/role.controller'
import {MenuService} from './service/menu.service'
import {CommonService} from './service/common.service'
import {Organization} from './entity/auth_organization.entity'
import {OrganizationController} from './controller/organization.controller'
import {OrganizationService} from './service/organization.service'

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
    MenuController,
    OrganizationController,
    RoleController,
    UserController,
  ],
  providers: [
    {// 权限过期拦截器
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
    {// 相应时间拦截器
      provide: APP_INTERCEPTOR,
      useClass: MsInterceptor,
    },
    CommonService,
    MenuService,
    OrganizationService,
    RoleService,
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
    await this.createSuperAdmin()
    await this.createDefaultRole()
    await this.initMenu()
    await this.initOrganization()
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
   * 创建超级管理员,和普通管理员
   */
  private async createSuperAdmin() {
    const userRepository = this.connection.getRepository(User)
    // 超级管理员
    await userRepository.save({id: 1, username: 'admin', password: hashSync('admin')})

    // 普通管理员
    await userRepository.save({id: 2, username: 'admin1', password: hashSync('admin1')})
  }

  /**
   * 创建管理员角色,用户角色
   */
  private async createDefaultRole() {
    const roleRepository = this.connection.getRepository(Role)
    const userRoleRepository = this.connection.getRepository(UserRole)
    // 管理员角色
    await roleRepository.save({id: 1, name: 'admin'})
    await userRoleRepository.save({user_id: 2, role_id: 1})

    // 用户角色
    await roleRepository.save({id: 2, name: 'user'})
    await userRoleRepository.save({user_id: 2, role_id: 2})

  }

  /**
   * 初始化菜单
   */
  private async initMenu() {
    const menuArray: Menu[] = []
    // 根菜单
    const menuRoot = new Menu()
    menuRoot.id = 1
    menuRoot.name = '菜单'
    menuArray.push(menuRoot)

    const menu1 = new Menu()
    menu1.id = 2
    menu1.name = '用户管理'
    menu1.url = '/user'
    menu1.parent_id = 1
    menuArray.push(menu1)

    const menu2 = new Menu()
    menu2.id = 3
    menu2.name = '组织管理'
    menu2.url = '/organization'
    menu2.parent_id = 1
    menuArray.push(menu2)

    const menu3 = new Menu()
    menu3.id = 4
    menu3.name = '角色管理'
    menu3.url = '/role'
    menu3.parent_id = 1
    menuArray.push(menu3)

    await Menu.save(menuArray)
  }

  /**
   * 初始化组织
   */
  private async initOrganization() {
    const organization = new Organization()
    organization.id = 1
    organization.name = '管理部'
    await Organization.save(organization)
  }

}
