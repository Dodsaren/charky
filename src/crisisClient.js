const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const template = fs.readFileSync(path.join(__dirname, 'crisis.md')).toString()

exports.feed = async () => {
  const response = await fetch(
    'https://api.krisinformation.se/v2/aggregatedfeed',
  )
  return await response.json()
}

exports.render = (crisers) =>
  template.replace(
    '{{replace}}',
    crisers.reduce((p, c) => {
      const d = new Date(c.Updated)
      const ds = d.toLocaleDateString('se-SV')
      const ts = d.toLocaleTimeString('se-SV', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return (
        p + `\n${ds} ${ts} - **${c.Headline}**\n${c.Preamble}\n<${c.Web}>\n`
      )
    }, ''),
  )

// function dateToUtc(date) {
//   return Date.UTC(
//     date.getUTCFullYear(),
//     date.getUTCMonth(),
//     date.getUTCDate(),
//     date.getUTCHours(),
//     date.getUTCMinutes(),
//     date.getUTCSeconds(),
//   )
// }
