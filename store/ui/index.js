export const state = () => ({
  PERMISSIONS: {
    EDIT: false
  }
})

export const mutations = {
  toogleEdit(state, value = undefined) {
    state.PERMISSIONS.EDIT = value === undefined ? !state.PERMISSIONS.EDIT : value
  }
}
