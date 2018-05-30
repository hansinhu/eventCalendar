import * as types from './types'

export const mutations = {
  [types.COMMIT_EVENT_LIST] (state, list) {
    state.eventList = list
  },
  [types.COMMIT_ALLPERSON_LIST] (state, list) {
    state.allPersonList = list
  },
  [types.COMMIT_SEARCHPERSON_LIST] (state, list) {
    state.searchPersonList = list
  }
}
