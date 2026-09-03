export const parsePolymarketUrl = (url: string) => {
  if (url === undefined) return null;
  const match = url.match(/polymarket\.com\/(market|event|[^/]*)\/(.+\/)*([^?#]+)$/)
  if (!match) return null

  if (match[1] === 'event' && match[2] !== undefined) {
    return {type: 'market', slug: match[3]}
  }

  return {type: match[1], slug: match[3]}
}

export const parseIfString = (value: string | string[] | undefined) => {
  return typeof value === 'string' ? JSON.parse(value) : value
}
