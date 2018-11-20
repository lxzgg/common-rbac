import {Injectable} from '@nestjs/common'
import {redis} from '../config/db.config'

@Injectable()
export class CommonService {

  // 清除redis所有缓存的权限
  clear_redis_permissions() {
    redis.keys('permissions_*').then(keys => {
      if (keys.length) redis.del.apply(redis, keys)
    })
  }

  // 清除管理员redis缓存的权限
  clear_redis_admin_permissions(id) {
    redis.del(`permissions_${id}`)
  }

  // 清除管理员redis缓存的密码版本
  clear_redis_password_version(id) {
    redis.del(`password_version_${id}`)
  }

}
