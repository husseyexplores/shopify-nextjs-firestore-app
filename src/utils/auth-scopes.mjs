// @ts-check

/**
 * `shopify-api-js` stores the scopes in session
 * but only stores the compressed scopes.
 * compressed scopes are the scopes that are not implied
 * for example, given scopes are: read_content,write_content`
 *  - `read_content` is implied
 *  - `write_content` is compressed (i.e not implied)
 *
 * `write` means `read` is implied
 */

/**
 * A number, or a string containing a number.
 * @typedef {{ set: Set<string>, list: string[] }} ScopeParsed
 */

/**
 * Parses a string or array of strings into compressed and expanded scopes,
 * filtering out implied scopes.
 *
 * For example, in `read_content,write_content`, `read_content` is implied.
 * The compressed result will be `write_content`
 *
 * @param {string | string[]} inputScopes - The string or array of strings to parse.
 * @returns {{ compressed: ScopeParsed, expanded: ScopeParsed }}
 */
function parse(inputScopes) {
  const scopes = (
    typeof inputScopes === 'string' ? inputScopes.split(',') : inputScopes
  )
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)

  const impliedScopes = getImpliedScopes(scopes)

  const scopeSet = new Set(scopes)
  const impliedSet = new Set(impliedScopes)

  const compressedScopes = new Set(
    [...scopeSet].filter((x) => !impliedSet.has(x)),
  )
  const expandedScopes = new Set([...scopeSet, ...impliedSet])

  return {
    compressed: {
      set: compressedScopes,
      list: [...compressedScopes],
    },
    expanded: {
      set: expandedScopes,
      list: [...expandedScopes],
    },
  }
}

/**
 * Returns an array of implied read scopes based on the provided write scopes.
 *
 * @param {string[]} scopes - An array of write scopes.
 * @return {string[]} An array of implied read scopes.
 */
function getImpliedScopes(scopes) {
  /** @type {string[]} */
  const init = []

  return scopes.reduce((array, current) => {
    const matches = current.match(/^(unauthenticated_)?write_(.*)$/) || []
    if (matches) {
      array.push(`${matches[1] ? matches[1] : ''}read_${matches[2]}`)
    }

    return array
  }, init)
}

/**
 * Compares two scopes and returns true if they are equal.
 *
 * @param {string[] | string} a - The first value to compare.
 * @param {string[] | string} b - The second value to compare.
 * @return {boolean} Returns true if the two values are equal, and false otherwise.
 */
function equals(a, b) {
  const _a = parse(a)
  const _b = parse(b)

  return (
    _a.compressed.set.size === _b.compressed.set.size &&
    _a.compressed.list.every((x) => _b.compressed.set.has(x))
  )
}

export { parse, getImpliedScopes, equals }
