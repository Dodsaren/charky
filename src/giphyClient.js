const fetch = require('node-fetch')
const { GIPHY_API_KEY } = process.env
const baseUrl = 'https://api.giphy.com'

const buildQueryString = (obj) =>
  Object.entries(obj).reduce(
    (p, [k, v]) => (p === '' ? `?${k}=${v}` : `${p}&${k}=${v}`),
    '',
  )

const request = (path) => fetch(baseUrl + path)

exports.getRandom = async (searchTerm, randomness = 100) => {
  const queryString = buildQueryString({
    api_key: GIPHY_API_KEY,
    q: searchTerm,
    limit: 1,
    offset: Math.floor(Math.random() * Math.floor(randomness)),
  })
  const response = await request(`/v1/gifs/search${queryString}`)
  const json = await response.json().then((x) => x.data.shift())
  return json.embed_url
}
