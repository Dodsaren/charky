var i = 0
module.exports = (msg, ...args) => {
  const d = new Date()
  const color = i % 2 === 0 ? '33m' : '36m'
  console.log(
    `\x1b[35m%s\x1b[${color} %s\x1b[0m`,
    d.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' }),
    msg,
    ...args,
  )
  i++
}
