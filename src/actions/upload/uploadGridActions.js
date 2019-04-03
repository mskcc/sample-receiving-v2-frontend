// actions should not have this much BL, will change once it gets too convoluted
import axios from 'axios'
import {
  diff,
  generateRows,
  generateAGColumns,
  generateGridData,
  updateRows,
} from './helpers'

let API_ROOT = 'http://localhost:9004'
if (process.env.NODE_ENV === 'production') {
  API_ROOT = '/apps/auth/'
  // API_ROOT = 'https://rex.mskcc.org/apps/auth/'
}
// TODO will this stay a grid action?
export const REQUEST_COLUMNS = 'REQUEST_COLUMNS'
export const REQUEST_INITIAL_COLUMNS = 'REQUEST_INITIAL_COLUMNS'

export const NO_CHANGE = 'NO_CHANGE'
export const NO_CHANGE_RESET = 'NO_CHANGE_RESET'

export const UPDATE_NUM_OF_ROWS = 'UPDATE_NUM_OF_ROWS'
export const UPDATE_NUM_OF_ROWS_SUCCESS = 'UPDATE_NUM_OF_ROWS_SUCCESS'

export const RECEIVE_COLUMNS_FROM_CACHE = 'RECEIVE_COLUMNS_FROM_CACHE'
export const RECEIVE_COLUMNS_SUCCESS = 'RECEIVE_COLUMNS_SUCCESS'
// export const RECEIVE_COLUMNS_INVALID_COMBINATION = 'RECEIVE_COLUMNS_INVALID_COMBINATION'
export const RECEIVE_COLUMNS_FAIL = 'RECEIVE_COLUMNS_FAIL'

export function getColumns(formValues) {
  return (dispatch, getState) => {
    dispatch({ type: REQUEST_COLUMNS })

    // no grid? get inital columns
    if (getState().upload.grid.form.length == 0) {
      return dispatch(getInitialColumns(formValues))
      // TODO smell to have this in an action
    } else {
      let diffValues = diff(getState().upload.grid.form, formValues)

      if (diffValues === undefined) {
        dispatch({ type: NO_CHANGE })
        return setTimeout(() => {
          dispatch({ type: NO_CHANGE_RESET })
        }, 1000)
      }

      //#samples -> #number rows, rest same, only update rows number
      else if (
        Object.keys(diffValues).length === 1 &&
        'number_of_samples' in diffValues
      ) {
        dispatch({ type: UPDATE_NUM_OF_ROWS })

        let rows = updateRows(
          formValues,
          getState().upload.grid
        )
        return dispatch({
          type: UPDATE_NUM_OF_ROWS_SUCCESS,
          rows: rows,
          form: formValues,
        })
      } else return dispatch(getInitialColumns(formValues))
    }
  }
}

export function getInitialColumns(formValues) {
  let material = formValues.material
  let application = formValues.application
  return dispatch => {
    dispatch({ type: REQUEST_INITIAL_COLUMNS })
    material = material.replace('/', '_PIPI_SLASH_')
    application = application.replace('/', '_PIPI_SLASH_')
    return axios
      .get(API_ROOT + '/columnDefinition?', {
        params: {
          type: material,
          recipe: application,
        },
      })
      .then(response => {
        // Handsontable binds to your data source (list of arrays or list of objects) by reference. Therefore, all the data entered in the grid will alter the original data source.
        let grid = generateGridData(response.data.columnDefs, formValues)

        dispatch({
          type: RECEIVE_COLUMNS_SUCCESS,
          grid: grid,
          form: formValues,
        })
        return response
      })
      .catch(error => {
        dispatch({
          type: RECEIVE_COLUMNS_FAIL,
          error: error,
          application: application,
          material: material,
        })
        return error
      })
  }
}

export const RESET_GRID_ERROR_MESSAGE = 'RESET_GRID_ERROR_MESSAGE'

// Resets the currently visible error message.
export const resetGridErrorMessage = () => ({
  type: RESET_GRID_ERROR_MESSAGE,
})
