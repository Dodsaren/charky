const Discord = require('discord.js')
const fetch = require('node-fetch')
require('dotenv').config()
const client = new Discord.Client()
const { BOT_SECRET_TOKEN, NASA_API_KEY } = process.env

client.login(BOT_SECRET_TOKEN)

client.on('ready', () => {
  console.log('Connected as ' + client.user.tag)
})

const commandMap = {
  '!ping': () => 'pong!',
  '!utbud': commandList,
  '!apod': apod,
  '!roll': roll,
  '!korv': () => 'https://loremflickr.com/320/240/hotdog',
}

client.on('message', async msg => {
  const command = commandMap[msg]
  if (command) {
    const response = await command()
    msg.reply(response)
  }
})

function commandList() {
  return `\n${Object.keys(commandMap).join('\n')}`
}

async function apod() {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
  const response = await fetch(url)
  const json = await response.json()
  return json.hdurl + `\n${json.explanation}`
}

function roll() {
  return Math.floor(Math.random() * Math.floor(20))
}
