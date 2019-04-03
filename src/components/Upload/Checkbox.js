import React from 'react'
import { Translate } from 'react-localize-redux'
import PropTypes from 'prop-types'

import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'

import FormHelperText from '@material-ui/core/FormHelperText'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import CardContent from '@material-ui/core/CardContent'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Popover from '@material-ui/core/Popover'

import Fade from '@material-ui/core/Fade'

const CheckboxComponent = ({ id, value, onChange, classes, checked }) => (
  <Translate>
    {({ translate }) => (
      <div className={classes.container}>
        <FormControlLabel
          control={
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              checked={checked}
              onChange={onChange(id)}
              value={id}
            />
          }
          label={translate('upload.form.' + id + '_label')}
        />

        <div>
          <Fade in={checked}>
            <Card className={classes.card}>
              <CardContent>
                <Typography color="textSecondary">
                  {translate('upload.form.' + id + '_helptext')}{' '}
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </div>
      </div>
    )}
  </Translate>
)

CheckboxComponent.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

CheckboxComponent.defaultProps = {
  id: 'checkbox',
}

const styles = theme => ({
  container: {
    color: theme.palette.text.secondary,
    marginLeft: 2 * theme.spacing.unit,
    marginRight: 2 * theme.spacing.unit,
    marginTop: -2 * theme.spacing.unit,
    minWidth: 350,
    fontSize: '.8em',
  },
  card: {
    maxWidth: 350,
  },
})

export default withStyles(styles)(CheckboxComponent)
