import { expect, test } from 'vitest'

test('add 1 + 2 = 3', () => {
  expect((1 + 2)).toBe(3)
})

test('subtract 100 - 50 = 50', () => {
    expect((100 -50)).toBe(50)
})

test('Concat: James Barbour', () => {
    expect((`James` + `Barbour`)).toBe(`JamesBarbour`)
})