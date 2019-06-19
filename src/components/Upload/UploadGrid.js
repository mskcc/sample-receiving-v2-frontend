import React from 'react'
import { withStyles } from '@material-ui/core'
import { GridButton } from '../index'
import { HotTable } from '@handsontable/react'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.css'
import Swal from 'sweetalert2'

// after comparing agGrid, react-data-grid, canvas-datagrid, react-data-sheet, ReactHandsOnTable won
class UploadGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = { invalidCells: [] } //   // this.handsontableData = this.props.grid.rows
    //   this.handsontableCols = this.props.grid.columns
    //   this.handsontableColFeatures = this.props.grid.columnFeatures
    // }

    this.hotTableComponent = React.createRef()
  }

  getErrorMsg = () => {
    for (let i = 0; i < numberToAdd; i++) {}
  }
  showError = (error, row, prop) => {
    this.props.grid.rows[row].prop = ''
    if (error) {
      swal(error)
    }
  }

  handleSave = () => {
    this.props.handleSave()
  }
  handleClear = () => {
    this.props.handleClear()
  }
  handleSubmit = () => {
    const { columnFeatures, rows } = this.props.grid

    // run through grid required columns
    let emptyColumns = new Set()
    for (let i = 0; i < columnFeatures.length; i++) {
      for (let j = 0; j < rows.length; j++) {
        if (
          columnFeatures[i].optional == false &&
          !rows[j][columnFeatures[i].data]
        ) {
          emptyColumns.add(columnFeatures[i].columnHeader)
        }
      }
    }

    if (emptyColumns.size > 0) {
      Swal.fire({
        title: 'Required Fields',
        html: [...emptyColumns].join('<br> '),
        // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
        type: 'error',
        animation: false,
        confirmButtonText: 'Dismiss',
        // customClass: { content: 'alert' },
      })
    } else {
      this.props.handleSubmit()
    }
  }

  showRowWarning = count => {
    Swal.fire({
      title: 'Too many rows.',
      text:
        'Please increase the number of samples in the header to at least ' +
        count +
        ' and re-generate the grid before you paste this data.',
      // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
      type: 'warning',
      animation: false,
      confirmButtonText: 'Dismiss',
      // customClass: { content: 'alert' },
    })
  }

  render() {
    const {
      classes,
      grid,
      handleChange,
      user,
      handleMRN,
      handleAssay,
      handleIndex,
      handlePatientId,
    } = this.props
    return (
      <div>
        <div className={classes.container}>
          <div className={classes.buttons}>
            <GridButton
              id="grid_submit"
              onClick={this.handleSubmit}
              isLoading={false}
              nothingToSubmit={false}
              color="primary"
            />
            <GridButton
              id="grid_save"
              onClick={this.handleSave}
              isLoading={user.isSaving}
              done={user.saved}
              msg={'Saved!'}
              color="primary"
            />{' '}
            <GridButton
              id="grid_clear"
              onClick={this.handleClear}
              isLoading={false}
              nothingToSubmit={false}
              color="secondary"
            />
          </div>
          <HotTable
            licenseKey="non-commercial-and-evaluation"
            id="hot"
            data={grid.rows}
            colHeaders={grid.columns}
            columns={grid.columnFeatures}
            rowHeaders={true}
            hiddenColumns={grid.hiddenColumns}
            headerTooltips={true}
            manualColumnResize={true}
            comments={true}
            ref={this.hotTableComponent}
            beforeChange={(changes, source) => {
              //  only do something if rows can fit the changes/if
                // last changes[] element's row index is <= rows
              if (changes[changes.length - 1][0] > grid.rows.length) {
                this.showRowWarning(changes[changes.length - 1][0])
                return false
              }
              if (changes.length > 100) {
                this.props.preValidate()
              }
            }}
            afterChange={(changes, source) => {
              if (changes) {
                let i = 0
                if (source !== 'loadData') {
                  changes.forEach(([row, prop, oldValue, newValue]) => {
                    i++
                    let rowIndex = row
                    if (prop == 'patientId') {
                      handlePatientId(rowIndex)
                    }

                    if (prop == 'assay') {
                      if (
                        newValue != oldValue &&
                        oldValue != '' &&
                        oldValue != undefined
                      ) {
                        handleAssay(rowIndex, oldValue, newValue)
                      }
                    }
                  })
                  if (i == changes.length) {
                    handleChange(changes)
                  }
                }
              }
            }}
            width="95%"
            stretchH="all"
            // height="10%"
            height={() => {
              if (grid.rows.length >= 25) return '700'
              // else if (grid.rows.length >= 900) return '100vh'
              else if (grid.rows.length >= 20) return '510'
              else if (grid.rows.length >= 15) return '650'
              else if (grid.rows.length >= 10) return '550'
              else if (grid.rows.length >= 5) return '450'
              else if (grid.rows.length < 5) return '350'
            }}
          />
        </div>
      </div>
    )
  }
}

const styles = theme => ({
  container: {
    // borderRight: '1px solid gray',
    display: 'grid',
    justifyItems: 'center',
    marginLeft: theme.spacing(2),
    width: '95vw',
    // maxHeight: 600,
    overflow: 'hidden',
    marginBottom: '5em',
  },
  buttons: {},
  tooltipCell: {
    fontSize: '.8em',
    color: 'black !important',
    backgroundColor: '#cfd8dc !important',
  },
  submit: {
    width: '30px',
  },
})

export default withStyles(styles)(UploadGrid)
