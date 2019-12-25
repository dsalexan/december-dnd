import mapify from './mapify'

export const SOURCE_PREFIX = {
  AL: 'AL',
  PS: 'PS',
  UA: 'UA'
}

export const SUFFIX = {
  '3PP': ' 3pp'
}

export const CODE = {
  // #region REGULAR
  CoS: 'CoS',
  DMG: 'DMG',
  EEPC: 'EEPC',
  EET: 'EET',
  HotDQ: 'HotDQ',
  LMoP: 'LMoP',
  Mag: 'Mag',
  MM: 'MM',
  OotA: 'OotA',
  PHB: 'PHB',
  PotA: 'PotA',
  RoT: 'RoT',
  RoTOS: 'RoTOS',
  SCAG: 'SCAG',
  SKT: 'SKT',
  ToA: 'ToA',
  ToD: 'ToD',
  TTP: 'TTP',
  TYP: 'TftYP',
  TYP_AtG: 'TftYP-AtG',
  TYP_DiT: 'TftYP-DiT',
  TYP_TFoF: 'TftYP-TFoF',
  TYP_THSoT: 'TftYP-THSoT',
  TYP_TSC: 'TftYP-TSC',
  TYP_ToH: 'TftYP-ToH',
  TYP_WPM: 'TftYP-WPM',
  VGM: 'VGM',
  XGE: 'XGE',
  OGA: 'OGA',
  MTF: 'MTF',
  WDH: 'WDH',
  WDMM: 'WDMM',
  GGR: 'GGR',
  KKW: 'KKW',
  LLK: 'LLK',
  GoS: 'GoS',
  AI: 'AI',
  OoW: 'OoW',
  DIP: 'DIP',
  HftT: 'HftT',
  DC: 'DC',
  SLW: 'SLW',
  SDW: 'SDW',
  BGDIA: 'BGDIA',
  LR: 'LR',
  AL: 'AL',
  SAC: 'SAC',
  ERLW: 'ERLW',
  EFR: 'EFR',
  RMBRE: 'RMBRE',
  RMR: 'RMR',
  MFF: 'MFF',
  AWM: 'AWM',
  SCREEN: 'Screen',
  // #endregion
  // #region AL
  ALCoS: `${SOURCE_PREFIX.AL}CurseOfStrahd`,
  ALEE: `${SOURCE_PREFIX.AL}ElementalEvil`,
  ALRoD: `${SOURCE_PREFIX.AL}RageOfDemons`,
  // #endregion
  // #region PS
  PSA: `${SOURCE_PREFIX.PS}A`,
  PSI: `${SOURCE_PREFIX.PS}I`,
  PSK: `${SOURCE_PREFIX.PS}K`,
  PSZ: `${SOURCE_PREFIX.PS}Z`,
  PSX: `${SOURCE_PREFIX.PS}X`,
  PSD: `${SOURCE_PREFIX.PS}D`,
  // #endregion
  // #region UA
  UAA: `${SOURCE_PREFIX.UA}Artificer`,
  UAEAG: `${SOURCE_PREFIX.UA}EladrinAndGith`,
  UAEBB: `${SOURCE_PREFIX.UA}Eberron`,
  UAFFR: `${SOURCE_PREFIX.UA}FeatsForRaces`,
  UAFFS: `${SOURCE_PREFIX.UA}FeatsForSkills`,
  UAFO: `${SOURCE_PREFIX.UA}FiendishOptions`,
  UAFT: `${SOURCE_PREFIX.UA}Feats`,
  UAGH: `${SOURCE_PREFIX.UA}GothicHeroes`,
  UAMDM: `${SOURCE_PREFIX.UA}ModernMagic`,
  UASSP: `${SOURCE_PREFIX.UA}StarterSpells`,
  UATMC: `${SOURCE_PREFIX.UA}TheMysticClass`,
  UATOBM: `${SOURCE_PREFIX.UA}ThatOldBlackMagic`,
  UATRR: `${SOURCE_PREFIX.UA}TheRangerRevised`,
  UAWA: `${SOURCE_PREFIX.UA}WaterborneAdventures`,
  UAVR: `${SOURCE_PREFIX.UA}VariantRules`,
  UALDR: `${SOURCE_PREFIX.UA}LightDarkUnderdark`,
  UARAR: `${SOURCE_PREFIX.UA}RangerAndRogue`,
  UAATOSC: `${SOURCE_PREFIX.UA}ATrioOfSubclasses`,
  UABPP: `${SOURCE_PREFIX.UA}BarbarianPrimalPaths`,
  UARSC: `${SOURCE_PREFIX.UA}RevisedSubclasses`,
  UAKOO: `${SOURCE_PREFIX.UA}KitsOfOld`,
  UABBC: `${SOURCE_PREFIX.UA}BardBardColleges`,
  UACDD: `${SOURCE_PREFIX.UA}ClericDivineDomains`,
  UAD: `${SOURCE_PREFIX.UA}Druid`,
  UARCO: `${SOURCE_PREFIX.UA}RevisedClassOptions`,
  UAF: `${SOURCE_PREFIX.UA}Fighter`,
  UAM: `${SOURCE_PREFIX.UA}Monk`,
  UAP: `${SOURCE_PREFIX.UA}Paladin`,
  UAMC: `${SOURCE_PREFIX.UA}ModifyingClasses`,
  UAS: `${SOURCE_PREFIX.UA}Sorcerer`,
  UAWAW: `${SOURCE_PREFIX.UA}WarlockAndWizard`,
  UATF: `${SOURCE_PREFIX.UA}TheFaithful`,
  UAWR: `${SOURCE_PREFIX.UA}WizardRevisited`,
  UAESR: `${SOURCE_PREFIX.UA}ElfSubraces`,
  UAMAC: `${SOURCE_PREFIX.UA}MassCombat`,
  UA3PE: `${SOURCE_PREFIX.UA}ThreePillarExperience`,
  UAGHI: `${SOURCE_PREFIX.UA}GreyhawkInitiative`,
  UATSC: `${SOURCE_PREFIX.UA}ThreeSubclasses`,
  UAOD: `${SOURCE_PREFIX.UA}OrderDomain`,
  UACAM: `${SOURCE_PREFIX.UA}CentaursMinotaurs`,
  UAGSS: `${SOURCE_PREFIX.UA}GiantSoulSorcerer`,
  UARoE: `${SOURCE_PREFIX.UA}RacesOfEberron`,
  UARoR: `${SOURCE_PREFIX.UA}RacesOfRavnica`,
  UAWGE: `${SOURCE_PREFIX.UA}WGE`,
  UAOSS: `${SOURCE_PREFIX.UA}OfShipsAndSea`,
  UASIK: `${SOURCE_PREFIX.UA}Sidekicks`,
  UAAR: `${SOURCE_PREFIX.UA}ArtificerRevisited`,
  UABAM: `${SOURCE_PREFIX.UA}BarbarianAndMonk`,
  UASAW: `${SOURCE_PREFIX.UA}SorcererAndWarlock`,
  UABAP: `${SOURCE_PREFIX.UA}BardAndPaladin`,
  UACDW: `${SOURCE_PREFIX.UA}ClericDruidWizard`,
  UAFRR: `${SOURCE_PREFIX.UA}FighterRangerRogue`,
  UACFV: `${SOURCE_PREFIX.UA}ClassFeatureVariants`,
  UAFRW: `${SOURCE_PREFIX.UA}FighterRogueWizard`,
  // #endregion
  // #region OTHERS
  STREAM: 'Stream',
  TWITTER: 'Twitter'
  // #endregion
}

