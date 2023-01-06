import logger from './logger'
import fetch from 'node-fetch'
const { GIPHY_API_KEY } = process.env
const baseUrl = 'https://api.giphy.com'

const buildQueryString = (obj: Record<string, string | number>) =>
  Object.entries(obj).reduce(
    (p, [k, v]) =>
      p === ''
        ? `?${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        : `${p}&${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
    '',
  )

const request = (path: string) => fetch(baseUrl + path)

const getRandom = async (searchTerm: string, randomness = 100) => {
  if (!GIPHY_API_KEY) {
    throw new Error('GIPHY_API_KEY is not set')
  }
  const queryString = buildQueryString({
    api_key: GIPHY_API_KEY,
    q: searchTerm,
    limit: 1,
    offset: Math.floor(Math.random() * Math.floor(randomness)),
  })
  const response = await request(`/v1/gifs/search${queryString}`)
  const json = await response.json().then((x) => x.data.shift())
  logger.info('got random gif from giphy, query:', json.embed_url)
  return json.embed_url
}

export default {
  getRandom,
}
