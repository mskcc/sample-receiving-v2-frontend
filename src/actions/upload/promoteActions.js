import axios from 'axios'
import Swal from 'sweetalert2'
import { Config } from '../../config.js'
import { generatePromoteGridData, generateSubmitDataPromote } from '../helpers'

export const REQUEST_INITIAL_STATE_PROMOTE = 'REQUEST_INITIAL_STATE_PROMOTE'

export const RECEIVE_INITIAL_STATE_PROMOTE_SUCCESS =
  'RECEIVE_INITIAL_STATE_PROMOTE_SUCCESS'

export const RECEIVE_INITIAL_STATE_PROMOTE_FAIL =
  'RECEIVE_INITIAL_STATE_PROMOTE_FAIL'
export const INITIAL_STATE_PROMOTE_RETRIEVED = 'INITIAL_STATE_PROMOTE_RETRIEVED'

export function getInitialState() {
  return (dispatch, getState) => {
    if (getState().upload.promote.initialFetched)
      return dispatch({ type: INITIAL_STATE_PROMOTE_RETRIEVED })
    else {
      dispatch({ type: REQUEST_INITIAL_STATE_PROMOTE })
      return axios
        .get(Config.API_ROOT + '/allColumnsPromote')
        .then(response => {
          console.log(response)
          let grid = generatePromoteGridData(response.data.columnDefs)
          dispatch({
            type: RECEIVE_INITIAL_STATE_PROMOTE_SUCCESS,
            grid: grid,
          })
          return response
        })
        .catch(error =>
          dispatch({
            type: RECEIVE_INITIAL_STATE_PROMOTE_FAIL,
            error: error,
          })
        )
    }
  }
}

export const REQUEST_BANKED_SAMPLES = 'REQUEST_BANKED_SAMPLES'

export const RECEIVE_BANKED_SAMPLES_SUCCESS = 'RECEIVE_BANKED_SAMPLES_SUCCESS'

export const RECEIVE_BANKED_SAMPLES_FAIL = 'RECEIVE_BANKED_SAMPLES_FAIL'
export const BANKED_SAMPLES_RETRIEVED = 'BANKED_SAMPLES_RETRIEVED'

export function loadBankedSamples(serviceId) {
  return (dispatch, getState) => {
    dispatch({ type: REQUEST_BANKED_SAMPLES })
    return axios
      .get(Config.API_ROOT + '/getSamples', {
        params: { serviceId: serviceId },
      })
      .then(response => {
        console.log(response)
        var rows = response.data.map(a => Object.assign({}, a))
        var rowsBackup = response.data.map(a => Object.assign({}, a))
        dispatch({
          type: RECEIVE_BANKED_SAMPLES_SUCCESS,
          rows: rows,
          rowsBackup: rowsBackup,
        })
        return response
      })
      .catch(error =>
        dispatch({
          type: RECEIVE_BANKED_SAMPLES_FAIL,
          error: error,
        })
      )
  }
}

export const REQUEST_UPDATE_BANKED_SAMPLES = 'REQUEST_UPDATE_BANKED_SAMPLES'

export const RECEIVE_UPDATE_BANKED_SAMPLES_SUCCESS =
  'RECEIVE_UPDATE_BANKED_SAMPLES_SUCCESS'

export const RECEIVE_UPDATE_BANKED_SAMPLES_FAIL =
  'RECEIVE_UPDATE_BANKED_SAMPLES_FAIL'

export const REQUEST_PROMOTE_DRYRUN = 'REQUEST_PROMOTE_DRYRUN'

export const RECEIVE_PROMOTE_DRYRUN_SUCCESS = 'RECEIVE_PROMOTE_DRYRUN_SUCCESS'

export const RECEIVE_PROMOTE_DRYRUN_FAIL = 'RECEIVE_PROMOTE_DRYRUN_FAIL'
export const REQUEST_PROMOTE_FORREAL = 'REQUEST_PROMOTE_FORREAL'

export const RECEIVE_PROMOTE_FORREAL_SUCCESS = 'RECEIVE_PROMOTE_FORREAL_SUCCESS'

export const RECEIVE_PROMOTE_FORREAL_FAIL = 'RECEIVE_PROMOTE_FORREAL_FAIL'

