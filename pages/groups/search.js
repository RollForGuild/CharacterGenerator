// Module imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import getConfig from 'next/config'
import React from 'react'





// Component imports
import convertObjectToQueryParams from '../../helpers/convertObjectToQueryParams'
import AddressInput from '../../components/AddressInput'
import Button from '../../components/Button'
import Component from '../../components/Component'
import connect from '../../helpers/connect'
import Dropdown from '../../components/Dropdown'
import GroupCard from '../../components/GroupCard'
import Link from '../../components/Link'
import Main from '../../components/Main'
import PageHeader from '../../components/PageHeader'
import PageTitle from '../../components/PageTitle'
import Pagination from '../../components/Pagination'
import Tooltip from '../../components/Tooltip'




// Component constants
const { publicRuntimeConfig } = getConfig()
const googleMapsAPIKey = publicRuntimeConfig.apis.googleMaps.key
const title = 'Search Groups'





class GroupSearch extends Component {
  /***************************************************************************\
    Properties
  \***************************************************************************/

  state = {
    firstSearchInitiated: false,
    groups: [],
    location: null,
    pagination: {
      currentPage: 1,
      totalPageCount: 1,
    },
    searchDistance: 'global',
    searching: false,
    useCurrentLocation: false,
    waitingForLocation: false,
    watchingLocation: false,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _handleAddressChange = location => {
    this.setState({
      location: location && location.geometry && location.formatted_address ? {
        ...location.geometry.location,
        address: location.formatted_address,
      } : null,
    }, () => {
      if (this.state.location) {
        this._search()
      }
    })
  }

  _handleGeolocationUpdate = async position => {
    const {
      latitude,
      longitude,
    } = position.coords
    const queryParams = {
      key: googleMapsAPIKey,
      latlng: `${latitude},${longitude}`,
      result_type: 'street_address',
    }

    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json${convertObjectToQueryParams(queryParams)}`)

    response = await response.json()

    this.setState({
      location: {
        address: response.results[0].formatted_address,
        lat: latitude,
        lng: longitude,
      },
      waitingForLocation: false,
    }, () => this._search())
  }

  _handleGeolocationError = () => {
    navigator.geolocation.clearWatch(this.wpid)

    this.setState({
      waitingForLocation: false,
      watchingLocation: false,
    })
  }

  _handleSearchDistanceChange = distance => {
    this.setState({ searchDistance: distance }, () => {
      if (this.state.location) {
        this._search()
      }
    })
  }

  _incrementSearchDistance = () => {
    const currentSearchDistanceIndex = GroupSearch.searchDistances.findIndex(searchDistance => searchDistance === this.state.searchDistance)

    this._handleSearchDistanceChange(GroupSearch.searchDistances[currentSearchDistanceIndex + 1])
  }

  static _renderGroup = group => {
    const { id } = group

    return (
      <li key={id}>
        <GroupCard group={group} />
      </li>
    )
  }

  _renderGroups = () => {
    const { groups } = this.state

    return (
      <ol className="card-list">
        {groups.map(GroupSearch._renderGroup)}
      </ol>
    )
  }

  _search = this._debounce(async (page = 1) => {
    const {
      location,
      pagination,
    } = this.state

    this.setState({ searching: true })

    const newState = {
      firstSearchInitiated: true,
      groups: [],
      searching: false,
    }

    const options = {
      ...this.queryOptions,
      page,
    }

    const {
      payload,
      status,
    } = await this.props.searchForGroups(location, options)

    if (status === 'success') {
      const {
        count,
        limit,
        offset,
        total,
      } = payload.meta

      newState.groups = payload.data || []
      newState.pagination = {
        ...pagination,
        currentPage: Math.ceil((offset + count) / limit),
        totalPageCount: Math.ceil(total / limit),
      }
    }

    setTimeout(() => this.setState(newState), 500)
  })

  _toggleUseCurrentLocation = async ({ target }) => {
    const { useCurrentLocation } = this.state

    target.blur()

    this.setState({
      location: null,
      useCurrentLocation: !useCurrentLocation,
      waitingForLocation: !useCurrentLocation,
      watchingLocation: !useCurrentLocation,
    })

    if (!useCurrentLocation) {
      this.wpid = navigator.geolocation.watchPosition(this._handleGeolocationUpdate, this._handleGeolocationError, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      })
    } else {
      navigator.geolocation.clearWatch(this.wpid)
    }
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  componentWillUnmount () {
    navigator.geolocation.clearWatch(this.wpid)
  }

  render () {
    const {
      firstSearchInitiated,
      groups,
      location,
      pagination,
      searchDistance,
      searching,
      useCurrentLocation,
      waitingForLocation,
      watchingLocation,
    } = this.state

    return (
      <React.Fragment>
        <PageTitle>{title}</PageTitle>

        <PageHeader>
          <h1>{title}</h1>
        </PageHeader>

        <Main title={title}>
          <fieldset>
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon="search" fixedWidth />
              </label>

              <AddressInput
                aria-label={waitingForLocation ? 'Retrieving your location...' : 'Enter an address to search for a group'}
                onChange={this._handleAddressChange}
                disabled={waitingForLocation}
                placeholder={waitingForLocation ? 'Retrieving your location...' : 'Enter an address...'}
                readOnly={watchingLocation}
                value={location ? location.address : ''} />

              <button
                aria-label="Use your current location to search for groups"
                className="binary"
                data-on={useCurrentLocation}
                onClick={this._toggleUseCurrentLocation}
                type="button">
                {waitingForLocation && (
                  <FontAwesomeIcon icon="spinner" fixedWidth pulse />
                )}

                {!waitingForLocation && (
                  <FontAwesomeIcon icon="map-marker" fixedWidth />
                )}

                <Tooltip
                  alignment="center"
                  attachment="left">
                  {waitingForLocation && 'Retrieving location'}

                  {(!waitingForLocation && useCurrentLocation) && 'Stop using your current location'}

                  {(!waitingForLocation && !useCurrentLocation) && 'Use your current location'}
                </Tooltip>
              </button>
            </div>

            <footer>
              <div className="filters">
                <Dropdown
                  aria-label="Select distance from location to search within"
                  className="squishable"
                  onChange={this._handleSearchDistanceChange}
                  options={GroupSearch.searchDistances}
                  renderValue={value => (value === 'global' ? 'Search everywhere' : `Search within ${value} miles`)}
                  value={searchDistance} />
              </div>
            </footer>
          </fieldset>

          {Boolean(!searching && groups.length && pagination.currentPage === 1 && groups[0].attributes.distance > 16000) && (
            <p>
              It looks like there aren't any groups near you. Perhaps you should try&nbsp;
              <Link
                action="create-group"
                category="Groups"
                label="Search"
                route="group create">
                <a className="button inline link">
                  creating one
                </a>
              </Link>!
            </p>
          )}

          {Boolean(!searching && groups.length) && this._renderGroups()}

          {Boolean(!searching && firstSearchInitiated && !groups.length) && (
            <p>
              No groups found.
              {searchDistance !== GroupSearch.searchDistances[GroupSearch.searchDistances.length - 1] && (
                <React.Fragment>
                  &nbsp;Perhaps you should try&nbsp;
                  <Button
                    action="expand-distance"
                    category="Groups"
                    className="inline link"
                    label="Search"
                    onClick={this._incrementSearchDistance}>
                    expanding your search
                  </Button>.
                </React.Fragment>
              )}
              &nbsp;You could also try&nbsp;
              <Link
                action="create-group"
                category="Groups"
                label="Search"
                route="group create">
                <a className="button inline link">
                  creating a group
                </a>
              </Link>!
            </p>
          )}

          {searching && (
            <div>
              <FontAwesomeIcon icon="spinner" pulse /> Searching...
            </div>
          )}

          {(!searching && !!groups.length) && (
            <Pagination
              category="Groups"
              label="Search"
              currentPage={pagination.currentPage}
              onPageChange={this._search}
              totalPageCount={pagination.totalPageCount} />
          )}
        </Main>
      </React.Fragment>
    )
  }





  /***************************************************************************\
    Getters
  \***************************************************************************/

  get queryOptions () {
    const {
      pagination,
      searchDistance,
    } = this.state

    const options = {
      itemsPerPage: pagination.itemsPerPage || 5,
    }

    if (searchDistance !== 'global') {
      options.meters = searchDistance * 1609.34 // Convert distance to meters
    }

    return options
  }

  static get searchDistances () {
    return ['global', 5, 10, 25, 50, 100]
  }





  /***************************************************************************\
    Redux Maps
  \***************************************************************************/

  static mapDispatchToProps = [
    'requestToJoinGroup',
    'searchForGroups',
  ]
}





export default connect(GroupSearch)
