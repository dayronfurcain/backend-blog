const { describe, test } = require('node:test')
const assert = require('node:assert')

const listHelpers = require('../utils/list_helpers')

const { blogs } = require('../utils/consts')

describe('favorite blog', () => {
  test('the favorite blog is the one with the most likes', () => {
    const result = listHelpers.favoriteBlog({ blogs })
    assert.deepStrictEqual(result, {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })
})
