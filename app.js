/**
 * Node.js 脚本，服务端脚本
 */

const http = require('http')
const fs = require('fs')
const mime = require('mime')
const artTemplate = require('art-template')
const queryString = require('querystring')
const comment = require('./comment.js')

const comments = [{
    id: 1,
    name: '张三',
    content: '今天天气不错'
  },
  {
    id: 2,
    name: '张三2',
    content: '今天天气不错'
  },
  {
    id: 3,
    name: '张三丰',
    content: '今天天气不错'
  }
]

// 当前这个案例的功能没有问题，但是代码结构不好，callback hell 嵌套的太多，不利于阅读

http
  .createServer((req, res) => {
    // / index.html
    // /fabiao fabiao.html
    const url = req.url // 请求路径
    const method = req.method.toLowerCase() // 请求方法，我们可以利用不同的请求方法让同一个 url 使用多次

    // 我们约定，只要是你以 /public/ 开头的，我就去程序中自动找这个文件，如果有就发送给客户端，如果没有就发送 404
    // /public/css/main.css
    // /public/js/main.js
    // /public/img/ab2.jpg
    // 请求日志记录
    console.log(method, url)

    // /public/css/main.css
    // /public/js/main.js
    // /public/img/ab2.jpg

    if (method === 'get' && url === '/') {
      // 异步的
      fs.readFile('./views/index.html', (err, tplData) => {
        if (err) {
          return res.end('404 Not Found.')
        }

        // 自己封装的回调函数
        // 调用 comment.findAll 方法 ，获取所有的 comments 数据
        comment.findAll((err, comments) => {
          if (err) {
            return res.end('404 Not Found.')
          }
          const htmlStr = artTemplate.render(tplData.toString(), {
            comments: comments
          })

          // 没有请求就没有响应
          // Error: Can't set headers after they are sent.
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(htmlStr)
        })

      })
    } else if (method === 'get' && url === '/fabiao') {
      // 异步的
      fs.readFile('./views/fabiao.html', (err, data) => {
        if (err) {
          return res.end('404 Not Found.')
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(data)
      })
    } else if (method === 'get' && (url.startsWith('/public/') || url.startsWith('/node_modules/'))) {
      // 我们在服务端把 public 目录给公开出来了（支持像你的 Apache 服务器一样来请求里面的资源）
      // 在文件操作中，路径开头的 / 表示的磁盘根目录
      // 在 / 前面加上一个点儿就是相对路径
      const filePath = `.${url}`
      // ./public/css/main.css
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return res.end('404 Not Found.')
        }

        // 使用第三方包 mime 处理 Content-Type 问题（根据文件后缀名动态获取 Content-Type）
        res.setHeader('Content-Type', mime.getType(filePath))
        res.end(data)
      })
    } else if (method === 'post' && url === '/fabiao') {
      // 1. 接收表单 POST 请求体数据
      // 2. 使用核心模块 querystring 的 parse 方法将查询字符串转换为对象
      // 3. 校验客户端提交的表单数据
      // 4. 校验通过，将数据添加到数组中存储起来
      // 5. 数据保存完毕，发送重定向，让客户端跳转到 / 首页

      // 1. 接收表单 POST 请求体数据
      // 1.1 定义数据存储变量
      let rawData = ''

      // 1.2 监听 data 事件，把 chunk 拼接到 rawData 中
      // data 事件可能执行一次，也可以能执行 n 次，取决于客户端提交的数据量大小
      req.on('data', chunk => {
        // 每当 data 事件被触发， 回调函数就会收到一个数据块
        // 为了得到完整的数据，所以每当接收到一个数据块，我就把它拼接到 data 中
        rawData += chunk
      })

      // 1.3 在 end 事件，我们就可以使用接收完毕的 rawData 数据了
      // 当 end 事件触发执行，则意味着你的 data 接收完毕了
      req.on('end', () => {
        // 2. 使用核心模块 querystring 的 parse 方法将查询字符串转换为对象
        const bodyData = queryString.parse(rawData)

        // 3. 校验客户端提交的表单数据
        //  永远不要相信客户端的输入（因为客户端表单校验是不稳定的）

        // 3.1 校验 name 是否可用
        if (!bodyData.name || !bodyData.name.length) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end('name 不能为空')
        }

        // 3.2 校验 content 是否可用
        if (!bodyData.content || !bodyData.content.length) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end('contet 不能为空')
        }

        // 4. 校验通过，将数据添加到数组中存储起来
        // comments.push({
        //   id: comments[comments.length - 1].id + 1,
        //   name: bodyData.name,
        //   content: bodyData.content
        // })

        // 封装的回调函数
        comment.save(bodyData, err => {
          if (err) {
            return res.end('500 err')
          }
          res.statusCode = 302
          res.setHeader('Location', '/')
          res.end() // 没有响应数据也要结束响应
        })

        // 4. 将数据持久化存储到 db.json 文件中
        // fs.readFile('./db.json', (err, dbData) => {
        //   if (err) {
        //     return res.end('404 Not Found.')
        //   }
        //   dbData = JSON.parse(dbData.toString())
          
        //   // 添加到内存对象中
        //   dbData.comments.push({
        //     id: dbData.comments[dbData.comments.length - 1].id + 1,
        //     name: bodyData.name,
        //     content: bodyData.content
        //   })
          
        //   // 把 comments 重新写到 db.json 中才能真的持久化
        //   fs.writeFile('./db.json', JSON.stringify(dbData, null, 4), err => {
        //     if (err) {
        //       return res.end('500 Server Error')
        //     }
        //     // 5. 数据保存完毕，发送重定向，让客户端跳转到 / 首页
        //     res.statusCode = 302
        //     res.setHeader('Location', '/')
        //     res.end() // 没有响应数据也要结束响应
        //   })
        // })
      })
    } else {
      res.end('404 Not Found.')
    }
  })
  .listen(3000, () => {
    console.log('running...')
  })
