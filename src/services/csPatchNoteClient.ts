import { codeBlock } from '@discordjs/builders'
import { ChildNode } from 'domhandler'
import { decode } from 'html-entities'
import { parseDocument } from 'htmlparser2'
import fetch from 'node-fetch'
import RssParser from 'rss-parser'
import logger from '../logger'

async function getPatchNotes() {
  const res = await fetch(
    'https://blog.counter-strike.net/index.php/category/updates/feed/',
  )
  logger.info('CS:GO patch notes fetched with status %s', res.status)
  if (res.status !== 200) {
    throw new Error(`Failed to fetch patch notes: ${res.status}`)
  }
  const text = await res.text()
  const parser = new RssParser()
  const feed = await parser.parseString(text)
  const minusOneHour = new Date()
  minusOneHour.setHours(minusOneHour.getHours() - 1)
  const patchNotesBlocks = feed.items
    .filter((x) => x.pubDate && new Date(x.pubDate) > minusOneHour)
    .map((item) => {
      const d = item.pubDate ? new Date(item.pubDate) : new Date()
      const str = codeBlock(
        `CS:GO patch notes ${d.toLocaleString('sv-SE')} \n\n${extract(
          parseDocument(decodeURIComponent(decode(item['content:encoded'])))
            .children,
        )}`,
      )
      return str.length > 2000 ? `cs parre -> ${item.link}` : str
    })
  return patchNotesBlocks.reverse()
}

function extract(nodes: ChildNode[]): string {
  return nodes.reduce((p, c) => {
    if (c.type === 'text') {
      p += c.data
    }
    if (c.type === 'tag') {
      p += extract(c.children)
      if (c.name === 'p') {
        p += '\n'
      }
    }
    return p
  }, '')
}

export default getPatchNotes