export const NAME_PREFIX = {
  AL: 'Adventurers League: ',
  PS: 'Plane Shift: ',
  UA: 'Unearthed Arcana: '
}

export const NAME_PREFIX_SHORT = {
  AL: 'AL: ',
  PS: 'PS: ',
  UA: 'UA: '
}

// RAWS
const TftYP_NAME = 'Tales from the Yawning Portal'
export const RAW_FULL_NAMES = {
  [CODE.CoS]: 'Curse of Strahd',
  [CODE.DMG]: "Dungeon Master's Guide",
  [CODE.EEPC]: "Elemental Evil Player's Companion",
  [CODE.EET]: 'Elemental Evil: Trinkets',
  [CODE.HotDQ]: 'Hoard of the Dragon Queen',
  [CODE.LMoP]: 'Lost Mine of Phandelver',
  [CODE.Mag]: 'Dragon Magazine',
  [CODE.MM]: 'Monster Manual',
  [CODE.OotA]: 'Out of the Abyss',
  [CODE.PHB]: "Player's Handbook",
  [CODE.PotA]: 'Princes of the Apocalypse',
  [CODE.RoT]: 'The Rise of Tiamat',
  [CODE.RoTOS]: 'The Rise of Tiamat Online Supplement',
  [CODE.SCAG]: "Sword Coast Adventurer's Guide",
  [CODE.SKT]: "Storm King's Thunder",
  [CODE.ToA]: 'Tomb of Annihilation',
  [CODE.ToD]: 'Tyranny of Dragons',
  [CODE.TTP]: 'The Tortle Package',
  [CODE.TYP]: TftYP_NAME,
  [CODE.TYP_AtG]: TftYP_NAME,
  [CODE.TYP_DiT]: TftYP_NAME,
  [CODE.TYP_TFoF]: TftYP_NAME,
  [CODE.TYP_THSoT]: TftYP_NAME,
  [CODE.TYP_TSC]: TftYP_NAME,
  [CODE.TYP_ToH]: TftYP_NAME,
  [CODE.TYP_WPM]: TftYP_NAME,
  [CODE.VGM]: "Volo's Guide to Monsters",
  [CODE.XGE]: "Xanathar's Guide to Everything",
  [CODE.OGA]: 'One Grung Above',
  [CODE.MTF]: "Mordenkainen's Tome of Foes",
  [CODE.WDH]: 'Waterdeep: Dragon Heist',
  [CODE.WDMM]: 'Waterdeep: Dungeon of the Mad Mage',
  [CODE.GGR]: "Guildmasters' Guide to Ravnica",
  [CODE.KKW]: "Krenko's Way",
  [CODE.LLK]: 'Lost Laboratory of Kwalish',
  [CODE.GoS]: 'Ghosts of Saltmarsh',
  [CODE.AI]: 'Acquisitions Incorporated',
  [CODE.OoW]: 'The Orrery of the Wanderer',
  [CODE.DIP]: 'Dragon of Icespire Peak',
  [CODE.HftT]: 'Hunt for the Thessalhydra',
  [CODE.DC]: 'Divine Contention',
  [CODE.SLW]: "Storm Lord's Wrath",
  [CODE.SDW]: "Sleeping Dragon's Wake",
  [CODE.BGDIA]: "Baldur's Gate: Descent Into Avernus",
  [CODE.LR]: 'Locathah Rising',
  [CODE.AL]: "Adventurers' League",
  [CODE.SAC]: 'Sage Advice Compendium',
  [CODE.ERLW]: 'Eberron: Rising from the Last War',
  [CODE.EFR]: 'Eberron: Forgotten Relics',
  [CODE.RMBRE]: 'The Lost Dungeon of Rickedness: Big Rick Energy',
  [CODE.RMR]: 'Dungeons & Dragons vs. Rick and Morty: Basic Rules',
  [CODE.MFF]: "Mordenkainen's Fiendish Folio",
  [CODE.AWM]: 'Adventure with Muk',
  [CODE.SCREEN]: "Dungeon Master's Screen",
  [CODE.ALCoS]: `${NAME_PREFIX.AL}Curse of Strahd`,
  [CODE.ALEE]: `${NAME_PREFIX.AL}Elemental Evil`,
  [CODE.ALRoD]: `${NAME_PREFIX.AL}Rage of Demons`,
  [CODE.PSA]: `${NAME_PREFIX.PS}Amonkhet`,
  [CODE.PSI]: `${NAME_PREFIX.PS}Innistrad`,
  [CODE.PSK]: `${NAME_PREFIX.PS}Kaladesh`,
  [CODE.PSZ]: `${NAME_PREFIX.PS}Zendikar`,
  [CODE.PSX]: `${NAME_PREFIX.PS}Ixalan`,
  [CODE.PSD]: `${NAME_PREFIX.PS}Dominaria`,
  [CODE.UAA]: `${NAME_PREFIX.UA}Artificer`,
  [CODE.UAEAG]: `${NAME_PREFIX.UA}Eladrin and Gith`,
  [CODE.UAEBB]: `${NAME_PREFIX.UA}Eberron`,
  [CODE.UAFFR]: `${NAME_PREFIX.UA}Feats for Races`,
  [CODE.UAFFS]: `${NAME_PREFIX.UA}Feats for Skills`,
  [CODE.UAFO]: `${NAME_PREFIX.UA}Fiendish Options`,
  [CODE.UAFT]: `${NAME_PREFIX.UA}Feats`,
  [CODE.UAGH]: `${NAME_PREFIX.UA}Gothic Heroes`,
  [CODE.UAMDM]: `${NAME_PREFIX.UA}Modern Magic`,
  [CODE.UASSP]: `${NAME_PREFIX.UA}Starter Spells`,
  [CODE.UATMC]: `${NAME_PREFIX.UA}The Mystic Class`,
  [CODE.UATOBM]: `${NAME_PREFIX.UA}That Old Black Magic`,
  [CODE.UATRR]: `${NAME_PREFIX.UA}The Ranger, Revised`,
  [CODE.UAWA]: `${NAME_PREFIX.UA}Waterborne Adventures`,
  [CODE.UAVR]: `${NAME_PREFIX.UA}Variant Rules`,
  [CODE.UALDR]: `${NAME_PREFIX.UA}Light, Dark, Underdark!`,
  [CODE.UARAR]: `${NAME_PREFIX.UA}Ranger and Rogue`,
  [CODE.UAATOSC]: `${NAME_PREFIX.UA}A Trio of Subclasses`,
  [CODE.UABPP]: `${NAME_PREFIX.UA}Barbarian Primal Paths`,
  [CODE.UARSC]: `${NAME_PREFIX.UA}Revised Subclasses`,
  [CODE.UAKOO]: `${NAME_PREFIX.UA}Kits of Old`,
  [CODE.UABBC]: `${NAME_PREFIX.UA}Bard: Bard Colleges`,
  [CODE.UACDD]: `${NAME_PREFIX.UA}Cleric: Divine Domains`,
  [CODE.UAD]: `${NAME_PREFIX.UA}Druid`,
  [CODE.UARCO]: `${NAME_PREFIX.UA}Revised Class Options`,
  [CODE.UAF]: `${NAME_PREFIX.UA}Fighter`,
  [CODE.UAM]: `${NAME_PREFIX.UA}Monk`,
  [CODE.UAP]: `${NAME_PREFIX.UA}Paladin`,
  [CODE.UAMC]: `${NAME_PREFIX.UA}Modifying Classes`,
  [CODE.UAS]: `${NAME_PREFIX.UA}Sorcerer`,
  [CODE.UAWAW]: `${NAME_PREFIX.UA}Warlock and Wizard`,
  [CODE.UATF]: `${NAME_PREFIX.UA}The Faithful`,
  [CODE.UAWR]: `${NAME_PREFIX.UA}Wizard Revisited`,
  [CODE.UAESR]: `${NAME_PREFIX.UA}Elf Subraces`,
  [CODE.UAMAC]: `${NAME_PREFIX.UA}Mass Combat`,
  [CODE.UA3PE]: `${NAME_PREFIX.UA}Three-Pillar Experience`,
  [CODE.UAGHI]: `${NAME_PREFIX.UA}Greyhawk Initiative`,
  [CODE.UATSC]: `${NAME_PREFIX.UA}Three Subclasses`,
  [CODE.UAOD]: `${NAME_PREFIX.UA}Order Domain`,
  [CODE.UACAM]: `${NAME_PREFIX.UA}Centaurs and Minotaurs`,
  [CODE.UAGSS]: `${NAME_PREFIX.UA}Giant Soul Sorcerer`,
  [CODE.UARoE]: `${NAME_PREFIX.UA}Races of Eberron`,
  [CODE.UARoR]: `${NAME_PREFIX.UA}Races of Ravnica`,
  [CODE.UAWGE]: "Wayfinder's Guide to Eberron",
  [CODE.UAOSS]: `${NAME_PREFIX.UA}Of Ships and the Sea`,
  [CODE.UASIK]: `${NAME_PREFIX.UA}Sidekicks`,
  [CODE.UAAR]: `${NAME_PREFIX.UA}Artificer Revisited`,
  [CODE.UABAM]: `${NAME_PREFIX.UA}Barbarian and Monk`,
  [CODE.UASAW]: `${NAME_PREFIX.UA}Sorcerer and Warlock`,
  [CODE.UABAP]: `${NAME_PREFIX.UA}Bard and Paladin`,
  [CODE.UACDW]: `${NAME_PREFIX.UA}Cleric, Druid, and Wizard`,
  [CODE.UAFRR]: `${NAME_PREFIX.UA}Fighter, Ranger, and Rogue`,
  [CODE.UACFV]: `${NAME_PREFIX.UA}Class Feature Variants`,
  [CODE.UAFRW]: `${NAME_PREFIX.UA}Fighter, Rogue, and Wizard`,
  [CODE.STREAM]: 'Livestream',
  [CODE.TWITTER]: 'Twitter'
}

