const fetch = require('node-fetch')

async function crisis() {
  const response = await fetch(
    'http://api.krisinformation.se/v1/feed?format=json',
  )
  const json = await response.json()
  const { Entries } = json
  const utcNow = Date.now()
  const entries = Entries.reduce((p, c) => {
    const utcDate = dateToUtc(new Date(c.Published))
    if (utcNow - 1000 * 60 * 60 * 24 > utcDate) {
      return p
    }
    const output = `${new Date(c.Published).toLocaleDateString()} - **${
      c.Title
    }**
    *${c.Summary}*`
    return [...p, output]
  }, [])

  if (entries.length < 1) {
    return 'de inge kris! :sweat_smile:'
  }

  return `
  >>> __***de kris***__

  ${entries.join('\n\n')}

  `
}

function dateToUtc(date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
}

module.exports = crisis
