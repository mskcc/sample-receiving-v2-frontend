import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { connect } from 'react-redux'
import { uploadGridActions } from '../../actions'

import CircularProgress from '@material-ui/core/CircularProgress'

import { UploadGridRDG, UploadGridAG } from '../../components/Upload'

class UploadGridContainer extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(prevProps, prevState) {
    // console.log('prevState')
    // console.log(prevState)
    // console.log('state')
    // console.log(this.state)
  }

  updateCells = ({ fromRow, toRow, updated }) => {
    const rows = this.props.grid.rows.slice()
    for (let i = fromRow; i <= toRow; i++) {
      rows[i] = { ...rows[i], ...updated }
      this.props.updateCells(rows)
    }
  }

  render() {
    const { classes, grid, handleSubmit } = this.props
    // return grid.columns.length > 0 ? (
    //   <UploadGridRDG
    //     update={this.updateCells}
    //     grid={grid}
    //     handleSubmit={handleSubmit}
    //   />
    // ) : null

    return <UploadGridAG grid={grid}/>
  }
}

const mapStateToProps = state => ({
  grid: state.upload.grid,
})

const mapDispatchToProps = {
  ...uploadGridActions,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadGridContainer)
