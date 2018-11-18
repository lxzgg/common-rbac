import {Injectable} from '@nestjs/common'
import {Connection} from 'typeorm'
import {redis} from '../config/db.config'

@Injectable()
export class CommonService {

  constructor(private readonly connection: Connection) {
  }

  // 清除redis所有缓存的权限
  clear_redis_permissions() {
    redis.keys('permissions_*').then(keys => {
      if (keys.length) redis.del.apply(redis, keys)
    })
  }

}
