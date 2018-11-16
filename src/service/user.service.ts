import {Injectable} from '@nestjs/common'
import {User} from '../entity/auth_user.entity'
import {Connection} from 'typeorm'
import {Menu} from '../entity/auth_menu.entity'
import {ErrorException, user_not_found} from '../common/exceptions/error.exception'

@Injectable()
export class UserService {

  constructor(private readonly connection: Connection) {
  }

  // 登录
  login(username) {
    return this.connection.getRepository(User).findOne({
      select: ['id', 'username', 'password', 'status'],
      where: {username},
    })
  }

  // 查询用户所有菜单
  async getRoleMenu(id) {
    const result = await this.connection.getRepository(User).findOne(id, {
      select: ['id'],
      relations: ['roles', 'roles.menus'],
    })

    if (!result) throw  new ErrorException(user_not_found)

    let arr: Menu[] = []
    for (let i = 0; i < result.roles.length; i++) {
      arr = arr.concat(result.roles[i].menus)
    }

    const arrId: any = []
    const list: Menu[] = []
    for (let i = 0; i < arr.length; i++) {
      if (!arrId.includes(arr[i].id)) {
        arrId.push(arr[i].id)
        list.push(arr[i])
      }
    }

    const menus: Menu[] = []

    // 一级菜单
    for (let i = 0; i < list.length; i++) {
      if (list[i].parent_id === 1) {
        list[i]['menus'] = []

        // 二级菜单
        for (let j = 0; j < list.length; j++) {
          if (list[i].id === list[j].parent_id) {
            list[j]['menus'] = []

            // 三级菜单
            for (let k = 0; k < list.length; k++) {
              if (list[j].id === list[k].parent_id) list[j]['menus'].push(list[k])
            }

            list[i]['menus'].push(list[j])
          }
        }

        menus.push(list[i])
      }
    }

    return menus
  }

}
