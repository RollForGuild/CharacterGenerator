// Module imports
import React from 'react'





// Component imports
import Component from '../../components/Component'
import Page from '../../components/Page'





// Component constants
const title = 'GM Treasure'





class GMTreasure extends Component {

  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  render () {
    return (
      <h1>GM Treasure!</h1>
    )
  }
}





export default Page(GMTreasure, title)
