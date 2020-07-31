export function mergeSubraces(races) {
  const out = []
  races.forEach((r) => {
    Array.prototype.push.apply(out, _mergeSubrace(r))
  })
  return out
}

function _mergeSubrace(race) {
  if (race.subraces) {
    const srCopy = JSON.parse(JSON.stringify(race.subraces))
    const out = []

    srCopy.forEach((s) => {
      const cpy = JSON.parse(JSON.stringify(race))
      cpy._baseName = cpy.name
      cpy._baseSource = cpy.source
      delete cpy.subraces
      delete cpy.srd

      // merge names, abilities, entries, tags
      if (s.name) {
        cpy.name = `${cpy.name} (${s.name})`
        delete s.name
      }
      if (s.ability) {
        // If the base race doesn't have any ability scores, make a set of empty records
        if ((s.overwrite && s.overwrite.ability) || !cpy.ability) cpy.ability = s.ability.map(() => ({}))

        if (cpy.ability.length !== s.ability.length) throw new Error(`Race and subrace ability array lengths did not match!`)
        s.ability.forEach((obj, i) => Object.assign(cpy.ability[i], obj))
        delete s.ability
      }
      if (s.entries) {
        s.entries.forEach((e) => {
          if (e.data && e.data.overwrite) {
            const toOverwrite = cpy.entries.findIndex(
              (it) => it.name.toLowerCase().trim() === e.data.overwrite.toLowerCase().trim()
            )
            if (~toOverwrite) cpy.entries[toOverwrite] = e
            else cpy.entries.push(e)
          } else {
            cpy.entries.push(e)
          }
        })
        delete s.entries
      }

      if (s.traitTags) {
        if (s.overwrite && s.overwrite.traitTags) cpy.traitTags = s.traitTags
        else cpy.traitTags = (cpy.traitTags || []).concat(s.traitTags)
        delete s.traitTags
      }

      if (s.languageProficiencies) {
        if (s.overwrite && s.overwrite.languageProficiencies) cpy.languageProficiencies = s.languageProficiencies
        else
          cpy.languageProficiencies = cpy.languageProficiencies = (cpy.languageProficiencies || []).concat(
            s.languageProficiencies
          )
        delete s.languageProficiencies
      }

      // TODO make a generalised merge system? Probably have one of those lying around somewhere [bestiary schema?]
      if (s.skillProficiencies) {
        // Overwrite if possible
        if (!cpy.skillProficiencies || (s.overwrite && s.overwrite.skillProficiencies))
          cpy.skillProficiencies = s.skillProficiencies
        else {
          if (!s.skillProficiencies.length || !cpy.skillProficiencies.length) throw new Error(`No items!`)
          if (s.skillProficiencies.length > 1 || cpy.skillProficiencies.length > 1)
            throw new Error(`Subrace merging does not handle choices!`) // Implement if required

          // Otherwise, merge
          if (s.skillProficiencies.choose) {
            if (cpy.skillProficiencies.choose) {
              throw new Error(`Subrace choose merging is not supported!!`) // Implement if required
            }
            cpy.skillProficiencies.choose = s.skillProficiencies.choose
            delete s.skillProficiencies.choose
          }
          Object.assign(cpy.skillProficiencies[0], s.skillProficiencies[0])
        }

        delete s.skillProficiencies
      }

      // overwrite everything else
      Object.assign(cpy, s)

      out.push(cpy)
    })
    return out
  } else {
    return [race]
  }
}

export default {
  mergeSubraces
}
