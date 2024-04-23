const { blogs } = require('../utils/consts')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = blogs.map((blog) => {
  const { title, author, likes, url } = blog
  return { title, author, likes, url }
})

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Test Blog',
    likes: 6,
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/Test_Blog.html',
    author: 'Martin Gutierres'
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = { initialBlogs, blogsInDb, nonExistingId, usersInDb }
