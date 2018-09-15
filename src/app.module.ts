import {HttpModule, Module, OnModuleInit} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserController} from './controller/user.controller'
import {UserService} from './service/user.service'
import {DBConfig} from './config/db.config'
import {User} from './entity/user.entity'
import {UserRepository} from './repository/user.repository'
import {ModulesContainer} from '@nestjs/core/injector'
import {MetadataScanner} from '@nestjs/core/metadata-scanner'
import {WxModule} from './modules/wxModule/wx.module'
import {Connection, In, Not} from 'typeorm'
import {Resource} from './entity/resource.entity'
import {Permission} from './entity/permission.entity'
import {Role} from './entity/role.entity'
import {RESOURCE_DEFINITION} from './common/decorator/resource.decorator'
import {PERMISSION_DEFINITION} from './common/decorator/permission.decorator'
import {AdminController} from './controller/admin.controller'

@Module({
  imports: [
    TypeOrmModule.forRoot(DBConfig),
    TypeOrmModule.forFeature([User, UserRepository, Resource, Permission, Role]),
    HttpModule,
    WxModule,
  ],
  controllers: [
    UserController,
    AdminController,
  ],
  providers: [
    UserService,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly metadataScanner: MetadataScanner = new MetadataScanner()

  constructor(
    private readonly connection: Connection,
    private readonly modulesContainer: ModulesContainer,
  ) {
  }

  async onModuleInit() {
    await this.loadResourcesAndPermissions()
  }

  /**
   * 加载资源、权限注解，并将其保存到数据库
   */
  async loadResourcesAndPermissions() {
    // 开启事务
    await this.connection.transaction(async entityManager => {
      const resourceRepository = entityManager.getRepository(Resource)
      const permissionRepository = entityManager.getRepository(Permission)

      // 资源唯一标识数组
      const resources: Resource[] = []
      // 权限唯一标识数组
      const permissions: Permission[] = []
      // 遍历模块
      this.modulesContainer.forEach((moduleValue) => {
        // 遍历模块路由,获取控制器
        moduleValue.routes.forEach(routeValue => {
          // 获取资源
          const scanResource = Reflect.getMetadata(RESOURCE_DEFINITION, routeValue.metatype)
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
      if (resources.find(resource => !resource.identify)) throw new TypeError('identify is null')
      // 查询不存在的资源
      const notExistResources = await resourceRepository.find({where: {identify: Not(In(resources.map(v => v.identify)))}})
      // 清除不存在的资源
      if (notExistResources.length) await resourceRepository.remove(notExistResources)
      // 查询不存在的权限
      const notExistPermissions = await permissionRepository.find({where: {identify: Not(In(permissions.map(v => v.identify)))}})
      // 清除不存在的权限
      if (notExistResources.length) await permissionRepository.remove(notExistPermissions)

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

      // 更新权限的资源对象
      permissions.forEach(permission => permission.resource = existResources.find(resource => resource.identify === permission.resource.identify))
      // 查询存在的权限
      const existPermissions = await permissionRepository.find()
      // 存在权限唯一标识数组
      const existPermissionIdentifies = existPermissions.map(permission => permission.identify)
      // 找出新的权限
      const newPermissions = permissions.filter(permission => existPermissionIdentifies.indexOf(permission.identify) === -1)
      // 保存新的权限
      if (newPermissions.length) await permissionRepository.insert(newPermissions)
      // 更新已存在的权限
      existPermissions.forEach(permission => {
        const newPermission = permissions.find(v => v.identify === permission.identify)
        permission.name = newPermission.name
        permission.action = newPermission.action
      })
      // 保存更新的权限
      await permissionRepository.save(existPermissions)
    })
  }
}
