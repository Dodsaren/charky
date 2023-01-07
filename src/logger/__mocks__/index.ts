import { vi } from 'vitest'

export default {
  info: () => vi.fn(),
  error: () => vi.fn(),
  debug: () => vi.fn(),
}
