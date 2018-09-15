const regex = /(YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|ms)/

function _getTimestamp(date?, pattern?, useUTC?) {
  if (typeof date === 'string' && !/\d/.test(date)) {
    pattern = date
    date = undefined
  }

  date = date || new Date()

  if (!(date instanceof Date)) date = new Date(date)

  if (isNaN(date)) throw TypeError('参数有问题')

  pattern = pattern || 'YYYY-MM-DD'

  function timestamp() {
    let match = regex.exec(pattern)
    if (match) {
      let increment = method(match[1], useUTC)
      let val = ''
      if (!increment[1]) {
        val = String(date[increment[0]]() + (increment[2] || 0))
      } else {
        val = '00' + (date[increment[0]]() + (increment[2] || 0))
        val = val.slice(-increment[1])
      }
      pattern = pattern.replace(match[0], val)
      timestamp()
    }
  }

  timestamp()
  return pattern
}

function method(key, useUTC) {
  return ({
    YYYY: [useUTC ? 'getUTCFullYear' : 'getFullYear', 4],
    YY: [useUTC ? 'getUTCFullYear' : 'getFullYear', 2],
    MM: [useUTC ? 'getUTCMonth' : 'getMonth', 2, 1],
    M: [useUTC ? 'getUTCMonth' : 'getMonth', false, 1],
    DD: [useUTC ? 'getUTCDate' : 'getDate', 2],
    D: [useUTC ? 'getUTCDate' : 'getDate', false],
    HH: [useUTC ? 'getUTCHours' : 'getHours', 2],
    H: [useUTC ? 'getUTCHours' : 'getHours', false],
    mm: [useUTC ? 'getUTCMinutes' : 'getMinutes', 2],
    m: [useUTC ? 'getUTCMinutes' : 'getMinutes', false],
    ss: [useUTC ? 'getUTCSeconds' : 'getSeconds', 2],
    s: [useUTC ? 'getUTCSeconds' : 'getSeconds', false],
    ms: [useUTC ? 'getUTCMilliseconds' : 'getMilliseconds', 3],
  })[key]
}

function DateFormat(date?, pattern?) {
  return _getTimestamp(date, pattern, false)
}

function DateFormatUTC(date?, pattern?) {
  return _getTimestamp(date, pattern, true)
}

export {DateFormat, DateFormatUTC}
