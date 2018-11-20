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
  clear_admin_redis_permissions(id) {
    redis.del(`permissions_${id}`)
  }

}
