import actionTypes from '../actionTypes'
import initialState from '../initialState'
import {
  deepMergeJSONAPIObjectCollections,
  parseJSONAPIResponseForEntityType,
} from '../../helpers'





export default function (state = initialState.events, action) {
  const {
    payload,
    status,
    type,
  } = action

  switch (type) {
    case actionTypes.CREATE_GROUP_EVENT:
    case actionTypes.GET_GROUP_EVENT:
    case actionTypes.UPDATE_GROUP_EVENT:
      if (status === 'success') {
        const newGroups = parseJSONAPIResponseForEntityType(payload, 'events', true)
        return deepMergeJSONAPIObjectCollections(state, newGroups)
      }
      return { ...state }

    case actionTypes.GET_GROUP_EVENTS:
      if (status === 'success') {
        return parseJSONAPIResponseForEntityType(payload, 'events', true)
      }
      return { ...state }

    case actionTypes.DELETE_GROUP_EVENT:
      if (status === 'success') {
        const newEvents = { ...state }

        delete newEvents[payload.eventId]

        return newEvents
      }
      return { ...state }

    default:
      return { ...state }
  }
}