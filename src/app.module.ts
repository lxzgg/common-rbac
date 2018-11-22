import {HttpModule, Module, OnModuleInit} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {AuthLoginController} from './controller/auth.login.controller'
import {AuthLoginService} from './service/auth.login.service'
import {DBConfig} from './config/db.config'
import {Admin} from './entity/auth.admin.entity'
import {WxModule} from './modules/wxModule/wx.module'
import {Resource} from './entity/auth.resource.entity'
import {Permission} from './entity/auth.permission.entity'
import {Role} from './entity/auth.role.entity'
import {APP_INTERCEPTOR} from '@nestjs/core'
import {AuthInterceptor} from './common/interceptor/auth.interceptor'
import {MetadataScanner} from '@nestjs/core/metadata-scanner'
import {Connection, In, Not} from 'typeorm'
import {ModulesContainer} from '@nestjs/core/injector'
import {RESOURCE_DEFINITION} from './common/decorator/resource.decorator'
import {PERMISSION_DEFINITION} from './common/decorator/permission.decorator'
import {hashSync} from 'bcryptjs'
import {MsInterceptor} from './common/interceptor/ms.interceptor'
import {Menu} from './entity/auth.menu.entity'
import {AuthRoleService} from './service/auth.role.service'
import {JwtModule} from '@nestjs/jwt'
import {AdminRole} from './entity/auth.admin_role.entity'
import {AuthMenuController} from './controller/auth.menu.controller'
import {AuthRoleController} from './controller/auth.role.controller'
import {AuthMenuService} from './service/auth.menu.service'
import {CommonService} from './service/common.service'
import {Group} from './entity/auth.group.entity'
import {AuthGroupController} from './controller/auth.group.controller'
import {AuthGroupService} from './service/auth.group.service'
import {GroupRole} from './entity/auth.group_role.entity'
import {AdminGroup} from './entity/auth.admin_group.entity'
import {AuthAdminController} from './controller/auth.admin.controller'
import {AuthAdminService} from './service/auth.admin.service'

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
    AuthAdminController,
    AuthGroupController,
    AuthLoginController,
    AuthMenuController,
    AuthRoleController,
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
    AuthAdminService,
    AuthGroupService,
    CommonService,
    AuthLoginService,
    AuthMenuService,
    AuthRoleService,
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
    await this.initGroup()
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
    // 超级管理员
    const superAdmin = new Admin()
    superAdmin.id = 1
    superAdmin.name = '超级管理员'
    superAdmin.username = 'admin'
    superAdmin.password = hashSync('admin')
    await superAdmin.save()

    // 普通管理员
    const admin = new Admin()
    admin.id = 2
    admin.name = '普通管理员'
    admin.username = 'user'
    admin.password = hashSync('user')
    await admin.save()
  }

  /**
   * 创建管理员角色,用户角色
   */
  private async createDefaultRole() {
    // 管理员角色
    const role = new Role()
    role.id = 1
    role.name = 'admin'
    await role.save()

    // 用户角色
    const user = new Role()
    user.id = 2
    user.name = 'user'
    await user.save()

    const userRole = new AdminRole()
    userRole.admin_id = 2
    userRole.role_id = 2
    await userRole.save()
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
    menu1.name = '管理员管理'
    menu1.url = '/admin'
    menu1.icon = 'icon-admin'
    menu1.parent_id = 1
    menuArray.push(menu1)

    const menu2 = new Menu()
    menu2.id = 3
    menu2.name = '组织管理'
    menu2.url = '/group'
    menu2.icon = 'icon-role'
    menu2.parent_id = 1
    menuArray.push(menu2)

    const menu3 = new Menu()
    menu3.id = 4
    menu3.name = '角色管理'
    menu3.url = '/role'
    menu3.icon = 'icon-access'
    menu3.parent_id = 1
    menuArray.push(menu3)

    await Menu.save(menuArray)
  }

  /**
   * 初始化组织
   */
  private async initGroup() {
    const group = new Group()
    group.id = 1
    group.name = '管理部'
    await group.save()

    const groupRole = new GroupRole()
    groupRole.group_id = 1
    groupRole.role_id = 2
    await groupRole.save()

    const userGroup = new AdminGroup()
    userGroup.admin_id = 2
    userGroup.group_id = 1
    await userGroup.save()
  }

}
