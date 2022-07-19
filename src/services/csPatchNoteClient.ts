import { codeBlock } from '@discordjs/builders'
import { ChildNode } from 'domhandler'
import { decode } from 'html-entities'
import { parseDocument } from 'htmlparser2'
import fetch, { Headers } from 'node-fetch'
import RssParser from 'rss-parser'
import logger from '../logger'
import redisClient from './redisClient'

async function getPatchNotes() {
  const etag = await redisClient.get('csPatchNotesEtag')
  const headers = new Headers()
  if (etag) {
    headers.set('If-None-Match', etag)
  }
  const res = await fetch(
    'https://blog.counter-strike.net/index.php/category/updates/feed/',
    {
      headers,
    },
  )
  logger('CS:GO patch notes fetched with status', res.status)
  if (res.status === 304) {
    return
  }
  if (res.status !== 200) {
    throw new Error(`Failed to fetch patch notes: ${res.status}`)
  }
  const etagHeader = res.headers.get('etag')
  if (etagHeader) {
    await redisClient.set('csPatchNotesEtag', etagHeader)
  }
  const text = await res.text()
  let parser = new RssParser()
  const feed = await parser.parseString(text)
  const minusOneHour = new Date()
  minusOneHour.setHours(minusOneHour.getHours() - 1)
  const patchNotesBlocks = feed.items
    .filter((x) => x.pubDate && new Date(x.pubDate) > minusOneHour)
    .map((item) => {
      const d = item.pubDate ? new Date(item.pubDate) : new Date()
      return codeBlock(
        `CS:GO patch notes ${d.toLocaleString('sv-SE')} \n\n${extract(
          parseDocument(decodeURIComponent(decode(item['content:encoded'])))
            .children,
        )}`,
      )
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
