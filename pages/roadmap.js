// Module imports
// import Chart from 'echarts-for-react'
import moment from 'moment'
import React from 'react'
import 'isomorphic-fetch'





// Component imports
import Page from '../components/Page'
import Component from '../components/Component'





// Component constants
const title = 'Roadmap'





class Roadmap extends Component {
  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  static _sortMilestones (a, b) {
    const momentA = moment(a.due_on)
    const momentB = moment(b.due_on)

    if (momentA.isAfter(momentB, 'day')) {
      return 1
    }

    if (momentA.isBefore(momentB, 'day')) {
      return -1
    }

    return 0
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  async componentDidMount () {
    this.setState({ loading: true })

    let response = await fetch('https://api.github.com/repos/RollForGuild/rollforguild.com/milestones?client_id=21088d01bb910659c4d4&client_secret=ac169bfdb23ff8bfe0b1d581aec1119408241fcb')
    response = await response.json()
    response.sort(Roadmap._sortMilestones)

    this.setState({
      data: response,
      loading: false,
    })
  }

  constructor (props) {
    super(props)

    this.state = {
      data: null,
      loading: false,
    }
  }

  render () {
    const {
      data,
      loading,
    } = this.state

    console.log('data', data)

    return (
      <React.Fragment>
        <header>
          <h1>Roadmap</h1>
        </header>

        {loading && (
          <div>Loading...</div>
        )}

        {(!loading && data) && (
          <ol>
            {data.map(datum => (
              <li key={datum.id}>
                <header>
                  <h2>{datum.title}</h2>
                  <h3>
                    <div>
                      Launching by <time dateTime={datum.due_on}>{moment(datum.due_on).format('DD MMMM')}</time>
                    </div>
                  </h3>
                </header>

                <p>{datum.description}</p>

                <progress
                  max={datum.open_issues + datum.closed_issues}
                  value={datum.closed_issues} />
              </li>
            ))}
          </ol>
        )}
      </React.Fragment>
    )
  }
}





export default Page(Roadmap, title)