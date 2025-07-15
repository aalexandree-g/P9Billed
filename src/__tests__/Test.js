/**
 * @jest-environment jsdom
 */

describe('test', () => {
    it(('should be true'), () => {
      const abc = true
      expect(abc).toBe(true)
    })
  })