const arr = new Array(100).map((_, index) => index + 1)

export default (length: number) => {
  if (length < 1 || length > 100) {
    throw new Error('Length must be between 1 and 100')
  }
  return arr.sort(() => Math.random() - 0.5).slice(0, length)
}
