import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import MuiButton from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'

import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { Translate } from 'react-localize-redux'

const Button = ({
  id,
  formId,
  isLoading,
  nothingToSubmit,
  title,
  color,
  classes,
  onClick,
}) => (
  <Translate>
    {({ translate }) => (
      <React.Fragment>
        <MuiButton
          variant="contained"
          type="submit"
          form={formId}
          className={classes.button}
          color={color}
          disabled={isLoading}
          onClick={onClick}
        >
          {translate('upload.' + id + '_label')}
        </MuiButton>
        {isLoading && (
          <CircularProgress
            color="secondary"
            size={24}
            className={classes.buttonProgress}
          />
        )}

        <Fade in={nothingToSubmit}>
          <div className={classes.nothingToSubmit}>
            {translate('upload.form.nothing_to_change')}
          </div>
        </Fade>
        </React.Fragment>
    )}
  </Translate>
)

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
    height: 50,
    display: 'inline-block',
    width: 180,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  nothingToSubmit: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -53,
    marginLeft: -65,
  },
})

export default withStyles(styles)(Button)
