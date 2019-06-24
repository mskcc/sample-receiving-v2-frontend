// Non-disruptive message at the bottom of any page. Used for messaged like
// - successful login
// - single validation error
// - expired token error

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'

import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

const styles = theme => ({
  close: {
    padding: 0,
    top: 0,
    right: 0,
    position: 'absolute',
  },
  // error: {
  //   color: theme.palette.textSecondary,
  // },

  success: {
    backgroundColor: theme.palette.primary.light,
    fontSize: '1em',
    fontWeight: 'bold',
  },
  error: {
    backgroundColor: theme.palette.error.dark,
    fontSize: '1em',

    fontWeight: 'bold',
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
    fontSize: '1em',
    fontWeight: 'bold',
  },
  warning: {
    fontSize: '1em',
    fontWeight: 'bold',
    backgroundColor: theme.palette.secondary.dark,
  },
})

class SimpleSnackbar extends React.Component {
  state = {
    open: true,
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    this.setState({ open: false })
    this.props.handleClose()
  }
  componentDidMount() {
    this.setState({ open: true })
  }

  render() {
    const { type, message, classes, handleClose, variant } = this.props
    return (
      <Snackbar
        open={this.state.open}
        // autoHideDuration={6000}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
          className: variant ? classes[variant] : classes.info,
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    )
  }
}

SimpleSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(SimpleSnackbar)
