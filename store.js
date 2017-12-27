// Module imports
import {
  createStore,
  applyMiddleware,
} from 'redux'
import thunkMiddleware from 'redux-thunk'





// Component imports
import initialState from './store/initialState'
import reducer from './store/reducers/index'

/* actions */
import * as authenticationActions from './store/actions/authentication'
import * as characterActions from './store/actions/character'
import * as charactersActions from './store/actions/characters'
import * as rulesetsActions from './store/actions/rulesets'





export const actions = {
  ...authenticationActions,
  ...characterActions,
  ...charactersActions,
  ...rulesetsActions,
}





export const initStore = () => createStore(reducer, initialState, applyMiddleware(thunkMiddleware))