export const RAW_ABBREVIATIONS = {
  [CODE.CoS]: 'CoS',
  [CODE.DMG]: 'DMG',
  [CODE.EEPC]: 'EEPC',
  [CODE.EET]: 'EET',
  [CODE.HotDQ]: 'HotDQ',
  [CODE.LMoP]: 'LMoP',
  [CODE.Mag]: 'Mag',
  [CODE.MM]: 'MM',
  [CODE.OotA]: 'OotA',
  [CODE.PHB]: 'PHB',
  [CODE.PotA]: 'PotA',
  [CODE.RoT]: 'RoT',
  [CODE.RoTOS]: 'RoTOS',
  [CODE.SCAG]: 'SCAG',
  [CODE.SKT]: 'SKT',
  [CODE.ToA]: 'ToA',
  [CODE.ToD]: 'ToD',
  [CODE.TTP]: 'TTP',
  [CODE.TYP]: 'TftYP',
  [CODE.TYP_AtG]: 'TftYP',
  [CODE.TYP_DiT]: 'TftYP',
  [CODE.TYP_TFoF]: 'TftYP',
  [CODE.TYP_THSoT]: 'TftYP',
  [CODE.TYP_TSC]: 'TftYP',
  [CODE.TYP_ToH]: 'TftYP',
  [CODE.TYP_WPM]: 'TftYP',
  [CODE.VGM]: 'VGM',
  [CODE.XGE]: 'XGE',
  [CODE.OGA]: 'OGA',
  [CODE.MTF]: 'MTF',
  [CODE.WDH]: 'WDH',
  [CODE.WDMM]: 'WDMM',
  [CODE.GGR]: 'GGR',
  [CODE.KKW]: 'KKW',
  [CODE.LLK]: 'LLK',
  [CODE.GoS]: 'GoS',
  [CODE.AI]: 'AI',
  [CODE.OoW]: 'OoW',
  [CODE.DIP]: 'DIP',
  [CODE.HftT]: 'HftT',
  [CODE.DC]: 'DC',
  [CODE.SLW]: 'SLW',
  [CODE.SDW]: 'SDW',
  [CODE.BGDIA]: 'BGDIA',
  [CODE.LR]: 'LR',
  [CODE.AL]: 'AL',
  [CODE.SAC]: 'SAC',
  [CODE.ERLW]: 'ERLW',
  [CODE.EFR]: 'EFR',
  [CODE.RMBRE]: 'RMBRE',
  [CODE.RMR]: 'RMR',
  [CODE.MFF]: 'MFF',
  [CODE.AWM]: 'AWM',
  [CODE.SCREEN]: 'Screen',
  [CODE.ALCoS]: 'ALCoS',
  [CODE.ALEE]: 'ALEE',
  [CODE.ALRoD]: 'ALRoD',
  [CODE.PSA]: 'PSA',
  [CODE.PSI]: 'PSI',
  [CODE.PSK]: 'PSK',
  [CODE.PSZ]: 'PSZ',
  [CODE.PSX]: 'PSX',
  [CODE.PSD]: 'PSD',
  [CODE.UAA]: 'UAA',
  [CODE.UAEAG]: 'UAEaG',
  [CODE.UAEBB]: 'UAEB',
  [CODE.UAFFR]: 'UAFFR',
  [CODE.UAFFS]: 'UAFFS',
  [CODE.UAFO]: 'UAFO',
  [CODE.UAFT]: 'UAFT',
  [CODE.UAGH]: 'UAGH',
  [CODE.UAMDM]: 'UAMM',
  [CODE.UASSP]: 'UASS',
  [CODE.UATMC]: 'UAM',
  [CODE.UATOBM]: 'UAOBM',
  [CODE.UATRR]: 'UATRR',
  [CODE.UAWA]: 'UAWA',
  [CODE.UAVR]: 'UAVR',
  [CODE.UALDR]: 'UALDU',
  [CODE.UARAR]: 'UARAR',
  [CODE.UAATOSC]: 'UAATOSC',
  [CODE.UABPP]: 'UABPP',
  [CODE.UARSC]: 'UARSC',
  [CODE.UAKOO]: 'UAKoO',
  [CODE.UABBC]: 'UABBC',
  [CODE.UACDD]: 'UACDD',
  [CODE.UAD]: 'UAD',
  [CODE.UARCO]: 'UARCO',
  [CODE.UAF]: 'UAF',
  [CODE.UAM]: 'UAM',
  [CODE.UAP]: 'UAP',
  [CODE.UAMC]: 'UAMC',
  [CODE.UAS]: 'UAS',
  [CODE.UAWAW]: 'UAWAW',
  [CODE.UATF]: 'UATF',
  [CODE.UAWR]: 'UAWR',
  [CODE.UAESR]: 'UAESR',
  [CODE.UAMAC]: 'UAMAC',
  [CODE.UA3PE]: 'UA3PE',
  [CODE.UAGHI]: 'UAGHI',
  [CODE.UATSC]: 'UATSC',
  [CODE.UAOD]: 'UAOD',
  [CODE.UACAM]: 'UACAM',
  [CODE.UAGSS]: 'UAGSS',
  [CODE.UARoE]: 'UARoE',
  [CODE.UARoR]: 'UARoR',
  [CODE.UAWGE]: 'WGE',
  [CODE.UAOSS]: 'UAOSS',
  [CODE.UASIK]: 'UASIK',
  [CODE.UAAR]: 'UAAR',
  [CODE.UABAM]: 'UABAM',
  [CODE.UASAW]: 'UASAW',
  [CODE.UABAP]: 'UABAP',
  [CODE.UACDW]: 'UACDW',
  [CODE.UAFRR]: 'UAFRR',
  [CODE.UACFV]: 'UACFV',
  [CODE.UAFRW]: 'UAFRW',
  [CODE.STREAM]: 'Stream',
  [CODE.TWITTER]: 'Twitter'
}

