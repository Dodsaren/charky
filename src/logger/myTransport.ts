import fs from 'fs'
import { once } from 'events'
export default async (options: { destination: fs.PathLike }) => {
  const stream = fs.createWriteStream(options.destination)
  // awaiting for open is not strictly necessary
  await once(stream, 'open')
  return stream
}
