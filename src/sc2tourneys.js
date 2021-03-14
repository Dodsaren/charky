const fetch = require('node-fetch')
const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')

const fourtyeight = 48 * 60 * 60 * 1000
const twentyfour = 24 * 60 * 60 * 1000
let tourneys = []
updateTourneys()

async function updateTourneys() {
  const now = new Date()
  const year = now.getFullYear()
  const responses = await Promise.all([
    fetch('https://liquipedia.net/starcraft2/Major_Tournaments'),
    fetch('https://liquipedia.net/starcraft2/Premier_Tournaments'),
  ])
  const htmls = await Promise.all(responses.map((x) => x.text()))
  tourneys = parseHtmls(htmls, year)
}

function parseHtmls(htmls, year) {
  return htmls
    .reduce((p, html) => {
      const $ = cheerio.load(html)
      cheerioTableparser($)
      return [
        ...p,
        ...parseTableData(
          $(`#${year}`).parent().next().parsetable(false, false, true),
          year,
        ),
      ]
    }, [])
    .sort((a, b) => a.date - b.date)
}

function parseTableData(table, year) {
  const startDateStrings = table.find((x) => x[0].toLowerCase() === 'start')
  const tournaments = table.find((x) => x[0].toLowerCase() === 'tournament')
  return startDateStrings.reduce((p, c, i) => {
    const date = new Date(`${c} ${year}Z`)
    if (isDateTodayOrFuture(date)) {
      return [...p, { date: date, tourney: tournaments[i] }]
    }
    return p
  }, [])
}

function presenter() {
  const now = new Date()
  return tourneys
    .reduce((p, c) => {
      if (isDateToday(c.date)) {
        p = [...p, `Idag börjar ${c.tourney}, :partying_face: :beer: :popcorn:`]
      }
      if (c.date - now <= twentyfour) {
        p = [...p, `Imorgon börjar ${c.tourney}`]
      }
      if (c.date - now <= fourtyeight) {
        p = [
          ...p,
          `Dags att ta ledigt från kneget, bara två dar kvar till ${c.tourney}`,
        ]
      }
      return p
    }, [])
    .join('\n')
}

function isDateToday(date) {
  const now = new Date()
  return (
    date.getUTCDate() === now.getUTCDate() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCFullYear() === now.getUTCFullYear()
  )
}

function isDateTodayOrFuture(date) {
  const now = new Date()
  return date > now || isDateToday(date)
}

module.exports = {
  updateTourneys,
  presenter,
}
