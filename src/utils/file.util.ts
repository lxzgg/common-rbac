import {existsSync, mkdirSync} from 'fs'
import {dirname} from 'path'

export class FileUtil {

  /**
   * 递归创建目录
   * @returns {boolean}
   * @param dir
   */
  static mkdirSync(dir) {
    if (existsSync(dir)) {
      return true
    } else {
      if (this.mkdirSync(dirname(dir))) {
        mkdirSync(dir)
        return true
      }
    }
  }

}
