import {getters} from './getters'
import {actions} from './actions'
import {mutations} from './mutations'

// initial state
const state = {
  eventList: [],
  allPersonList: [],
  searchPersonList: []
}

export default {
  state,
  getters,
  actions,
  mutations
}
