// Module imports
import React from 'react'
import Router from 'next/router'





// Component imports
import Component from '../components/Component'
import Page from '../components/Page'





// Component constants
const title = 'Register'





class Register extends Component {
  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  async _onSubmit (event) {
    const {
      email,
      password,
      username,
    } = this.state

    event.preventDefault()

    this.setState({ registering: true })
    await this.props.register(username, email, password)
    this.setState({ registering: false })
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  componentWillMount () {
    if (this.props.loggedIn) {
      Router.push('/')
    }
  }

  constructor (props) {
    super(props)

    this._bindMethods([
      '_handleChange',
      '_onSubmit',
    ])

    this.state = {
      email: '',
      registering: false,
      password: '',
      username: '',
    }
  }

  render () {
    const {
      email,
      registering,
      password,
      username,
    } = this.state
    const { registered } = this.props

    return (
      <React.Fragment>
        <header>
          <h1>Register</h1>
        </header>

        {(!registered || (registered === 'error')) && (
          <form onSubmit={this._onSubmit}>
            <input
              disabled={registering}
              id="email"
              name="email"
              onChange={this._handleChange}
              placeholder="Email"
              type="email"
              value={email} />

            <input
              disabled={registering}
              id="username"
              name="username"
              onChange={this._handleChange}
              placeholder="Username"
              type="username"
              value={username} />

            <input
              disabled={registering}
              id="password"
              name="password"
              onChange={this._handleChange}
              placeholder="Password"
              type="password"
              value={password} />

            <menu type="toolbar">
              <button type="submit">Register</button>
            </menu>

            {(registered === 'error') && (
              <React.Fragment>
                <p>There seems to have been an error registering your account. Please try again or <a href="mailto:support@rollforguild.com">contact support</a>.</p>
              </React.Fragment>
            )}
          </form>
        )}

        {(registered === 'success') && (
          <React.Fragment>
            <p>Now that you've given the password to the towering hulk of a creature at the entrance to The Guild's headquarters, it lumbers towards a strange, magical box. It points to the box, then grunts at you. You can only assume it intends for you to come closer. The creature steps out of your way and you lean in for a closer look. The box is clearly some strange product of gnomish tinkering. On iots front you read the words...</p>

            <blockquote>Check your email for a confirmation code.</blockquote>

            <p>Unsure of what this may mean, you feel an overwhelming urge to step out-of-character and do as the box commands.</p>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}





const mapDispatchToProps = ['register']

const mapStateToProps = state => ({ ...state.authentication })





export default Page(Register, title, {
  mapStateToProps,
  mapDispatchToProps,
})
