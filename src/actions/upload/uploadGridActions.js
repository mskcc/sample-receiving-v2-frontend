// actions should not have this much BL, will change once it gets too convoluted
import React from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import {
  diff,
  findSubmission,
  generateSubmitData,
  generateRows,
  generateAGColumns,
  generateGridData,
  generateSubmissionsGrid,
  updateRows,
  redactMRN,
  createPatientId,
  appendAssay,
  findIndexSeq,
  validateGrid,
} from '../helpers'

import { Config } from '../../config.js'

// Add a request interceptor
axios.interceptors.request.use(
  config => {
    let token = sessionStorage.getItem('access_token')
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },

  error => {
    return Promise.reject(error)
  }
)

export const REGISTER_GRID_CHANGE = 'REGISTER_GRID_CHANGE'
export const REGISTER_GRID_CHANGE_PRE_VALIDATE =
  'REGISTER_GRID_CHANGE_PRE_VALIDATE'

export const REGISTER_GRID_CHANGE_POST_VALIDATE =
  'REGISTER_GRID_CHANGE_POST_VALIDATE'
export const RESET_MESSAGE = 'RESET_MESSAGE'
export const registerGridChange = changes => {
  return (dispatch, getState) => {
    let result = validateGrid(changes, getState().upload.grid)
    // dispatch({ type: RESET_MESSAGE })
    // would prefer to have this in reducer
    if (result.numErrors > 1) {
      Swal.fire({
        title: 'Invalid Values',
        html: result.errorMessage,
        footer: 'To avoid mistakes, invalid cells are cleared immediately.',
        type: 'error',
        animation: false,
        confirmButtonText: 'Dismiss',
        confirmButtonColor: '#007cba',
        customClass: { content: 'alert' },
      })
      return dispatch({
        type: REGISTER_GRID_CHANGE_POST_VALIDATE,
        payload: result,
      })
    } else {
      return dispatch({
        type: REGISTER_GRID_CHANGE_POST_VALIDATE,
        payload: result,
        message: result.errorMessage.replace(/<br>/g, ''),
      })
    }
  }
}

export const preValidate = () => {
  return dispatch => {
    dispatch({
      type: REGISTER_GRID_CHANGE_PRE_VALIDATE,
      message: 'Pasting large set, please be patient.',
    })
  }
}

export const GET_COLUMNS = 'GET_COLUMNS'
export const GET_INITIAL_COLUMNS = 'GET_INITIAL_COLUMNS'

export const NO_CHANGE = 'NO_CHANGE'
export const NO_CHANGE_RESET = 'NO_CHANGE_RESET'

export const UPDATE_NUM_OF_ROWS = 'UPDATE_NUM_OF_ROWS'
export const UPDATE_NUM_OF_ROWS_SUCCESS = 'UPDATE_NUM_OF_ROWS_SUCCESS'

export const GET_COLUMNS_FROM_CACHE = 'GET_COLUMNS_FROM_CACHE'
export const GET_COLUMNS_SUCCESS = 'GET_COLUMNS_SUCCESS'
// export const GET_COLUMNS_INVALID_COMBINATION = 'GET_COLUMNS_INVALID_COMBINATION'
export const GET_COLUMNS_FAIL = 'GET_COLUMNS_FAIL'

export function getColumns(formValues) {
  return (dispatch, getState) => {
    // let formValues = getState().upload.form.selected
    dispatch({ type: GET_COLUMNS })

    // no grid? get inital columns
    if (getState().upload.grid.form.length == 0) {
      return dispatch(getInitialColumns(formValues, getState().user.role))
    } else {
      let diffValues = diff(getState().upload.grid.form, formValues)
      if (!diffValues || Object.entries(diffValues).length === 0) {
        Swal.fire({
          title: 'Nothing to change.',
          type: 'info',
          animation: false,
          confirmButtonColor: '#007cba',
          confirmButtonText: 'Dismiss',
        })

        dispatch({ type: NO_CHANGE })
        return setTimeout(() => {
          dispatch({ type: NO_CHANGE_RESET })
        }, 1000)
      }

      //#samples -> #number rows, rest same, only update rows number
      else if (
        Object.entries(diffValues).length === 1 &&
        'number_of_samples' in diffValues
      ) {
        dispatch({ type: UPDATE_NUM_OF_ROWS })

        let rows = updateRows(formValues, getState().upload.grid)
        return dispatch({
          type: UPDATE_NUM_OF_ROWS_SUCCESS,
          message: 'Number of rows updated.',
          rows: rows,
          form: formValues,
        })
      } else
        Swal.fire({
          title: 'Are you sure?',
          text:
            'Changing Material, Application, Species, Patient ID Type or Container causes the grid to be cleared and re-generated.',
          type: 'warning',
          showCancelButton: true,
          animation: false,
          confirmButtonColor: '#df4602',
          cancelButtonColor: '#007cba',
          confirmButtonText: 'Yes, re-generate!',
        }).then(result => {
          if (result.value) {
            return dispatch(getInitialColumns(formValues, getState().user.role))
          }
          else {
            return dispatch({type: NO_CHANGE_RESET})
          }
        })
    }
  }
}

