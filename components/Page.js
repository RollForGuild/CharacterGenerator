// Module imports
import {
  library as faLibrary,
  config as faConfig,
} from '@fortawesome/fontawesome-svg-core'
import { bindActionCreators } from 'redux'
import Cookies from 'next-cookies'
import getConfig from 'next/config'
import LocalForage from 'localforage'
import React from 'react'
import withRedux from 'next-redux-wrapper'





// Component imports
import {
  actions,
  initStore,
} from '../store'
import { Router } from '../routes'
import * as faIcons from '../helpers/faIconLibrary'
import AlertsController from './AlertsController'
import apiService from '../services/api'
import Banner from './Banner'
import ErrorBoundary from './ErrorBoundary'
import Head from './Head'





// Component constants
const { publicRuntimeConfig } = getConfig()

if (publicRuntimeConfig.environment === 'production') {
  /* eslint-disable global-require */
  require('../workers/offline')
  /* eslint-enable */
}





// Configure and populate FontAweomse library
faConfig.autoAddCss = false
faLibrary.add(faIcons)





// Initialize store
initStore()





export default (Component, reduxOptions = {}, authenticationRequired = false) => {
  class Page extends React.Component {
    /***************************************************************************\
      Private Methods
    \***************************************************************************/

    static async _verifyAuthenticatedUser (props) {
      const {
        accessToken,
        loggedIn,
        logout,
        verifyError,
        verifySession,
      } = props

      if (verifyError) {
        return false
      }

      if (loggedIn) {
        return true
      }

      const { payload, status } = await verifySession(accessToken)

      // If the API returned in error, double check the reasoning.
      if (status !== 'success') {
        if (payload && Array.isArray(payload.errors)) {
          const errMsg = payload.errors[0] && payload.errors[0].detail

          if (errMsg === 'Unable to locate session') {
            await logout(true)
            return false
          }
        }

        // Something else went wrong, but we cannot determine if the session is invalid
      }

      return true
    }





    /***************************************************************************\
      Public Methods
    \***************************************************************************/

    constructor (props) {
      super(props)

      LocalForage.config({
        name: 'Roll for Guild',
        storeName: 'webStore',
      })

      if (this.props.verifyError) {
        this.props.logout(true)
      } else if (props.accessToken && props.loggedIn) {
        apiService.defaults.headers.common.Authorization = `Bearer ${props.accessToken}`
      }
    }

    static async getInitialProps (ctx) {
      const {
        asPath,
        isServer,
        query,
        res,
        store,
      } = ctx
      const {
        accessToken,
        userId,
      } = Cookies(ctx)
      let props = {}


      let verified = false

      if (accessToken) {
        verified = await Page._verifyAuthenticatedUser({
          ...store.getState().authentication,
          accessToken,
          logout: (...args) => actions.logout(...args)(store.dispatch),
          verifySession: (...args) => actions.verifySession(...args)(store.dispatch),
        })

        apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      }

      if (!verified && authenticationRequired) {
        if (res) {
          res.writeHead(302, {
            Location: `/login?destination=${encodeURIComponent(asPath)}`,
          })
          res.end()
          res.finished = true
        } else {
          Router.replace(`/login?destination=${encodeURIComponent(asPath)}`)
        }

        return {}
      }

      if (typeof Component.getInitialProps === 'function') {
        props = await Component.getInitialProps(ctx)
      }

      return {
        accessToken,
        asPath,
        isServer,
        query,
        userId,
        ...props,
      }
    }

    render () {
      return (
        <div role="application">

          <input
            hidden
            id="application-banner-control"
            type="checkbox" />

          <ErrorBoundary>
            <Head />
          </ErrorBoundary>

          <ErrorBoundary>
            <Banner path={this.props.asPath} />
          </ErrorBoundary>

          <ErrorBoundary>
            <Component {...this.props} />
          </ErrorBoundary>

          <ErrorBoundary>
            <AlertsController />
          </ErrorBoundary>

        </div>
      )
    }
  }





  const mapStateToProps = (state, ownProps) => {
    let pageProps = {}

    if (reduxOptions && reduxOptions.mapStateToProps) {
      pageProps = reduxOptions.mapStateToProps(state, ownProps)
    }

    return {
      ...state.authentication,
      ...pageProps,
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    let pageActions = {}

    if (reduxOptions && reduxOptions.mapDispatchToProps) {
      pageActions = reduxOptions.mapDispatchToProps

      if (Array.isArray(pageActions)) {
        pageActions = pageActions.reduce((accumulator, actionName) => ({
          ...accumulator,
          [actionName]: actions[actionName],
        }), {})
      } else if (typeof pageActions === 'function') {
        pageActions = pageActions(dispatch, ownProps)
      }
    }

    return bindActionCreators({
      ...pageActions,
      verifySession: actions.verifySession,
      logout: actions.logout,
    }, dispatch)
  }





  return withRedux(initStore, mapStateToProps, mapDispatchToProps)(Page)
}
