import * as pathToRegexp from 'path-to-regexp'

describe('redis', () => {

  it('path', function () {
    let regexp = pathToRegexp('/admin/:id*')
    console.log(regexp)
    console.log(regexp.test('/admin/dwad1231231/adfsadf/dfsdfdsgf/dgdsg'))
  })

})
