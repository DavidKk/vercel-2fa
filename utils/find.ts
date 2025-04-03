export function fuzzySearch(input: string, target: string) {
  const pattern = input.split('').join('.*')
  const regex = new RegExp(pattern, 'i')
  return regex.test(target)
}