export function getInitialColumns(formValues, userRole) {
  let material = formValues.material
  let application = formValues.application
  return dispatch => {
    dispatch({ type: GET_INITIAL_COLUMNS })
    material = material.replace('/', '_PIPI_SLASH_')
    application = application.replace('/', '_PIPI_SLASH_')
    return axios
      .get(Config.API_ROOT + '/columnDefinition?', {
        params: {
          type: material,
          recipe: application,
        },
      })
      .then(response => {
        // Handsontable binds to your data source (list of arrays or list of objects) by reference. Therefore, all the data entered in the grid will alter the original data source.
        let grid = generateGridData(response.data.columnDefs, formValues)

        dispatch({
          type: GET_COLUMNS_SUCCESS,
          grid: grid,
          form: formValues,
        })
        return response
      })
      .catch(error => {
        dispatch({
          type: GET_COLUMNS_FAIL,
          error: error,
          application: application,
          material: material,
        })
        return error
      })
  }
}

export const ADD_GRID_TO_BANKED_SAMPLE = 'ADD_GRID_TO_BANKED_SAMPLE'
export const ADD_GRID_TO_BANKED_SAMPLE_FAIL = 'ADD_GRID_TO_BANKED_SAMPLE_FAIL'
export const ADD_GRID_TO_BANKED_SAMPLE_SUCCESS =
  'ADD_GRID_TO_BANKED_SAMPLE_SUCCESS'
export const BUTTON_RESET = 'BUTTON_RESET'
export function addGridToBankedSample() {
  return (dispatch, getState) => {
    dispatch({ type: ADD_GRID_TO_BANKED_SAMPLE })

    return axios
      .post(Config.API_ROOT + '/addBankedSamples', {
        data: generateSubmitData(getState()),
      })
      .then(response => {
        dispatch({
          type: ADD_GRID_TO_BANKED_SAMPLE_SUCCESS,
          message: 'Submitted! Check your submissions.',
        })
        return response
      })
      .catch(error => {
        dispatch({
          type: ADD_GRID_TO_BANKED_SAMPLE_FAIL,
          error: error,
        })
        return error
      })
  }
}

export const EDIT_SUBMISSION = 'EDIT_SUBMISSION'
export const EDIT_SUBMISSION_FAIL = 'EDIT_SUBMISSION_FAIL'
export const EDIT_SUBMISSION_SUCCESS = 'EDIT_SUBMISSION_SUCCESS'
export function editSubmission(id, ownProps) {
  return (dispatch, getState) => {
    dispatch({ type: 'EDIT_SUBMISSION' })
    let submission = findSubmission(getState().user.submissions, id)
    if (submission) {
      //  decided to rebuild grid instead of saving colFeatues and headers to avoid version
      dispatch(
        getInitialColumns(JSON.parse(submission.form_values)),
        getState().user.role
      ).then(() => {
        dispatch({
          type: 'EDIT_SUBMISSION_SUCCESS',
          payload: submission,
        })
        return ownProps.history.push('upload')
      })
    } else {
      return dispatch({
        type: 'EDIT_SUBMISSION_FAIL',
      })
    }
  }
}

