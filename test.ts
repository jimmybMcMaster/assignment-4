export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export function concat(str1: string, str2: string): string {
  return str1 + str2
}

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest
  
  test('add 1 + 2 = 3', () => {
    expect(add(1, 2)).toBe(3) 
  })
  
  test('subtract 100 - 50 = 50', () => {
    expect(subtract(100, 50)).toBe(50)
  })
  
  test('Concat: James Barbour', () => {
    expect(concat('James', 'Barbour')).toBe('JamesBarbour')
  })
}