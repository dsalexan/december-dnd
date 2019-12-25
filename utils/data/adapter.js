import _ from 'lodash'

const NO_VALUE = {
  ___no_value___: true
}

const _STATE = {
  _loading: {},
  _loaded: {},
  _merging: {},
  _merged: {},
  _mergeCache: {}
}

export default {
  set(map, key, value) {
    _STATE[map][key] = value
  },
  get(map, key) {
    return _STATE[map][key]
  },

  loading(key, value = NO_VALUE) {
    if (_.isEqual(value, NO_VALUE)) {
      return _STATE._loading[key]
    } else {
      _STATE._loading[key] = value
    }
  },
  loaded(key, value = NO_VALUE) {
    if (_.isEqual(value, NO_VALUE)) {
      return _STATE._loaded[key]
    } else {
      _STATE._loaded[key] = value
    }
  },
  merging(key, value = NO_VALUE) {
    if (_.isEqual(value, NO_VALUE)) {
      return _STATE._merging[key]
    } else {
      _STATE._merging[key] = value
    }
  },
  merged(key, value = NO_VALUE) {
    if (_.isEqual(value, NO_VALUE)) {
      return _STATE._merged[key]
    } else {
      _STATE._merged[key] = value
    }
  },
  mergedCache(key, value = NO_VALUE) {
    if (_.isEqual(value, NO_VALUE)) {
      return _STATE._mergedCache[key]
    } else {
      _STATE._mergedCache[key] = value
    }
  }
}
