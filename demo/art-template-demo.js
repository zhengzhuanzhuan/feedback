const artTemplate = require('art-template')
const fs = require('fs')

fs.readFile('./tpl.html', (err, data) => {
  if (err) {
    return console.log('读取模板文件失败')
  }
  const str = artTemplate.render(data.toString(), {
    name: 'Jack',
    fruits: ['苹果', '香蕉']
  })

  console.log(str)
})






// const artTemplate = require('art-template')

// const str = artTemplate.render(`
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
// <title>Document</title>
// </head>

// <body>
//   <h1>hello <%= name %></h1>
//   <ul>
//     <% for (var i = 0; i < fruits.length; i++) { %>
//       <li><%= fruits[i] %></li>
//     <% } %>
//   </ul>
// </body>
// </html>
// `, {
//   name: 'Jack',
//   fruits: ['苹果', '香蕉']
// })

// console.log(str)
