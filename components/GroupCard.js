// Module imports
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React from 'react'




// Component imports
import { actions } from '../store'
import Link from './Link'





const GroupCard = (props) => {
  const { group } = props

  const {
    description,
    members,
    name,
    slug,
  } = group.attributes

  return (
    <div className="card">
      <header>
        <h2 title={name}>
          <Link
            action="view-result"
            category="Groups"
            label="Search"
            route="group profile"
            params={{ id: slug }}>
            <a>{name}</a>
          </Link>
        </h2>
      </header>

      <div className="meta">
        <small>{members} members</small>
      </div>

      <div className="content">
        {!!description && (
          <p>{description}</p>
        )}

        {!description && (
          <p><em>No description</em></p>
        )}
      </div>
    </div>
  )
}





const mapDispatchToProps = dispatch => bindActionCreators({
  requestToJoinGroup: actions.requestToJoinGroup,
}, dispatch)





export default connect(null, mapDispatchToProps)(GroupCard)
