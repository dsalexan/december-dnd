/* eslint-disable import/no-named-as-default-member */
import RenderUtil from './util'
import { $ } from './constants'
import { warn, error } from '~/utils/debug'
import MiscUtil from '@/utils/misc'
import { sort } from '~/utils/sort'
import { encodeForHash } from '~/utils/data/url'
import { PAGES, LIVE_5E_TOOLS_URL as BASE_URL } from '~/utils/data/constants'
import { SOURCES } from '~/utils/system/constants'
// eslint-disable-next-line no-unused-vars
import { SKILLS, SENSES, CR } from '~/utils/system'

// eslint-disable-next-line no-unused-vars
const IMGUR_CLIENT_ID = `abdea4de492d3b0`

const HASH_PART_SEP = ','
const HASH_LIST_SEP = '_'
const HASH_SUB_LIST_SEP = '~'
// eslint-disable-next-line no-unused-vars
const HASH_SUB_KV_SEP = ':'
// eslint-disable-next-line no-unused-vars
const HASH_SUBCLASS = 'sub:'
const HASH_BLANK = 'blankhash'
// eslint-disable-next-line no-unused-vars
const HASH_SUB_NONE = 'null'

// eslint-disable-next-line no-unused-vars
const CLSS_NON_STANDARD_SOURCE = 'spicy-sauce'
// eslint-disable-next-line no-unused-vars
const CLSS_HOMEBREW_SOURCE = 'refreshing-brew'
// eslint-disable-next-line no-unused-vars
const CLSS_SUBCLASS_FEATURE = 'subclass-feature'
const CLSS_HASH_FEATURE_KEY = 'f'
// eslint-disable-next-line no-unused-vars
const CLSS_HASH_FEATURE = `${CLSS_HASH_FEATURE_KEY}:`

const MON_HASH_SCALED = 'scaled'

// eslint-disable-next-line no-unused-vars
const ATB_DATA_LIST_SEP = '||'
// eslint-disable-next-line no-unused-vars
const ATB_DATA_PART_SEP = '::'
// eslint-disable-next-line no-unused-vars
const ATB_DATA_SC = 'data-subclass'
// eslint-disable-next-line no-unused-vars
const ATB_DATA_SRC = 'data-source'

// eslint-disable-next-line no-unused-vars
const STR_CANTRIP = 'Cantrip'
// eslint-disable-next-line no-unused-vars
const STR_NONE = 'None'
// eslint-disable-next-line no-unused-vars
const STR_ANY = 'Any'
// eslint-disable-next-line no-unused-vars
const STR_SPECIAL = 'Special'

// eslint-disable-next-line no-unused-vars
const HOMEBREW_STORAGE = 'HOMEBREW_STORAGE'
// eslint-disable-next-line no-unused-vars
const HOMEBREW_META_STORAGE = 'HOMEBREW_META_STORAGE'
// eslint-disable-next-line no-unused-vars
const EXCLUDES_STORAGE = 'EXCLUDES_STORAGE'
// eslint-disable-next-line no-unused-vars
const DMSCREEN_STORAGE = 'DMSCREEN_STORAGE'
// eslint-disable-next-line no-unused-vars
const ROLLER_MACRO_STORAGE = 'ROLLER_MACRO_STORAGE'
// eslint-disable-next-line no-unused-vars
const ENCOUNTER_STORAGE = 'ENCOUNTER_STORAGE'
// eslint-disable-next-line no-unused-vars
const POINTBUY_STORAGE = 'POINTBUY_STORAGE'

// eslint-disable-next-line no-unused-vars
const JSON_HOMEBREW_INDEX = `homebrew/index.json`

/**
 * Helper function to render an entity using this renderer
 * @param entry
 * @param depth
 * @returns {string}
 */
export function render(entry, depth = 0) {
  let tempStack = []
  recursiveRender(entry, tempStack, { depth })
  // return tempStack.join('')
  if (tempStack.length > 1) {
    console.warn('Como eh um objeto com tamanho >= 2?')
    debugger
  }
  tempStack = tempStack.flat(1)

  if (tempStack.length > 1) {
    console.warn('Como eh um objeto com tamanho >= 2?')
    debugger
  }
  return tempStack[0]
}

