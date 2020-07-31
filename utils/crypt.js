/* eslint-disable prettier/prettier */
// region md5 internals
// stolen from http://www.myersdaily.org/joseph/javascript/md5.js
function _md5cycle(x, k) {
  let a = x[0]
  let b = x[1]
  let c = x[2]
  let d = x[3]

  a = _ff(a, b, c, d, k[0], 7, -680876936)
  d = _ff(d, a, b, c, k[1], 12, -389564586)
  c = _ff(c, d, a, b, k[2], 17, 606105819)
  b = _ff(b, c, d, a, k[3], 22, -1044525330)
  a = _ff(a, b, c, d, k[4], 7, -176418897)
  d = _ff(d, a, b, c, k[5], 12, 1200080426)
  c = _ff(c, d, a, b, k[6], 17, -1473231341)
  b = _ff(b, c, d, a, k[7], 22, -45705983)
  a = _ff(a, b, c, d, k[8], 7, 1770035416)
  d = _ff(d, a, b, c, k[9], 12, -1958414417)
  c = _ff(c, d, a, b, k[10], 17, -42063)
  b = _ff(b, c, d, a, k[11], 22, -1990404162)
  a = _ff(a, b, c, d, k[12], 7, 1804603682)
  d = _ff(d, a, b, c, k[13], 12, -40341101)
  c = _ff(c, d, a, b, k[14], 17, -1502002290)
  b = _ff(b, c, d, a, k[15], 22, 1236535329)

  a = _gg(a, b, c, d, k[1], 5, -165796510)
  d = _gg(d, a, b, c, k[6], 9, -1069501632)
  c = _gg(c, d, a, b, k[11], 14, 643717713)
  b = _gg(b, c, d, a, k[0], 20, -373897302)
  a = _gg(a, b, c, d, k[5], 5, -701558691)
  d = _gg(d, a, b, c, k[10], 9, 38016083)
  c = _gg(c, d, a, b, k[15], 14, -660478335)
  b = _gg(b, c, d, a, k[4], 20, -405537848)
  a = _gg(a, b, c, d, k[9], 5, 568446438)
  d = _gg(d, a, b, c, k[14], 9, -1019803690)
  c = _gg(c, d, a, b, k[3], 14, -187363961)
  b = _gg(b, c, d, a, k[8], 20, 1163531501)
  a = _gg(a, b, c, d, k[13], 5, -1444681467)
  d = _gg(d, a, b, c, k[2], 9, -51403784)
  c = _gg(c, d, a, b, k[7], 14, 1735328473)
  b = _gg(b, c, d, a, k[12], 20, -1926607734)

  a = _hh(a, b, c, d, k[5], 4, -378558)
  d = _hh(d, a, b, c, k[8], 11, -2022574463)
  c = _hh(c, d, a, b, k[11], 16, 1839030562)
  b = _hh(b, c, d, a, k[14], 23, -35309556)
  a = _hh(a, b, c, d, k[1], 4, -1530992060)
  d = _hh(d, a, b, c, k[4], 11, 1272893353)
  c = _hh(c, d, a, b, k[7], 16, -155497632)
  b = _hh(b, c, d, a, k[10], 23, -1094730640)
  a = _hh(a, b, c, d, k[13], 4, 681279174)
  d = _hh(d, a, b, c, k[0], 11, -358537222)
  c = _hh(c, d, a, b, k[3], 16, -722521979)
  b = _hh(b, c, d, a, k[6], 23, 76029189)
  a = _hh(a, b, c, d, k[9], 4, -640364487)
  d = _hh(d, a, b, c, k[12], 11, -421815835)
  c = _hh(c, d, a, b, k[15], 16, 530742520)
  b = _hh(b, c, d, a, k[2], 23, -995338651)

  a = _ii(a, b, c, d, k[0], 6, -198630844)
  d = _ii(d, a, b, c, k[7], 10, 1126891415)
  c = _ii(c, d, a, b, k[14], 15, -1416354905)
  b = _ii(b, c, d, a, k[5], 21, -57434055)
  a = _ii(a, b, c, d, k[12], 6, 1700485571)
  d = _ii(d, a, b, c, k[3], 10, -1894986606)
  c = _ii(c, d, a, b, k[10], 15, -1051523)
  b = _ii(b, c, d, a, k[1], 21, -2054922799)
  a = _ii(a, b, c, d, k[8], 6, 1873313359)
  d = _ii(d, a, b, c, k[15], 10, -30611744)
  c = _ii(c, d, a, b, k[6], 15, -1560198380)
  b = _ii(b, c, d, a, k[13], 21, 1309151649)
  a = _ii(a, b, c, d, k[4], 6, -145523070)
  d = _ii(d, a, b, c, k[11], 10, -1120210379)
  c = _ii(c, d, a, b, k[2], 15, 718787259)
  b = _ii(b, c, d, a, k[9], 21, -343485551)

  x[0] = _add32(a, x[0])
  x[1] = _add32(b, x[1])
  x[2] = _add32(c, x[2])
  x[3] = _add32(d, x[3])
}

