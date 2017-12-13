

function getTimeoutRet(callback) {
  setTimeout(function () {
    const data = 123
    callback(data)
  }, 1000)
}

getTimeoutRet(function (data) {
  console.log(data)
})


