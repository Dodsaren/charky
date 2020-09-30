const key = '!påminn'
const getArgumentsString = (str) => str.substring(str.indexOf(key) + key.length)

exports.checkInput = (str) => {
  const match = str.match(/!påminn .+ att .+ om \d+[y|M|w|d|h|m|s]/g)
  if (!match) {
    throw new Error('bad input')
  }
  return true
}

exports.parseWho = (str, username) => {
  const argsString = getArgumentsString(str)
  const who = argsString.split('att')[0].trim()
  if (who === 'mig') {
    return `<@${username}>`
  }
  if (who === 'alla') {
    return '@here'
  }
  return who
}

exports.parseWhat = (str) => {
  const argsString = getArgumentsString(str)
  const argsSubstring = argsString.substring(argsString.indexOf('att') + 3)
  const what = argsSubstring
    .substring(0, argsSubstring.lastIndexOf('om'))
    .trim()
  return what
}

exports.parseWhen = (str) => {
  const argsString = getArgumentsString(str)
  const durationString = argsString
    .slice(argsString.lastIndexOf('om') + 2)
    .trim()
  const matches = durationString.match(/(\d+[y|M|w|d|h|m|s])/g)
  return matches.reduce((p, c) => {
    const number = parseInt(c, 10)
    if (c.endsWith('s')) {
      return p + number * 1000
    }
    if (c.endsWith('m')) {
      return p + number * 1000 * 60
    }
    if (c.endsWith('h')) {
      return p + number * 1000 * 60 * 60
    }
    if (c.endsWith('d')) {
      return p + number * 1000 * 60 * 60 * 24
    }
    if (c.endsWith('w')) {
      return p + number * 1000 * 60 * 60 * 24 * 7
    }
    if (c.endsWith('M')) {
      return p + number * 1000 * 60 * 60 * 24 * 7 * 30
    }
    if (c.endsWith('y')) {
      return p + number * 1000 * 60 * 60 * 24 * 7 * 365
    }
    return p
  }, 0)
}

exports.remind = (msg) => {
  const { content, author } = msg
  if (content.endsWith('!påminn') && content.length === '!påminn'.length) {
    return 'Ofullständigt kommando, förgör avsändaren. Prova: "!påminn mig att steka fläskkotlett om 1m30s"'
  }
  try {
    exports.checkInput(content)
  } catch (err) {
    console.log(err)
    return 'Bad input'
  }
  const who = exports.parseWho(content, author.id)
  const what = exports.parseWhat(content)
  const when = exports.parseWhen(content)
  return new Promise((resolve) => {
    msg.reply(`Påminnelse inprogrammerad i main frame. Påminner om ${when} ms!`)
    setTimeout(() => {
      resolve(`Påminnelse till ${who}, glöm inte att ${what}`)
    }, when)
  })
}
