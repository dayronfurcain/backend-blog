const { test, after, beforeEach, describe, afterEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier property is "id"', async () => {
  const response = await api.get('/api/blogs')
  const blogAtStart = response.body[0]
  const keys = Object.keys(blogAtStart)

  assert(keys.includes('id'))
})

test('add one blog to database', async () => {
  const newUser = {
    name: 'Martin Gutierres',
    password: 'martin',
    username: 'martin'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const { username, password } = newUser

  let response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = response.body

  const newBlog = {
    title: 'New blog',
    author: newUser.name,
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/new_blog.html',
    likes: 6
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()

  response = await api.get('/api/blogs')

  const urls = response.body.map((blog) => blog.url)

  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)

  assert(
    urls.includes(
      'http://blog.cleancoder.com/uncle-bob/2016/05/01/new_blog.html'
    )
  )
})

test('do not have likes the blog', async () => {
  const newUser = {
    name: 'Martin Gutierres',
    password: 'martin',
    username: 'martin'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const { username, password } = newUser

  let response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = response.body

  const newBlog = {
    title: 'Blog 2',
    author: newUser.name,
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/Blog_2.html'
  }

  response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('without properties title or url the blog is not added', async () => {
  const newUser = {
    name: 'Martin Gutierres',
    password: 'martin',
    username: 'martin'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const { username, password } = newUser

  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = response.body

  const newBlog = {
    author: newUser.name,
    likes: 6
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogs = await helper.blogsInDb()
  assert.strictEqual(blogs.length, helper.initialBlogs.length)
})

test('delete a blog', async () => {
  const newUser = {
    name: 'Martin Gutierres',
    password: 'martin',
    username: 'martin'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const { username, password } = newUser

  let response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = response.body

  const newBlog = {
    title: 'New blog',
    author: newUser.name,
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/new_blog.html',
    likes: 6
  }

  response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  await api
    .delete(`/api/blogs/${response.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

  const urls = blogsAtEnd.map((blog) => blog.url)
  assert(!urls.includes(newBlog.url))
})

test('update a blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const { id, ...rest } = blogToUpdate

  const updatedBlog = { ...rest, likes: blogToUpdate.likes + 1 }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

  const blog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
  assert.strictEqual(blog.likes, blogToUpdate.likes + 1)
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation fails if username or password have least 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'r1',
      name: 'Superuser1',
      password: 'sa'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(
      result.body.error.includes(
        'password and username must have least 3 characters'
      )
    )

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

afterEach(async () => {
  await User.deleteMany({})
})

after(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await mongoose.connection.close()
})
