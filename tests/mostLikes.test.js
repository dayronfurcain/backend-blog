const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helpers')

const { blogs } = require('../utils/consts')

describe('most likes', () => {
  test('return the author with most likes', () => {
    const result = listHelper.mostLikes({ blogs })
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})
