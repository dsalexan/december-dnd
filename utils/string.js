/* eslint-disable no-extend-native */
String.prototype.uppercaseFirst =
  String.prototype.uppercaseFirst ||
  function() {
    const str = this.toString()
    if (str.length === 0) return str
    if (str.length === 1) return str.charAt(0).toUpperCase()
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

String.prototype.lowercaseFirst =
  String.prototype.lowercaseFirst ||
  function() {
    const str = this.toString()
    if (str.length === 0) return str
    if (str.length === 1) return str.charAt(0).toLowerCase()
    return str.charAt(0).toLowerCase() + str.slice(1)
  }

// Certain minor words should be left lowercase unless they are the first or last words in the string
// const TITLE_LOWER_WORDS = [
//   'A',
//   'An',
//   'The',
//   'And',
//   'But',
//   'Or',
//   'For',
//   'Nor',
//   'As',
//   'At',
//   'By',
//   'For',
//   'From',
//   'In',
//   'Into',
//   'Near',
//   'Of',
//   'On',
//   'Onto',
//   'To',
//   'With'
// ]
// // Certain words such as initialisms or acronyms should be left uppercase
// const TITLE_UPPER_WORDS = ['Id', 'Tv', 'Dm']
String.prototype.toTitleCase =
  String.prototype.toTitleCase ||
  function() {
    const str = this.replace(/([^\W_]+[^\s-/]*) */g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })

    // TODO: Rever isso aqui, comentei pq em nenhum lugar existiam os _RE
    // if (!_TITLE_LOWER_WORDS_RE) {
    //   _TITLE_LOWER_WORDS_RE = TITLE_LOWER_WORDS.map((it) => new RegExp(`\\s${it}\\s`, 'g'))
    // }

    // for (let i = 0; i < TITLE_LOWER_WORDS.length; i++) {
    //   str = str.replace(_TITLE_LOWER_WORDS_RE[i], (txt) => {
    //     return txt.toLowerCase()
    //   })
    // }

    // if (!_TITLE_UPPER_WORDS_RE) {
    //   _TITLE_UPPER_WORDS_RE = TITLE_UPPER_WORDS.map((it) => new RegExp(`\\b${it}\\b`, 'g'))
    // }

    // for (let i = 0; i < TITLE_UPPER_WORDS.length; i++) {
    //   str = str.replace(_TITLE_UPPER_WORDS_RE[i], TITLE_UPPER_WORDS[i].toUpperCase())
    // }

    return str
  }

String.prototype.toSentenceCase =
  String.prototype.toSentenceCase ||
  function() {
    const out = []
    const re = /([^.!?]+)([.!?]\s*|$)/gi
    let m
    do {
      m = re.exec(this)
      if (m) {
        out.push(m[0].toLowerCase().uppercaseFirst())
      }
    } while (m)
    return out.join('')
  }

String.prototype.toSpellCase =
  String.prototype.toSpellCase ||
  function() {
    return this.toLowerCase().replace(
      // eslint-disable-next-line max-len
      /(^|of )(bigby|otiluke|mordenkainen|evard|hadar|agatys|abi-dalzim|aganazzar|drawmij|leomund|maximilian|melf|nystul|otto|rary|snilloc|tasha|tenser|jim)('s|$| )/g,
      (...m) => `${m[1]}${m[2].toTitleCase()}${m[3]}`
    )
  }

String.prototype.toCamelCase =
  String.prototype.toCamelCase ||
  function() {
    return this.split(' ')
      .map((word, index) => {
        if (index === 0) return word.toLowerCase()
        return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
      })
      .join('')
  }

String.prototype.escapeQuotes =
  String.prototype.escapeQuotes ||
  function() {
    return this.replace(/'/g, `&apos;`).replace(/"/g, `&quot;`)
  }

String.prototype.unescapeQuotes =
  String.prototype.unescapeQuotes ||
  function() {
    return this.replace(/&apos;/g, `'`).replace(/&quot;/g, `"`)
  }

String.prototype.encodeApos =
  String.prototype.encodeApos ||
  function() {
    return this.replace(/'/g, `%27`)
  }

/**
 * Calculates the Damerau-Levenshtein distance between two strings.
 * https://gist.github.com/IceCreamYou/8396172
 */
String.prototype.distance =
  String.prototype.distance ||
  function(target) {
    const source = this
    let i
    let j
    if (!source) return target ? target.length : 0
    else if (!target) return source.length

    const m = source.length
    const n = target.length
    const INF = m + n
    const score = new Array(m + 2)
    const sd = {}
    for (i = 0; i < m + 2; i++) score[i] = new Array(n + 2)
    score[0][0] = INF
    for (i = 0; i <= m; i++) {
      score[i + 1][1] = i
      score[i + 1][0] = INF
      sd[source[i]] = 0
    }
    for (j = 0; j <= n; j++) {
      score[1][j + 1] = j
      score[0][j + 1] = INF
      sd[target[j]] = 0
    }

    for (i = 1; i <= m; i++) {
      let DB = 0
      for (j = 1; j <= n; j++) {
        const i1 = sd[target[j - 1]]
        const j1 = DB
        if (source[i - 1] === target[j - 1]) {
          score[i + 1][j + 1] = score[i][j]
          DB = j
        } else {
          score[i + 1][j + 1] = Math.min(score[i][j], Math.min(score[i + 1][j], score[i][j + 1])) + 1
        }
        score[i + 1][j + 1] = Math.min(
          score[i + 1][j + 1],
          score[i1] ? score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) : Infinity
        )
      }
      sd[source[i - 1]] = i
    }
    return score[m + 1][n + 1]
  }

String.prototype.isNumeric =
  String.prototype.isNumeric ||
  function() {
    return !isNaN(parseFloat(this)) && isFinite(this)
  }

String.prototype.last =
  String.prototype.last ||
  function() {
    return this[this.length - 1]
  }

String.prototype.escapeRegexp =
  String.prototype.escapeRegexp ||
  function() {
    return this.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  }

String.prototype.toUrlified =
  String.prototype.toUrlified ||
  function() {
    return encodeURIComponent(this).toLowerCase()
  }

Array.prototype.joinConjunct =
  Array.prototype.joinConjunct ||
  function(joiner, lastJoiner, nonOxford) {
    if (this.length === 0) return ''
    if (this.length === 1) return this[0]
    if (this.length === 2) return this.join(lastJoiner)
    else {
      let outStr = ''
      for (let i = 0; i < this.length; ++i) {
        outStr += this[i]
        if (i < this.length - 2) outStr += joiner
        else if (i === this.length - 2) outStr += `${!nonOxford && this.length > 2 ? joiner.trim() : ''}${lastJoiner}`
      }
      return outStr
    }
  }
