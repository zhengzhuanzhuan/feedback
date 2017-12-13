const fs = require('fs')

const dbPath = './db.json'

/**
 * 让该文件只做一件事儿：
 *   提供对 db.json 文件操作的业务方法
 */

/**
 * 提供一个获取所有 comments 数据方法
 * 返回值：comments 数组
 */
exports.findAll = (callback) => {
  fs.readFile(dbPath, (err, data) => {
    if (err) {
      // 出错
      // 从封装角度，如果你失败了你别自己处理
      // 你把失败也告诉我
      // 错了，只需要传递一个参数 err 即可
      // 第二个参数，undefined
      return callback(err)
    }
    const comments = JSON.parse(data.toString()).comments
    callback(null, comments)
  })
}

// 如果想要得到一个函数中异步操作的结果，必须是通过回调函数来获取
exports.save = (bodyData, callback) => {
  fs.readFile(dbPath, (err, data) => {
    if (err) {
      return callback(err)
    }
    const dbData = JSON.parse(data.toString())
    const comments = dbData.comments
    bodyData.id = comments[comments.length - 1].id + 1
    comments.push(bodyData)

    const dbDataStr = JSON.stringify(dbData)

    fs.writeFile(dbPath, dbDataStr, err => {
      if (err) {
        return callback(err)
      }
      callback(null)
    })
  })
}

// function getTimeoutRet() {
//   setTimeout(function () {
//     // data
//     const data = 123
//   }, 1000)
// }

// getTimeoutRet()


/**
 * 提供一个添加数据到 commetns 持久化保存的方法
 */