/**
 * Recursively walk down a tree of "entry" JSON items, adding to a stack of strings to be finally rendered to the
 * page. Note that this function does _not_ actually do the rendering, see the example code above for how to display
 * the result.
 *
 * @param entry An "entry" usually defined in JSON. A schema is available in tests/schema
 * @param textStack A reference to an array, which will hold all our strings as we recurse
 * @param meta Meta state.
 * @param meta.depth The current recursion depth. Optional; default 0, or -1 for type "section" entries.
 * @param options Render options.
 * @param options.prefix String to prefix rendered lines with.
 */
function recursiveRender(entry, textStack, meta, options) {
  // respect the API of the original, but set up for using string concatenations

  // Changing to objectStack
  if (textStack.length === 0) textStack[0] = []
  else textStack.reverse()

  // initialise meta
  meta = meta || {}
  meta._typeStack = []
  meta.depth = meta.depth == null ? 0 : meta.depth

  _recursiveRender(entry, textStack, meta, options)
  // if (this._fnPostProcess) textStack[0] = this._fnPostProcess(textStack[0])
  textStack.reverse()
}

/**
 * Inner rendering code. Uses string concatenation instead of an array stack, for ~2x the speed.
 * @param entry As above.
 * @param textStack As above.
 * @param meta As above, with the addition of...
 * @param options
 *          .prefix The (optional) prefix to be added to the textStack before whatever is added by the current call
 *          .suffix The (optional) suffix to be added to the textStack after whatever is added by the current call
 * @private
 */
function _recursiveRender(entry, textStack, meta, options) {
  if (!meta) throw new Error('Missing metadata!')
  if (entry === undefined) return
  if (entry.type === 'section') meta.depth = -1

  options = options || {}

  meta._didRenderPrefix = false
  meta._didRenderSuffix = false

  if (typeof entry === 'object') {
    // the root entry (e.g. "Rage" in barbarian "classFeatures") is assumed to be of type "entries"
    const type = entry.type == null || entry.type === 'section' ? 'entries' : entry.type

    meta._typeStack.push(type)

    switch (type) {
      // recursive
      case 'entries':
        this._renderEntries(entry, textStack, meta, options)
        break
      case 'options':
        this._renderOptions(entry, textStack, meta, options)
        break
      case 'list':
        this._renderList(entry, textStack, meta, options)
        break
      case 'table':
        this._renderTable(entry, textStack, meta, options)
        break
      case 'tableGroup':
        this._renderTableGroup(entry, textStack, meta, options)
        break
      case 'inset':
        this._renderInset(entry, textStack, meta, options)
        break
      case 'insetReadaloud':
        this._renderInsetReadaloud(entry, textStack, meta, options)
        break
      case 'variant':
        this._renderVariant(entry, textStack, meta, options)
        break
      case 'variantSub':
        this._renderVariantSub(entry, textStack, meta, options)
        break
      case 'spellcasting':
        this._renderSpellcasting(entry, textStack, meta, options)
        break
      case 'quote':
        this._renderQuote(entry, textStack, meta, options)
        break
      case 'optfeature':
        this._renderOptfeature(entry, textStack, meta, options)
        break
      case 'patron':
        this._renderPatron(entry, textStack, meta, options)
        break

      // block
      case 'abilityDc':
        this._renderAbilityDc(entry, textStack, meta, options)
        break
      case 'abilityAttackMod':
        this._renderAbilityAttackMod(entry, textStack, meta, options)
        break
      case 'abilityGeneric':
        this._renderAbilityGeneric(entry, textStack, meta, options)
        break

      // inline
      case 'inline':
        this._renderInline(entry, textStack, meta, options)
        break
      case 'inlineBlock':
        this._renderInlineBlock(entry, textStack, meta, options)
        break
      case 'bonus':
        this._renderBonus(entry, textStack, meta, options)
        break
      case 'bonusSpeed':
        this._renderBonusSpeed(entry, textStack, meta, options)
        break
      case 'dice':
        this._renderDice(entry, textStack, meta, options)
        break
      case 'link':
        _renderLink(entry, textStack, meta, options)
        break
      case 'actions':
        this._renderActions(entry, textStack, meta, options)
        break
      case 'attack':
        this._renderAttack(entry, textStack, meta, options)
        break

      // list items
      case 'item':
        this._renderItem(entry, textStack, meta, options)
        break
      case 'itemSub':
        this._renderItemSub(entry, textStack, meta, options)
        break
      case 'itemSpell':
        this._renderItemSpell(entry, textStack, meta, options)
        break

      // entire data records
      case 'dataCreature':
        this._renderDataCreature(entry, textStack, meta, options)
        break
      case 'dataSpell':
        this._renderDataSpell(entry, textStack, meta, options)
        break
      case 'dataTrapHazard':
        this._renderDataTrapHazard(entry, textStack, meta, options)
        break

      // images
      case 'image':
        this._renderImage(entry, textStack, meta, options)
        break
      case 'gallery':
        this._renderGallery(entry, textStack, meta, options)
        break

      // homebrew changes
      case 'homebrew':
        this._renderHomebrew(entry, textStack, meta, options)
        break

      // misc
      case 'code':
        this._renderCode(entry, textStack, meta, options)
        break
      case 'hr':
        this._renderHr(entry, textStack, meta, options)
        break
    }

    meta._typeStack.pop()
  } else if (typeof entry === 'string') {
    // block
    _renderPrefix(entry, textStack, meta, options)
    _renderString(entry, textStack, meta, options)
    _renderSuffix(entry, textStack, meta, options)
  } else {
    // block
    // for ints or any other types which do not require specific rendering
    _renderPrefix(entry, textStack, meta, options)
    _renderPrimitive(entry, textStack, meta, options)
    _renderSuffix(entry, textStack, meta, options)
  }
}

