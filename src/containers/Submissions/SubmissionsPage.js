import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withLocalize } from 'react-localize-redux'
import { connect } from 'react-redux'
import { userActions, uploadGridActions } from '../../actions'
import { resetErrorMessage } from '../../actions/commonActions'
import { Redirect } from 'react-router-dom'

import SubmissionsTable from '../../components/Submissions/SubmissionsTable'
import { Dialog } from '../../components/Upload'

export class SubmissionsPage extends Component {
  componentDidMount() {
    this.props.getSubmissions()
  }

  handleClick = (type, id) => {
    switch (type) {
      case 'edit': {
        this.props.editSubmission(id)
        return this.props.history.push('upload')
      }
      case 'receipt': {
        return this.props.editSubmission(id)
      }
      case 'delete': {
        swal('Are you sure you want to delete this submission?', {
          buttons: ['Cancel', true],
        }).then(value => {
          if (value) {
            return this.props.deleteSubmission(id)
            return this.props.history.push('submissions')
          }
        })
      }
      default:
        return null
    }
  }

  render() {
    return this.props.user.submissions &&
      this.props.user.submissions.length > 0 ? (
      <SubmissionsTable user={this.props.user} handleClick={this.handleClick} />
    ) : (
      'You have not submitted anything since the launch of V2!'
    )
  }
}

const mapStateToProps = state => ({
  user: state.user,
  loggedIn: state.user.loggedIn,
  loading: state.user.loading,
})

export default withLocalize(
  connect(
    mapStateToProps,
    {
      resetErrorMessage,
      ...userActions,
      ...uploadGridActions,
    }
  )(SubmissionsPage)
)
