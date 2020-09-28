exports.checkInput = (str) => {
  const match = str.match(/!påminn .+ att .+ om \d+[y|M|w|d|h|m|s]/g)
  if (!match) {
    throw new Error('bad input')
  }
  return true
}

exports.parseWho = (str, username) => {
  const args = str.split('!påminn')
  const who = args[1].split('att')[0].trim()
  if (who === 'mig') {
    return `@<${username}>`
  }
  if (who === 'alla') {
    return '@here'
  }
  return who
}

exports.parseWhat = (str) => {
  const args = str.split('!påminn')
  const splitAtt = args[1].split('att')
  const what = splitAtt[1].substring(0, splitAtt[1].lastIndexOf('om')).trim()
  return what
}

exports.parseWhen = (str) => {
  const args = str.split('!påminn')
  const durationString = args[1].slice(args[1].lastIndexOf('om') + 2).trim()
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
  try {
    exports.checkInput(content)
  } catch (err) {
    console.log(err)
    return 'Bad input'
  }
  const who = exports.parseWho(content, author.username)
  const what = exports.parseWhat(content)
  const when = exports.parseWhen(content)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Påminnelse till ${who}, glöm inte att ${what}`)
    }, when)
  })
}