function _renderPrefix(entry, textStack, meta, options) {
  if (meta._didRenderPrefix) return
  if (options.prefix != null) {
    textStack[0].push(options.prefix)
    meta._didRenderPrefix = true
  }
}

function _renderSuffix(entry, textStack, meta, options) {
  if (meta._didRenderSuffix) return
  if (options.suffix != null) {
    textStack[0].push(options.suffix)
    meta._didRenderSuffix = true
  }
}

function _renderString(entry, textStack, meta, options) {
  const tagSplit = RenderUtil.splitByTags(entry)
  const len = tagSplit.length
  for (let i = 0; i < len; ++i) {
    const s = tagSplit[i]
    if (!s) continue
    if (s[0] === '@') {
      const [tag, text] = RenderUtil.splitFirstSpace(s)

      switch (tag) {
        // BASIC STYLES/TEXT ///////////////////////////////////////////////////////////////////////////////
        case '@b':
        case '@bold':
          // EXAMPLE
          _recursiveRender(text, textStack, meta)
          textStack[0][textStack[0].length - 1] = $({
            model: 'component',
            tag: 'b',
            content: textStack[0][textStack[0].length - 1]
          })
          // textStack[0] += `<b>`
          // _recursiveRender(text, textStack, meta)
          // textStack[0] += `</b>`
          break
        case '@i':
        case '@italic':
          textStack[0] += `<i>`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</i>`
          break
        case '@s':
        case '@strike':
          textStack[0] += `<s>`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</s>`
          break
        case '@u':
        case '@underline':
          textStack[0] += `<u>`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</u>`
          break
        case '@note':
          textStack[0] += `<i class="text-muted">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</i>`
          break
        case '@atk':
          textStack[0] += `<i>${RenderUtil.attackTagToFull(text)}</i>`
          break
        case '@h':
          textStack[0] += `<i>Hit:</i> `
          break
        case '@color':
        case '@highlight': {
          warn('BrewUtil not implemented')
          // eslint-disable-next-line no-unused-vars
          const parts = text.split('|')
          const [toDisplay, color] = text.split('|')
          // eslint-disable-next-line no-undef
          const scrubbedColor = BrewUtil.getValidColor(color)

          if (tag === '@color') textStack[0] += `<span style="color: #${scrubbedColor}">`
          else if (tag === '@highlight') textStack[0] += `<span style="background-color: #${scrubbedColor}">`
          else throw new Error(`Unhandled tag!`)

          textStack[0] += toDisplay
          textStack[0] += `</span>`
          break
        }

        // Comic styles ////////////////////////////////////////////////////////////////////////////////////
        case '@comic':
          textStack[0] += `<span class="rd__comic">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</span>`
          break
        case '@comicH1':
          textStack[0] += `<span class="rd__comic rd__comic--h1">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</span>`
          break
        case '@comicH2':
          textStack[0] += `<span class="rd__comic rd__comic--h2">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</span>`
          break
        case '@comicH3':
          textStack[0] += `<span class="rd__comic rd__comic--h3">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</span>`
          break
        case '@comicH4':
          textStack[0] += `<span class="rd__comic rd__comic--h4">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</span>`
          break
        case '@comicNote':
          textStack[0] += `<span class="rd__comic rd__comic--note">`
          _recursiveRender(text, textStack, meta)
          textStack[0] += `</span>`
          break

        // DCs /////////////////////////////////////////////////////////////////////////////////////////////
        case '@dc': {
          textStack[0] += `DC <span class="rd__dc">${text}</span>`
          break
        }

        // DICE ////////////////////////////////////////////////////////////////////////////////////////////
        case '@dice':
        case '@damage':
        case '@hit':
        case '@d20':
        case '@chance':
        case '@recharge': {
          const fauxEntry = {
            type: 'dice',
            rollable: true
          }
          // eslint-disable-next-line no-unused-vars
          const [rollText, displayText, name, ...others] = text.split('|')
          if (displayText) fauxEntry.displayText = displayText
          if (name) fauxEntry.name = name

          switch (tag) {
            case '@dice': {
              // format: {@dice 1d2 + 3 + 4d5 - 6}
              fauxEntry.toRoll = rollText
              if (!displayText && rollText.includes(';')) fauxEntry.displayText = rollText.replace(/;/g, '/')
              if (
                (!fauxEntry.displayText && rollText.includes('#$')) ||
                (fauxEntry.displayText && fauxEntry.displayText.includes('#$'))
              )
                fauxEntry.displayText = (fauxEntry.displayText || rollText).replace(/#\$prompt_number[^$]*\$#/g, '(n)')
              _recursiveRender(fauxEntry, textStack, meta)
              break
            }
            case '@damage': {
              fauxEntry.toRoll = rollText
              fauxEntry.subType = 'damage'
              _recursiveRender(fauxEntry, textStack, meta)
              break
            }
            case '@d20':
            case '@hit': {
              // format: {@hit +1} or {@hit -2}
              const n = Number(rollText)
              const mod = `${n >= 0 ? '+' : ''}${n}`
              fauxEntry.displayText = fauxEntry.displayText || mod
              fauxEntry.toRoll = `1d20${mod}`
              fauxEntry.subType = 'd20'
              fauxEntry.d20mod = mod
              _recursiveRender(fauxEntry, textStack, meta)
              break
            }
            case '@chance': {
              // format: {@chance 25|display text|rollbox rollee name}
              fauxEntry.toRoll = `1d100`
              fauxEntry.successThresh = Number(rollText)
              _recursiveRender(fauxEntry, textStack, meta)
              break
            }
            case '@recharge': {
              // format: {@recharge 4|flags}
              const flags = displayText ? displayText.split('') : null // "m" for "minimal" = no brackets
              fauxEntry.toRoll = '1d6'
              const asNum = Number(rollText || 6)
              fauxEntry.successThresh = 7 - asNum
              fauxEntry.successMax = 6
              textStack[0] += `${flags && flags.includes('m') ? '' : '('}Recharge `
              fauxEntry.displayText = `${asNum}${asNum < 6 ? `\u20136` : ''}`
              _recursiveRender(fauxEntry, textStack, meta)
              textStack[0] += `${flags && flags.includes('m') ? '' : ')'}`
              break
            }
          }

          break
        }

        // SCALE DICE //////////////////////////////////////////////////////////////////////////////////////
        case '@scaledice': {
          // format: {@scaledice 2d6;3d6|2-8,9|1d6}
          const [baseRoll, progression, addPerProgress] = text.split('|')
          const progressionParse = MiscUtil.parseNumberRange(progression, 1, 9)
          const baseLevel = Math.min(...progressionParse)
          const options = {}
          const isMultableDice = /^(\d+)d(\d+)$/i.exec(addPerProgress)

          const getSpacing = () => {
            let diff = null
            const sorted = [...progressionParse].sort(sort)
            for (let i = 1; i < sorted.length; ++i) {
              const prev = sorted[i - 1]
              const curr = sorted[i]
              if (diff == null) diff = curr - prev
              else if (curr - prev !== diff) return null
            }
            return diff
          }

          const spacing = getSpacing()
          progressionParse.forEach((k) => {
            const offset = k - baseLevel
            if (isMultableDice && spacing != null) {
              options[k] = offset ? `${Number(isMultableDice[1]) * (offset / spacing)}d${isMultableDice[2]}` : ''
            } else {
              options[k] = offset ? [...new Array(Math.floor(offset / spacing))].map((_) => addPerProgress).join('+') : ''
            }
          })

          const fauxEntry = {
            type: 'dice',
            rollable: true,
            toRoll: baseRoll,
            displayText: addPerProgress,
            prompt: {
              entry: 'Cast at...',
              options
            }
          }
          _recursiveRender(fauxEntry, textStack, meta)

          break
        }

        // LINKS ///////////////////////////////////////////////////////////////////////////////////////////
        case '@filter': {
          // format: {@filter Warlock Spells|spells|level=1;2|class=Warlock}
          const [displayText, page, ...filters] = text.split('|')

          const fauxEntry = {
            type: 'link',
            text: displayText,
            href: {
              type: 'internal',
              path: `${page}.html`,
              hash: HASH_BLANK,
              hashPreEncoded: true,
              subhashes: filters
                .map((f) => {
                  const [fname, fvals, fopts] = f
                    .split('=')
                    .map((s) => s.trim())
                    .filter((s) => s)
                  const key = fname.startsWith('fb') ? fname : `flst${encodeForHash(fname)}`

                  let value
                  if (fvals.startsWith('[') && fvals.endsWith(']')) {
                    // range
                    const [min, max] = fvals
                      .substring(1, fvals.length - 1)
                      .split(';')
                      .map((it) => it.trim())
                    if (max == null) {
                      // shorthand version, with only one value, becomes min _and_ max
                      value = [`min=${min}`, `max=${min}`].join(HASH_SUB_LIST_SEP)
                    } else {
                      value = [min ? `min=${min}` : '', max ? `max=${max}` : ''].filter(Boolean).join(HASH_SUB_LIST_SEP)
                    }
                  } else {
                    value = fvals
                      .split(';')
                      .map((s) => s.trim())
                      .filter((s) => s)
                      .map((s) => {
                        const spl = s.split('!')
                        if (spl.length === 2) return `${encodeForHash(spl[1])}=2`
                        return `${encodeForHash(s)}=1`
                      })
                      .join(HASH_SUB_LIST_SEP)
                  }

                  const out = {
                    key,
                    value,
                    preEncoded: true
                  }

                  if (fopts) {
                    return [
                      out,
                      {
                        key: `flmt${encodeForHash(fname)}`,
                        value: fopts,
                        preEncoded: true
                      }
                    ]
                  }
                  return out
                })
                .flat()
            }
          }
          _recursiveRender(fauxEntry, textStack, meta)

          break
        }
        case '@link': {
          const [displayText, url] = text.split('|')
          let outUrl = url == null ? displayText : url
          if (!outUrl.startsWith('http')) outUrl = `http://${outUrl}` // avoid HTTPS, as the D&D homepage doesn't support it
          const fauxEntry = {
            type: 'link',
            href: {
              type: 'external',
              url: outUrl
            },
            text: displayText
          }
          _recursiveRender(fauxEntry, textStack, meta)

          break
        }
        case '@5etools': {
          const [displayText, page, hash] = text.split('|')
          const fauxEntry = {
            type: 'link',
            href: {
              type: 'internal',
              path: page
            },
            text: displayText
          }
          if (hash) {
            fauxEntry.hash = hash
            fauxEntry.hashPreEncoded = true
          }
          _recursiveRender(fauxEntry, textStack, meta)

          break
        }

        // OTHER HOVERABLES ////////////////////////////////////////////////////////////////////////////////
        case '@footnote': {
          warn('Renderer.hover was not implemented')
          error('@footnote was not implemented')

          // const [displayText, footnoteText, optTitle] = text.split('|')
          // const hoverMeta = Renderer.hover.getMakePredefinedHover({
          //   type: 'entries',
          //   name: optTitle ? optTitle.toTitleCase() : 'Footnote',
          //   entries: [footnoteText, optTitle ? `{@note ${optTitle}}` : ''].filter(Boolean)
          // })
          // textStack[0] += `<span class="help" ${hoverMeta.html}>`
          // _recursiveRender(displayText, textStack, meta)
          // textStack[0] += `</span>`

          break
        }
        case '@homebrew': {
          const [newText, oldText] = text.split('|')
          const tooltipEntries = []
          if (newText && oldText) {
            tooltipEntries.push('{@b This is a homebrew addition, replacing the following:}')
          } else if (newText) {
            tooltipEntries.push('{@b This is a homebrew addition.}')
          } else if (oldText) {
            tooltipEntries.push('{@b The following text has been removed with this homebrew:}')
          }
          if (oldText) {
            tooltipEntries.push(oldText)
          }
          warn('Renderer.hover was not implemented')
          // const hoverMeta = Renderer.hover.getMakePredefinedHover({
          //   type: 'entries',
          //   name: 'Homebrew Modifications',
          //   entries: tooltipEntries
          // })
          const hoverMeta = { html: '' }
          textStack[0] += `<span class="homebrew-inline" ${hoverMeta.html}>`
          _recursiveRender(newText || '[...]', textStack, meta)
          textStack[0] += `</span>`

          break
        }
        case '@skill':
        case '@sense': {
          // const expander = (() => {
          //   switch (tag) {
          //     case '@skill':
          //       return SKILLS.skillToExplanation
          //     case '@sense':
          //       return SENSES.senseToExplanation
          //   }
          // })()
          const [name, displayText] = text.split('|')
          warn('Renderer.hover was not implemented')
          // const hoverMeta = Renderer.hover.getMakePredefinedHover({
          //   type: 'entries',
          //   name: name.toTitleCase(),
          //   entries: expander(name)
          // })
          // textStack[0] += `<span class="help--hover" ${hoverMeta.html}>${displayText || name}</span>`
          // textStack[0] += `${(displayText || name).toTitleCase()}`
          // TODO: Implement hover
          // textStack[0].push($({
          //   model: 'hover',
          //   text: `${(displayText || name).toTitleCase()}`,
          //   value:
          // }))
          textStack[0].push(`${(displayText || name).toTitleCase()}`)

          break
        }
        case '@area': {
          // eslint-disable-next-line no-unused-vars
          const [compactText, areaId, flags, ...others] = text.split('|')

          const renderText =
            flags && flags.includes('x') ? compactText : `${flags && flags.includes('u') ? 'A' : 'a'}rea ${compactText}`

          if (typeof BookUtil === 'undefined') {
            // for the roll20 script
            textStack[0] += renderText
          } else {
            // default to prevent rendering crash on bad tag
            warn('Renderer.hover was not implemented')
            warn('BookUtil was not implemented')
            // const area = BookUtil.curRender.headerMap[areaId] || { entry: { name: '' } }
            const BookUtil = { curRender: { curBookId: '' } }
            const area = { chapter: '', entry: { name: '' } }
            // const hoverMeta = Renderer.hover.getMakePredefinedHover(area.entry, true)
            const hoverMeta = { html: '' }
            textStack[0] += `<a href="#${BookUtil.curRender.curBookId},${area.chapter},${encodeForHash(area.entry.name)}" ${
              hoverMeta.html
            } onclick="BookUtil.handleReNav(this)">${renderText}</a>`
          }

          break
        }

        // CONTENT TAGS ////////////////////////////////////////////////////////////////////////////////////
        case '@book':
        case '@adventure': {
          // format: {@tag Display Text|DMG< |chapter< |section >< |number > >}
          const page = tag === '@book' ? 'book.html' : 'adventure.html'
          const [displayText, book, chapter, section, number] = text.split('|')
          const hash = `${book}${
            chapter
              ? `${HASH_PART_SEP}${chapter}${
                  section
                    ? `${HASH_PART_SEP}${encodeForHash(section)}${
                        number != null ? `${HASH_PART_SEP}${encodeForHash(number)}` : ''
                      }`
                    : ''
                }`
              : ''
          }`
          const fauxEntry = {
            type: 'link',
            href: {
              type: 'internal',
              path: page,
              hash,
              hashPreEncoded: true
            },
            text: displayText
          }
          _recursiveRender(fauxEntry, textStack, meta)

          break
        }

        case '@deity': {
          // eslint-disable-next-line no-unused-vars
          const [name, pantheon, source, displayText, ...others] = text.split('|')
          const hash = `${name}${pantheon ? `${HASH_LIST_SEP}${pantheon}` : ''}${source ? `${HASH_LIST_SEP}${source}` : ''}`

          const fauxEntry = {
            type: 'link',
            href: {
              type: 'internal',
              hash
            },
            text: displayText || name
          }

          fauxEntry.href.path = 'deities.html'
          if (!pantheon) fauxEntry.href.hash += `${HASH_LIST_SEP}forgotten realms`
          if (!source) fauxEntry.href.hash += `${HASH_LIST_SEP}${SOURCES.CODE.PHB}`
          fauxEntry.href.hover = {
            page: PAGES.DEITIES,
            source: source || SOURCES.CODE.PHB
          }
          _recursiveRender(fauxEntry, textStack, meta)

          break
        }

        // HOMEBREW LOADING ////////////////////////////////////////////////////////////////////////////////
        case '@loader': {
          const [name, file] = text.split('|')
          const path = /^.*?:\/\//.test(file) ? file : `https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/${file}`
          textStack[0] += `<span 
            onclick="BrewUtil.handleLoadbrewClick(this, '${path.escapeQuotes()}', '${name.escapeQuotes()}')" 
            class="rd__wrp-loadbrew--ready" title="Click to install homebrew">${name}
            <span class="glyphicon glyphicon-download-alt rd__loadbrew-icon rd__loadbrew-icon"/></span>`
          break
        }

        default: {
          const [name, source, displayText, ...others] = text.split('|')
          const hash = `${name}${source ? `${HASH_LIST_SEP}${source}` : ''}`

          const fauxEntry = {
            type: 'link',
            href: {
              type: 'internal',
              hash
            },
            text: displayText || name
          }
          switch (tag) {
            case '@spell':
              fauxEntry.href.path = 'spells.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.SPELLS,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@item':
              fauxEntry.href.path = 'items.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.ITEMS,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@class': {
              if (others.length) {
                const scSource = others.length > 1 ? `~${others[1].trim()}` : '~phb'
                fauxEntry.href.subhashes = [
                  { key: 'sub', value: others[0].trim() + scSource },
                  { key: 'sources', value: 2 }
                ]
                if (others.length > 2) {
                  fauxEntry.href.subhashes.push({ key: CLSS_HASH_FEATURE_KEY, value: others[2].trim() })
                }
              }
              fauxEntry.href.path = 'classes.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              _recursiveRender(fauxEntry, textStack, meta)
              break
            }
            case '@creature':
              fauxEntry.href.path = 'bestiary.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.MM
              fauxEntry.href.hover = {
                page: PAGES.BESTIARY,
                source: source || SOURCES.CODE.MM
              }
              // ...|scaledCr}
              if (others.length) {
                const targetCrNum = CR.crToNumber(others[0])
                fauxEntry.href.hover.preloadId = `${MON_HASH_SCALED}:${targetCrNum}`
                fauxEntry.href.subhashes = [{ key: MON_HASH_SCALED, value: targetCrNum }]
                fauxEntry.text = displayText || `${name} (CR ${others[0]})`
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@condition':
              fauxEntry.href.path = 'conditionsdiseases.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.CONDITIONS_DISEASES,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@disease':
              fauxEntry.href.path = 'conditionsdiseases.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.CONDITIONS_DISEASES,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@background':
              fauxEntry.href.path = 'backgrounds.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.BACKGROUNDS,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@race':
              fauxEntry.href.path = 'races.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.RACES,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@optfeature':
              fauxEntry.href.path = 'optionalfeatures.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.OPT_FEATURES,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@reward':
              fauxEntry.href.path = 'rewards.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.REWARDS,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@feat':
              fauxEntry.href.path = 'feats.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.FEATS,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@psionic':
              fauxEntry.href.path = 'psionics.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.UATMC
              fauxEntry.href.hover = {
                page: PAGES.PSIONICS,
                source: source || SOURCES.CODE.UATMC
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@object':
              fauxEntry.href.path = 'objects.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.OBJECTS,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@boon':
            case '@cult':
              fauxEntry.href.path = 'cultsboons.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.MTF
              fauxEntry.href.hover = {
                page: PAGES.CULTS_BOONS,
                source: source || SOURCES.CODE.MTF
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@trap':
            case '@hazard':
              fauxEntry.href.path = 'trapshazards.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.TRAPS_HAZARDS,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@variantrule':
              fauxEntry.href.path = 'variantrules.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.VARIATNRULES,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@table':
              fauxEntry.href.path = 'tables.html'
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.DMG
              fauxEntry.href.hover = {
                page: PAGES.TABLES,
                source: source || SOURCES.CODE.DMG
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@vehicle':
              fauxEntry.href.path = PAGES.VEHICLES
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.GoS
              fauxEntry.href.hover = {
                page: PAGES.VEHICLES,
                source: source || SOURCES.CODE.GoS
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
            case '@action':
              fauxEntry.href.path = PAGES.ACTIONS
              if (!source) fauxEntry.href.hash += HASH_LIST_SEP + SOURCES.CODE.PHB
              fauxEntry.href.hover = {
                page: PAGES.ACTIONS,
                source: source || SOURCES.CODE.PHB
              }
              _recursiveRender(fauxEntry, textStack, meta)
              break
          }

          break
        }
      }
    } else textStack[0].push(s)
  }
}

function _renderPrimitive(entry, textStack, meta, options) {
  textStack[0] += entry
}

/**
 * Returns a RENDER_OBJECT of a link
 * @param {*} entry Entry data
 * @param {*} objectStack Stack of RENDER_OBJECTS (RO) to be rendered
 * @param {*} meta
 * @param {*} options
 */
function _renderLink(entry, objectStack, meta, options) {
  const href = _renderLink_getHref(entry)

  // overwrite href if there's an available Roll20 handout/character
  // if (entry.href.hover && this._roll20Ids) {
  //   const procHash = encodeForHash(entry.href.hash)
  //   const id = this._roll20Ids[procHash]
  //   if (id) {
  //     href = `http://journal.roll20.net/${id.type}/${id.roll20Id}`
  //   }
  // }

  // textStack[0] += `<a href="${href}" ${
  //   entry.href.type === 'internal' ? '' : `target="_blank" rel="noopener"`
  // } ${_renderLink_getHoverString(entry)} ${_getHooks('link', 'ele')
  //   .map((hook) => hook(entry))
  //   .join(' ')}>${render(entry.text)}</a>`
  // TODO: Convert _renderLink_getHoverString to RENDER_OBJECT
  objectStack[0].push({
    _render: true,
    model: 'link',
    target: entry.href.type === 'internal' ? '' : `target="_blank" rel="noopener"`,
    href,
    text: render(entry.text)
  })
}

/**
 * Return the treated final href of a entry
 * @param {*} entry
 */
function _renderLink_getHref(entry) {
  let href
  if (entry.href.type === 'internal') {
    // baseURL is blank by default
    href = `${BASE_URL}${entry.href.path}#`
    if (entry.href.hash != null) {
      href += entry.href.hashPreEncoded ? entry.href.hash : encodeForHash(entry.href.hash)
    }
    if (entry.href.subhashes != null) {
      for (let i = 0; i < entry.href.subhashes.length; ++i) {
        const subHash = entry.href.subhashes[i]
        if (subHash.preEncoded) href += `${HASH_PART_SEP}${subHash.key}${HASH_SUB_KV_SEP}`
        else href += `${HASH_PART_SEP}${encodeForHash(subHash.key)}${HASH_SUB_KV_SEP}`
        if (subHash.value != null) {
          if (subHash.preEncoded) href += subHash.value
          else href += encodeForHash(subHash.value)
        } else {
          // TODO allow list of values
          href += subHash.values.map((v) => encodeForHash(v)).join(HASH_SUB_LIST_SEP)
        }
      }
    }
  } else if (entry.href.type === 'external') {
    href = entry.href.url
  }
  return href
}

// eslint-disable-next-line no-unused-vars
function _renderLink_getHoverString(entry) {
  if (!entry.href.hover) return ''
  const procHash = encodeForHash(entry.href.hash).replace(/'/g, "\\'")
  if (this._tagExportDict) {
    this._tagExportDict[procHash] = {
      page: entry.href.hover.page,
      source: entry.href.hover.source,
      hash: procHash
    }
  }

  if (this._isAddHandlers)
    return `onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this, '${entry.href.hover.page}', '${
      entry.href.hover.source
    }', '${procHash}', ${
      entry.href.hover.preloadId ? `'${entry.href.hover.preloadId}'` : 'null'
      // eslint-disable-next-line max-len, no-undef
    })" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)"  ${Renderer.hover.getPreventTouchString()}`
  else return ''
}

// eslint-disable-next-line no-unused-vars
function _getHooks(entryType, hookType) {
  // TODO: WHAT IS THIS?
  // return (this._hooks[entryType] || {})[hookType] || []
  return []
}

// render('{@skill Athletics}')

render('{@')
