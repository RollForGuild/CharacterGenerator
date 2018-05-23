// Component imports
import { activateZenDesk } from '../helpers'
import Button from './Button'
import Compomnent from './Component'





class ErrorBoundary extends Compomnent {
  componentDidCatch (error, info) {
    this.setState({ error, info })

    /* eslint-disable no-console */
    console.error(error)
    console.error(info)
    /* eslint-enable no-console */
  }

  constructor (props) {
    super(props)

    this.state = {
      error: null,
      info: null,
    }
  }

  render () {
    const {
      error,
      info,
    } = this.state

    if (error) {
      return (
        <div className="error-boundary" data-t="error-boundary:wrapper">
          <span>
            Whoops! Something has seemed to go terribly wrong!
            <br />
            You can continue to retry loading this content, however if issues persist, please <Button category="ErrorBoundary" className="inline link" label="Support" onClick={activateZenDesk}>contact support</Button>.
          </span>

          <Button
            category="ErrorBoundary"
            label="Reload"
            onClick={this.setState({ error: null, info: null })} >
            Reload
          </Button>

          <details>
            {error.toString()}
            <br />
            {info.componentStack}
          </details>

        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
