const { test, describe } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helpers')

const { blogs } = require('../utils/consts')

describe('most blogs', () => {
  test('return the author with most blogs', () => {
    const result = listHelper.mostBlogs({ blogs })
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})
