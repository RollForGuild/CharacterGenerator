// Module imports
import PropTypes from 'prop-types'





// Component imports
import Component from './Component'
import Dropdown from './Dropdown'





// Component constants
const gmapsAPIKey = preval`module.exports = process.env.RFG_GOOGLE_MAPS_API_KEY`





class AddressInput extends Component {
  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  async _handleChange (value) {
    this.setState({
      value,
      valid: false,
    })

    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${gmapsAPIKey}&address=${value}`)

    response = await response.json()

    this.setState({ options: response.results })
  }

  async _handleSelect (value) {
    const { onChange } = this.props

    this.setState({
      value,
      valid: true,
    })

    onChange(value)
  }

  static _renderValue (value) {
    if (typeof value === 'string') {
      return value
    }

    return value.formatted_address
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ value: nextProps.value })
    }
  }

  constructor (props) {
    super(props)

    this._bindMethods([
      '_handleChange',
      '_handleSelect',
    ])
    this._debounceMethods(['_handleChange'])

    this.state = {
      value: props.value || props.defaultValue || '',
      options: [],
      valid: false,
    }
  }

  render () {
    const {
      options,
      value,
    } = this.state

    return (
      <Dropdown
        {...this.props}
        filter={Dropdown._filterDropdownOptions}
        name="address"
        onChange={this._handleChange}
        onSelect={this._handleSelect}
        options={options}
        placeholder="Enter an address..."
        renderOption={AddressInput._renderValue}
        renderValue={AddressInput._renderValue}
        searchable
        value={value} />
    )
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  get valid () {
    return this.state.valid
  }
}





AddressInput.defaultProps = {
  defaultValue: '',
  onChange: null,
  value: '',
}

AddressInput.propTypes = {
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  value: PropTypes.any,
}





export default AddressInput