function _cmn(q, a, b, x, s, t) {
  a = _add32(_add32(a, q), _add32(x, t))
  return _add32((a << s) | (a >>> (32 - s)), b)
}

function _ff(a, b, c, d, x, s, t) {
  return _cmn((b & c) | (~b & d), a, b, x, s, t)
}

function _gg(a, b, c, d, x, s, t) {
  return _cmn((b & d) | (c & ~d), a, b, x, s, t)
}

function _hh(a, b, c, d, x, s, t) {
  return _cmn(b ^ c ^ d, a, b, x, s, t)
}

function _ii (a, b, c, d, x, s, t) {
  return _cmn(c ^ (b | ~d), a, b, x, s, t)
}

function _md51(s) {
  const n = s.length
  const state = [1732584193, -271733879, -1732584194, 271733878]
  let i
  for (i = 64; i <= s.length; i += 64) {
    _md5cycle(state, _md5blk(s.substring(i - 64, i)))
  }
  s = s.substring(i - 64)
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3)
  tail[i >> 2] |= 0x80 << (i % 4 << 3)
  if (i > 55) {
    _md5cycle(state, tail)
    for (i = 0; i < 16; i++) tail[i] = 0
  }
  tail[14] = n * 8
  _md5cycle(state, tail)
  return state
}

function _md5blk(s) {
  const md5blks = []
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
  }
  return md5blks
}

const _hex_chr = '0123456789abcdef'.split('')

function _rhex(n) {
  let s = ''
  for (let j = 0; j < 4; j++) {
    s += _hex_chr[(n >> (j * 8 + 4)) & 0x0F] + _hex_chr[(n >> (j * 8)) & 0x0F]
  }
  return s
}

function _add32(a, b) {
  return (a + b) & 0xFFFFFFFF
}
// endregion

export function hex(x) {
  for (let i = 0; i < x.length; i++) {
    x[i] = _rhex(x[i])
  }
  return x.join('')
}

export function hex2Dec(hex) {
  return parseInt(`0x${hex}`)
}

export function md5(s) {
  return hex(_md51(s))
}

/**
 * Based on Java's implementation.
 * @param obj An object to hash.
 * @return {*} An integer hashcode for the object.
 */
export function hashCode(obj) {
  if (typeof obj === 'string') {
    if (!obj) return 0
    let h = 0
    for (let i = 0; i < obj.length; ++i) h = 31 * h + obj.charCodeAt(i)
    return h
  } else if (typeof obj === 'number') return obj
  else throw new Error(`No hashCode implementation for ${obj}`)
}

export function uid() {
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  if (typeof window !== "undefined" && typeof window.crypto !== "undefined") {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  } else {
    let d = Date.now()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }
}

export default {
  hex, hex2Dec, md5, hashCode, uid
}