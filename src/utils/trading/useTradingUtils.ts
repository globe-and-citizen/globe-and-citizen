export const parsePolymarketUrl = (url: string) => {
  const match = url.match(/polymarket\.com\/(market|event)\/([^?#]+)/)
  if (!match) return null
  return { type: match[1], slug: match[2] }
}
export const parseIfString = (value: string | string[] | undefined) => {
  return typeof value === 'string' ? JSON.parse(value) : value
}
