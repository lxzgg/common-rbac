import {Injectable} from '@nestjs/common'
import {Menu} from '../entity/auth_menu.entity'
import {Admin} from '../entity/auth_admin.entity'
import {ErrorException, user_not_found} from '../common/exceptions/error.exception'

@Injectable()
export class MenuService {

  // 查询所有菜单
  getMenuAll() {
    return Menu.find({
      where: {parent_id: 1},
      order: {order: 'ASC'},
      relations: ['menus', 'menus.menus'],
    })
  }

  // 查询用户所有菜单
  async getRoleMenu(id) {
    const result = await Admin.findOne(id, {
      select: ['id'],
      relations: ['roles', 'roles.menus', 'groups', 'groups.roles', 'groups.roles.menus'],
    })

    if (!result) throw  new ErrorException(user_not_found)

    // 合并数组
    let arr: Menu[] = []
    result.roles.forEach(role => {
      arr = arr.concat(role.menus)
    })
    result.groups.forEach(Group => {
      Group.roles.forEach(role => {
        arr = arr.concat(role.menus)
      })
    })

    if (!arr.length) return []

    // 对象去重
    const arrId: any = []
    const list: Menu[] = []
    for (let i = 0; i < arr.length; i++) {
      if (!arrId.includes(arr[i].id)) {
        arrId.push(arr[i].id)
        list.push(arr[i])
      }
    }

    // 生成三级菜单
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

    // 冒泡排序(根据order排序)
    for (let i = 0; i < menus.length; i++) {
      for (let j = 0; j < menus.length; j++) {
        if (menus[j + 1] && menus[j].order > menus[j + 1].order) {
          const temp = menus[j]
          menus[j] = menus[j + 1]
          menus[j + 1] = temp
        }
      }
    }

    return menus
  }

  // 菜单管理
  menuSort(menus) {
    return Menu.save(menus)
  }

}
