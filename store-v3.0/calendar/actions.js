import * as types from './types'
import calendarApi from '../../../api/crm/calendarApi'
import mockList from '../../../components/calendar/mock'
import mockUserList from '../../../components/calendar/mockuser'

export const actions = {
  GETEVENTLIST ({ commit, state }, params) {
    return calendarApi.getEventListByTime(params).then(res => {
      if (res.data.code === 0) {
        let list = mockList
        commit(types.COMMIT_EVENT_LIST, list)
        return new Promise((resolve, reject) => {
          resolve(list)
        })
      }
    })
  },
  ADDEVENT ({state}, params) {
    return calendarApi.addEvent(params)
  },
  DELETEVENT ({state}, params) {
    return calendarApi.deletEvent(params)
  },
  UPDATEEVENT ({state}, params) {
    return calendarApi.updateEvent(params)
  },
  GETALLPERSONLIST ({commit, state}, params) {
    return calendarApi.getAllPersonList(params).then(res => {
      if (res.data.code === 0) {
        let list = mockUserList.slice(0)
        commit(types.COMMIT_ALLPERSON_LIST, list)
        return new Promise((resolve, reject) => {
          resolve(list)
        })
      }
    })
  },
  SEARCHPERSONLIST ({commit, state}, params) {
    return calendarApi.searchPersonList(params).then(res => {
      if (res.data.code === 0) {
        let list = mockUserList.splice(0, 7)
        commit(types.COMMIT_SEARCHPERSON_LIST, list)
        return new Promise((resolve, reject) => {
          resolve(list)
        })
      }
    })
  }
}