export function promoteAll(projectId, requestId) {
  return (dispatch, getState) => {
    let rows = getState().upload.promote.rows
    let rowsBackup = getState().upload.promote.rowsBackup
    console.log(rows)
    console.log(rowsBackup)
    console.log(isEqual(rows, rowsBackup))
    dispatch({ type: REQUEST_PROMOTE_DRYRUN })
    if (!isEqual(rows, rowsBackup)) {
      axios
        .post(Config.API_ROOT + '/updateBankedSamples', {
          data: generateSubmitDataPromote(getState()),
        })
        .then(response => {
          console.log(response)
          console.log(response.data)
          var rows = { ...response.data }
          var rowsBackup = { ...response.data }
          dispatch({
            type: RECEIVE_UPDATE_BANKED_SAMPLES_SUCCESS,
            rows: rows,
            rowsBackup: rowsBackup,
          })

          return dispatch(promoteForReal(projectId, requestId))
        })
        .catch(error => {
          return dispatch({
            type: RECEIVE_PROMOTE_DRYRUN_FAIL,
            error: error,
          })
        })
    } else {
      return dispatch(promoteForReal(projectId, requestId))
    }
    // return axios
    //   .get(Config.API_ROOT + '/getSamples', {
    //     params: { serviceId: serviceId },
    //   })
    //   .then(response => {
    //     console.log(response)

    //     dispatch({
    //       type: RECEIVE_PROMOTE_ALL_SUCCESS,
    //       rows: response.data,
    //     })
    //     return response
    //   })
    //   .catch(error =>
    //     dispatch({
    //       type: RECEIVE_PROMOTE_ALL_FAIL,
    //       error: error,
    //     })
    //   )
  }
}

export function promoteForReal(projectId, requestId) {
  return (dispatch, getState) => {
    let rows = getState().upload.promote.rows
    let bankedId = []
    bankedId = rows.map(elem => {
      return elem.recordId
    })
    let data = {
      projectId: projectId ? projectId : '',
      requestId: requestId ? requestId : '',
      serviceId: rows[0].serviceId,
      bankedId: bankedId,
      dryrun: true,
    }
    axios
      .post(Config.API_ROOT + '/promoteBankedSample', {
        data: data,
      })
      .then(response => {
        console.log(response)
        dispatch({ type: RECEIVE_PROMOTE_DRYRUN_SUCCESS })
        Swal.fire({
          title: response.data + '?',
          // html: response.data,
          // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
          type: 'info',
          animation: false,
          showCancelButton: true,
          confirmButtonText: 'Okay!',
          confirmButtonColor: '#df4602',
          cancelButtonColor: '#007cba',
          // customClass: { content: 'alert' },
        }).then(result => {
          if (!result.value) {
            dispatch({ type: RECEIVE_PROMOTE_DRYRUN_SUCCESS })
          } else {
            console.log('dryrun false')
            dispatch({ type: REQUEST_PROMOTE_FORREAL })
            // it works!
            data.dryrun = false
            // location.reload()
            axios
              .post(Config.API_ROOT + '/promoteBankedSample', {
                data: data,
              })
              .then(response => {
                dispatch({ type: RECEIVE_PROMOTE_FORREAL_SUCCESS })
                console.log(response)
                Swal.fire({
                  title: 'Promoted!',
                  html: response.data,
                  // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
                  type: 'success',
                  animation: false,
                  confirmButtonText: 'Dismiss',
                  // customClass: { content: 'alert' },
                })
              })
              .catch(error => {
                if (
                  error.response &&
                  error.response.data &&
                  error.response.data.message &&
                  error.response.data.message.includes('Invalid characters')
                ) {
                  dispatch({ type: RECEIVE_PROMOTE_FORREAL_SUCCESS })
                  Swal.fire({
                    title: 'Promoted!',
                    // html: response.data,
                    // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
                    type: 'success',
                    animation: false,
                    confirmButtonText: 'Dismiss',
                    // customClass: { content: 'alert' },
                  })
                } else {
                  dispatch({ type: RECEIVE_PROMOTE_FORREAL_FAIL })
                  console.log(error)
                  Swal.fire({
                    title: 'Error',
                    html: error.response.data,
                    // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
                    type: 'error',
                    animation: false,
                    confirmButtonText: 'Dismiss',
                    // customClass: { content: 'alert' },
                  })
                }
              })
          }
        })
        return dispatch({
          type: RECEIVE_PROMOTE_DRYRUN_SUCCESS,
        })
      })
      .catch(error => {
        console.log(error)
        Swal.fire({
          title: 'Error',
          html:
            'Something went wrong. Please tell Lisa or Anna to check the logs.',
          // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
          type: 'error',
          animation: false,
          confirmButtonText: 'Dismiss',
          // customClass: { content: 'alert' },
        })
        return dispatch({
          type: RECEIVE_PROMOTE_DRYRUN_FAIL,
        })
      })
  }
}

const isEqual = function(value, other) {
  // Get the value type
  var type = Object.prototype.toString.call(value)

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false

  // If items are not an object or array, return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false

  // Compare the length of the length of the two items
  var valueLen =
    type === '[object Array]' ? value.length : Object.keys(value).length
  var otherLen =
    type === '[object Array]' ? other.length : Object.keys(other).length
  if (valueLen !== otherLen) return false

  // Compare two items
  var compare = function(item1, item2) {
    // Get the object type
    var itemType = Object.prototype.toString.call(item1)

    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false
    }

    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) return false
      } else {
        if (item1 !== item2) return false
      }
    }
  }

  // Compare properties
  if (type === '[object Array]') {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false
    }
  } else {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false
      }
    }
  }

  // If nothing failed, return true
  return true
}
