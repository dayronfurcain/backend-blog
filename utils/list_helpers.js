const dummy = ({ blogs }) => {
  return 1
}

const totalLikes = ({ blogs }) => {
  const totalLikes = blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)

  return totalLikes
}

const favoriteBlog = ({ blogs }) => {
  const initialBlog = { title: '', author: '', likes: 0 }

  const searchFavoriteBlog = (favoriteBlog, blog) => {
    if (favoriteBlog.likes < blog.likes) {
      const { title, author, likes } = blog
      return { title, author, likes }
    }

    return favoriteBlog
  }

  const blog = blogs.reduce(searchFavoriteBlog, initialBlog)

  return blog
}

const mostBlogs = ({ blogs }) => {
  let newBlogs = [...blogs]

  const blogsByAuthor = blogs.reduce((acc, blog) => {
    const { author } = blog

    const isAuthor = newBlogs.some((blog) => blog.author === author)

    if (isAuthor) {
      const blogsByAuthor = newBlogs.filter(
        (blog) => blog.author === author
      ).length

      newBlogs = newBlogs.filter((blog) => blog.author !== author)
      acc.push({ author, blogs: blogsByAuthor })
    }

    return acc
  }, [])

  const initialValue = blogsByAuthor[0]

  return blogsByAuthor.reduce((acc, blog) => {
    if (blog.blogs > acc.blogs) return blog
    return acc
  }, initialValue)
}

const mostLikes = ({ blogs }) => {
  let newBlogs = [...blogs]

  const likesByAuthor = blogs.reduce((acc, blog) => {
    const { author } = blog

    const isAuthor = newBlogs.some((blog) => blog.author === author)

    if (isAuthor) {
      const liskesByAuthor = newBlogs.reduce((sum, blog) => {
        if (blog.author === author) {
          return sum + blog.likes
        }
        return sum
      }, 0)

      newBlogs = newBlogs.filter((blog) => blog.author !== author)
      acc.push({ author, likes: liskesByAuthor })
    }

    return acc
  }, [])

  const initialValue = likesByAuthor[0]

  return likesByAuthor.reduce((acc, blog) => {
    if (blog.likes > acc.likes) return blog
    return acc
  }, initialValue)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
