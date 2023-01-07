import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import getPatchNotes from './csPatchNoteClient'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

vi.mock('../logger')

const assertions = {
  link: 'https://blog.counter-strike.net/index.php/2022/09/39497/',
  pubDateString: 'Wed, 07 Sep 2022 23:06:32 +0000',
  longer: `<p>[ MAPS ]</p>
  <p>Anubis<br />
  &#8211; Added a hip cover on the plateau near B main.<br />
  &#8211; Clipped the large stone cover on CT mid for smoother movement.<br />
  &#8211; Added a scaffolding on A catwalk to prevent the boost through the window to T stair at the canal. (Thanks poseidonskiy rofls).<br />
  &#8211; Allowed players to silently drop down from A long.<br />
  &#8211; Fixed stones colliding with the tarp on A catwalk.<br />
  &#8211; Removed stone at A sewer.<br />
  &#8211; Aligned floating pillar on A with the floor.<br />
  &#8211; Removed left-over clips on A main. (Thanks Hentie!).<br />
  &#8211; Removed clips on the stairs that bounce off grenades (Thanks Guidetti &#038; dr!zzle).<br />
  &#8211; Clipping improvements (Thanks dr!zzle!).<br />
  &#8211; Cleaned up clipping under the bridge (Thanks Fnugz for your sacrifice).</p>
  <p>Blagai<br />
  &#8211; Fixed pixelwalk on window frame (thanks Kerr).<br />
  &#8211; Increased C4 explosion radius.<br />
  &#8211; Fixed various visual bugs.</p>
  <p>Cascade<br />
  &#8211; Added back a few visual details; ToOpenGL fix shouldn&#8217;t be affected; FPS sacrifice is minimal.<br />
  &#8211; Angled ladder in lower main; gives cover to Ts and worsens it as a camping spot for CTs.<br />
  &#8211; Clipping fixes.<br />
  &#8211; Removed self-boost in upper main near the bridge.</p>
  <p>Ember<br />
  &#8211; Renamed Crater to Water Tower.<br />
  &#8211; A new water tower has been erected at Water Tower.<br />
  &#8211; Changed doors used throughout the map.<br />
  &#8211; Added sounds when doors are opened and closed.<br />
  &#8211; Gave cannons a new particle effect when firing.<br />
  &#8211; Fixed situation where cannonball may not damage players.<br />
  &#8211; Actually fixed cannons icon this time.<br />
  &#8211; Fixed weapon crate ammo spawning in floor near Apartments.<br />
  &#8211; Fixed lots of minor bugs (thanks Joaokaka1998).</p>`,
}

const mockData = (longy = '') => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/" xmlns:georss="http://www.georss.org/georss" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#">

  <channel>
    <title>Updates &#8211; Counter-Strike: Global Offensive</title>
    <atom:link href="https://blog.counter-strike.net/index.php/category/updates/feed/" rel="self" type="application/rss+xml" />
    <link>https://blog.counter-strike.net</link>
    <description></description>
    <lastBuildDate>Fri, 09 Sep 2022 16:00:16 +0000</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod>
	hourly	</sy:updatePeriod>
    <sy:updateFrequency>
	1	</sy:updateFrequency>


    <image>
      <url>https://s0.wp.com/i/webclip.png</url>
      <title>Updates &#8211; Counter-Strike: Global Offensive</title>
      <link>https://blog.counter-strike.net</link>
      <width>32</width>
      <height>32</height>
    </image>
    <cdn>/media.steampowered.com/media.st.dl.eccdnx.com/</cdn>
    <cdn>/broadcast.steampowered.com/broadcast.st.dl.eccdnx.com/</cdn>
    <cdn>/steamcdn-a.akamaihd.net/media.st.dl.eccdnx.com/</cdn>
    <test>/ignore me/caching test/</test>
    <site xmlns="com-wordpress:feed-additions:1">155055202</site>
    <item>
      <title>Release Notes for 9/7/2022</title>
      <link>${assertions.link}</link>

      <dc:creator>
        <![CDATA[csgo_brian]]>
      </dc:creator>
      <pubDate>${assertions.pubDateString}</pubDate>
      <guid isPermaLink="false">https://blog.counter-strike.net/?p=39497</guid>

      <description>
        <![CDATA[[ MISC ] &#8211; Improved Steam Input support for mouse and keyboard input on Steam Deck. &#8211; Improved game startup I/O to reduce game launch time. &#8211; Improved user interface flow when cycling through weapon case items in Agent View (thanks, @AquaIsMissing and @_ale_cs). &#8211; Fixed an incorrect inventory limit warning shown to users with [&#8230;]]]>
      </description>
      <content:encoded>
        <![CDATA[<p>[ MISC ]<br />
&#8211; Improved Steam Input support for mouse and keyboard input on Steam Deck.<br />
&#8211; Improved game startup I/O to reduce game launch time.<br />
&#8211; Improved user interface flow when cycling through weapon case items in Agent View (thanks, @AquaIsMissing and @_ale_cs).<br />
&#8211; Fixed an incorrect inventory limit warning shown to users with many items in Storage Units.<br />
&#8211; Fixed an exploit that would allow the player&#8217;s camera to become detached from their eye position.</p>
${longy}
]]>
      </content:encoded>


      <post-id xmlns="com-wordpress:feed-additions:1">39497</post-id>
    </item>
  </channel>
</rss>`

const server = setupServer()

beforeAll(() => {
  vi.useFakeTimers()
  server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => {
  vi.useRealTimers()
  server.close()
})

afterEach(() => {
  server.resetHandlers()
})

describe('csPatchNoteClient.getPatchNotes', () => {
  it('should return link if content ends up being more than 2000 characters long', async () => {
    server.use(
      rest.get(
        'https://blog.counter-strike.net/index.php/category/updates/feed/',
        (_req, res, ctx) =>
          res(ctx.status(200), ctx.xml(mockData(assertions.longer))),
      ),
    )
    const date = new Date(assertions.pubDateString)
    vi.setSystemTime(date)
    const result = await getPatchNotes()
    expect(result?.[0]).toEqual('cs parre -> ' + assertions.link)
  })

  it('should return a patch note block text thing if content under 2000 characters', async () => {
    server.use(
      rest.get(
        'https://blog.counter-strike.net/index.php/category/updates/feed/',
        (_req, res, ctx) => res(ctx.status(200), ctx.xml(mockData())),
      ),
    )
    const date = new Date(assertions.pubDateString)
    vi.setSystemTime(date)
    const result = await getPatchNotes()
    expect(result?.[0]?.substring(0, 3)).toEqual('```')
    expect(result?.[0]?.slice(-3)).toEqual('```')
    expect(result?.[0]?.length).toBeGreaterThan(10)
    expect(result?.[0]).toContain(
      'Improved game startup I/O to reduce game launch time.',
    )
  })

  // TODO
  // Prevent logs in test output.
  // Test for statuses other than 200
})