// LISTS
export const LIST_SOURCES_ADVENTURES = new Set([
  CODE.LMoP,
  CODE.HotDQ,
  CODE.RoT,
  CODE.PotA,
  CODE.OotA,
  CODE.CoS,
  CODE.SKT,
  CODE.TYP,
  CODE.TYP_AtG,
  CODE.TYP_DiT,
  CODE.TYP_TFoF,
  CODE.TYP_THSoT,
  CODE.TYP_TSC,
  CODE.TYP_ToH,
  CODE.TYP_WPM,
  CODE.ToA,
  CODE.TTP,
  CODE.WDH,
  CODE.LLK,
  CODE.WDMM,
  CODE.KKW,
  CODE.GoS,
  CODE.HftT,
  CODE.OoW,
  CODE.DIP,
  CODE.SLW,
  CODE.SDW,
  CODE.DC,
  CODE.BGDIA,
  CODE.LR,
  CODE.EFR,
  CODE.RMBRE,

  CODE.AWM
])

export const LIST_SOURCES_CORE_SUPPLEMENTS = new Set(Object.keys(RAW_FULL_NAMES).filter((it) => !LIST_SOURCES_ADVENTURES.has(it)))

export const LIST_SOURCES_NON_STANDARD_WOTC = new Set([
  CODE.OGA,
  CODE.Mag,
  CODE.STREAM,
  CODE.TWITTER,
  CODE.LLK,
  CODE.LR,
  CODE.TTP,
  CODE.AWM
])

export default {
  CODE_TO_FULL: mapify(RAW_FULL_NAMES),
  CODE_TO_ABBREVIATION: mapify(RAW_ABBREVIATIONS),
  CODE,
  SOURCE_PREFIX,
  LIST_SOURCES_CORE_SUPPLEMENTS,
  LIST_SOURCES_ADVENTURES,
  LIST_SOURCES_NON_STANDARD_WOTC,
  NAME_PREFIX,
  NAME_PREFIX_SHORT
}
