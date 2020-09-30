const { checkInput, parseWho, parseWhen, parseWhat } = require('./remind')

const msgMock = {
  author: {
    id: 123,
  },
}

describe('remind', () => {
  describe('checkInput', () => {
    it('should throw if string is incorrectly formatted', () => {
      const input = 'I am an incorrect formatted string'
      expect(() => {
        checkInput(input)
      }).toThrow('bad input')
    })
    it('should return true if good input', () => {
      const input = '!påminn mig att säga hej om 3h'
      expect(checkInput(input)).toEqual(true)
    })
  })
  describe('parseWho', () => {
    it('should save the user as who if input is "mig"', () => {
      const input = '!påminn mig att "säga hej" om 3h'
      const result = parseWho(input, msgMock.author.id)
      expect(result).toEqual('<@123>')
    })
    it('should handle multiple words as who', () => {
      const input = '!påminn kalle karlsson att "säga hej" om 3h'
      const result = parseWho(input)
      expect(result).toEqual('kalle karlsson')
    })
    it('should return @here when input is "alla"', () => {
      const input = '!påminn alla att "säga hej" om 3h'
      const result = parseWho(input)
      expect(result).toEqual('@here')
    })
  })
  describe('parseWhat', () => {
    it('should grab text between "att" and the last occurrance of "om"', () => {
      const input = '!påminn alla att säga hej om de är riktigt glada om 3h'
      const result = parseWhat(input)
      expect(result).toEqual('säga hej om de är riktigt glada')
    })
    it('should ignore "att" after first "att"', () => {
      const input = '!påminn alla att skratta om 3h'
      const result = parseWhat(input)
      expect(result).toEqual('skratta')
    })
  })
  describe('parseWhen', () => {
    it('should parse when', () => {
      const input = '!påminn alla att säga hej om de är riktigt glada om 1h'
      const result = parseWhen(input)
      expect(result).toEqual(3600000)
    })
  })
})