export const HANDLE_PATIENT_ID = 'HANDLE_PATIENT_ID'
export const HANDLE_PATIENT_ID_FAIL = 'HANDLE_PATIENT_ID_FAIL'
export const HANDLE_PATIENT_ID_SUCCESS = 'HANDLE_PATIENT_ID_SUCCESS'
export function handlePatientId(rowIndex) {
  return (dispatch, getState) => {
    let rows = getState().upload.grid.rows
    dispatch({ type: 'HANDLE_PATIENT_ID' })
    if (/[0-9]{8}/.test(rows[rowIndex].patientId)) {
      return dispatch(handleMRN(rowIndex, rows[rowIndex].patientId))
    }
    let normalizedPatientID = ''
    if (/[0-9a-zA-Z]/.test(rows[rowIndex].patientId)) {
      if (
        getState().upload.grid.form.patient_id_type ==
        'Cell Lines, not from Patients'
      ) {
        normalizedPatientID =
          'CELLLINE_' +
          getState()
            .upload.grid.rows[rowIndex].patientId.replace(/_|\W/g, '')
            .toUpperCase()
      } else {
        normalizedPatientID =
          getState().user.username.toUpperCase() +
          '_' +
          getState().upload.grid.rows[rowIndex].patientId
      }
      let message = {}
      return axios
        .post(Config.API_ROOT + '/patientIdConverter', {
          data: {
            patient_id: normalizedPatientID,
          },
        })
        .then(response => {
          if (getState().user.role != 'user') {
            message = {
              message: 'Patient ID normalized for IGO internal use.',
            }
          }
          dispatch({
            type: HANDLE_PATIENT_ID_SUCCESS,
            // ...message,
            rows: createPatientId(
              getState().upload.grid.rows,
              rowIndex,
              response.data.patient_id,
              normalizedPatientID
            ),
          })
          dispatch({ type: REGISTER_GRID_CHANGE })
        })
        .catch(error => {
          dispatch({
            type: HANDLE_PATIENT_ID_FAIL,

            error: error,
            rows: createPatientId(
              getState().upload.grid.rows,
              rowIndex,
              response.data.patient_id,
              ''
            ),
          })
          return error
        })
      return dispatch({ type: REGISTER_GRID_CHANGE })
    }

    if (getState().upload.grid.rows[rowIndex].patientId == '') {
      return dispatch({
        type: HANDLE_PATIENT_ID_SUCCESS,
        rows: redactMRN(getState().upload.grid.rows, rowIndex, '', '', ''),
      })
    }
  }
}

export const HANDLE_MRN = 'HANDLE_MRN'
export const HANDLE_MRN_FAIL = 'HANDLE_MRN_FAIL'
export const HANDLE_MRN_SUCCESS = 'HANDLE_MRN_SUCCESS'
export function handleMRN(rowIndex, patientId) {
  return (dispatch, getState) => {
    dispatch({ type: 'HANDLE_MRN' })

    return axios
      .post(Config.API_ROOT + '/patientIdConverter', {
        data: {
          patient_id: patientId,
        },
      })
      .then(response => {
        dispatch({
          type: HANDLE_MRN_SUCCESS,
          message: 'MRN redacted.',
          rows: redactMRN(
            getState().upload.grid.rows,
            rowIndex,
            response.data.patient_id,
            'MRN REDACTED',
            response.data.sex
          ),
        })
        dispatch({ type: REGISTER_GRID_CHANGE })
      })
      .catch(error => {
        dispatch({
          type: HANDLE_MRN_FAIL,

          error: error,
          rows: redactMRN(getState().upload.grid.rows, rowIndex, '', '', ''),
        })
        return error
      })
    return dispatch({ type: REGISTER_GRID_CHANGE })
  }
}

export const HANDLE_ASSAY = 'HANDLE_ASSAY'
// export const HANDLE_ASSAY_FAIL = 'HANDLE_ASSAY_FAIL'
// export const HANDLE_ASSAY_SUCCESS = 'HANDLE_ASSAY_SUCCESS'
export function handleAssay(rowIndex, oldValue, newValue) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'HANDLE_ASSAY_SUCCESS',
      rows: appendAssay(
        getState().upload.grid.rows,
        rowIndex,
        oldValue,
        newValue
      ),
    })
  }
}

export const HANDLE_INDEX_SUCCESS = 'HANDLE_INDEX_SUCCESS'
export const HANDLE_INDEX_FAIL = 'HANDLE_INDEX_FAIL'
export function handleIndex(colIndex, rowIndex, newValue) {
  return (dispatch, getState) => {
    let indexSeq = findIndexSeq(
      getState().upload.grid,
      colIndex,
      rowIndex,
      newValue
    )
    if (indexSeq.success) {
      return dispatch({
        type: HANDLE_INDEX_SUCCESS,
        rows: indexSeq.rows,
      })
    } else {
      return dispatch({
        type: HANDLE_INDEX_FAIL,
        message:
          'Index Sequence could not be found. Are you sure the Index ID is correct?',
      })
    }
  }
}

export const RESET_GRID_ERROR_MESSAGE = 'RESET_GRID_ERROR_MESSAGE'

// Resets the currently visible error message.
export const resetGridErrorMessage = () => ({
  type: RESET_GRID_ERROR_MESSAGE,
})
