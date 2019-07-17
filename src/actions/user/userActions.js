import axios from 'axios'
import Swal from 'sweetalert2'
import {
  generateSubmitData,
  generateSubmissionsGrid,
  findSubmission,
  submissionExists,
  checkGridAndForm,
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
// // Add a response interceptor
// axios.interceptors.response.use(
//   function(response) {
//     // Do something with response data
//     return response
//   },
//   function(error) {
//     // Do something with response error
//     return Promise.reject(error)
//   }
// )

export const REFRESH_TOKEN_VALID = 'REFRESH_TOKEN_VALID'
export const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN_REQUEST'
export const REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID'

export function refreshToken() {
  return dispatch => {
    let token = sessionStorage.getItem('refresh_token')
    if (token) {
      dispatch({ type: REFRESH_TOKEN_REQUEST })

      return axios
        .get(
          Config.API_ROOT + '/refresh',
          { headers: { Authorization: `Bearer ${token}` } },
          {}
        )
        .then(response => {
          sessionStorage.setItem('access_token', response.data.access_token)
          dispatch({
            type: REFRESH_TOKEN_VALID,
            message: '',
            payload: response.data,
          })
        })

        .catch(error => {
          sessionStorage.removeItem('refresh_token')
          sessionStorage.removeItem('access_token')
          sessionStorage.removeItem('persist:root')

          if (error.response) {
            return dispatch({
              type: REFRESH_TOKEN_INVALID,
              error: error,
            })
          } else {
            dispatch({
              type: SERVER_ERROR,
              error: error,
            })
          }
        })
    } else {
      sessionStorage.removeItem('refresh_token')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('persist:root')
      dispatch({
        type: REFRESH_TOKEN_INVALID,
        message: 'Your session expired. Please log in again.',
      })
    }
  }
}

export const SERVER_ERROR = 'SERVER_ERROR'

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_FAIL = 'LOGIN_FAIL'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export function login(username, password) {
  return dispatch => {
    dispatch({ type: LOGIN_REQUEST })
    return axios
      .post(Config.API_ROOT + '/login', {
        data: {
          username: username,
          password: password,
        },
      })
      .then(response => {
        sessionStorage.setItem('access_token', response.data.access_token)
        sessionStorage.setItem('refresh_token', response.data.refresh_token)

        return dispatch({
          type: LOGIN_SUCCESS,
          message: response.data.message,
          payload: response.data,
          table: generateSubmissionsGrid({
            submissions: response.data.submissions,
            submission_columns: response.data.submission_columns,
          }),
        })
      })

      .catch(error => {
        return dispatch({
          type: LOGIN_FAIL,
          error: error,
        })
      })
  }
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_FAIL = 'LOGOUT_FAIL'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export function logout() {
  return dispatch => {
    dispatch({ type: LOGOUT_REQUEST })
    sessionStorage.removeItem('persist:root')

    let access_token = sessionStorage.getItem('access_token')
    let refresh_token = sessionStorage.getItem('refresh_token')

    if (access_token) {
      axios
        .get(Config.API_ROOT + '/logoutAccess', {})
        .then(response => {
          sessionStorage.removeItem('access_token')
        })
        .catch(error => {
          return dispatch({
            type: LOGOUT_FAIL,
            message: error.response.data.message,
          })
        })
    }
    let token = sessionStorage.getItem('refresh_token')
    if (refresh_token) {
      sessionStorage.removeItem('refresh_token')
      axios
        .get(
          Config.API_ROOT + '/logoutRefresh',
          { headers: { Authorization: `Bearer ${token}` } },
          {}
        )
        .then(response => {
          return dispatch({
            type: LOGOUT_SUCCESS,
          })
        })
        .catch(error => {
          return dispatch({
            type: LOGOUT_FAIL,
            message: error.response.data.message,
          })
        })
    } else
      return dispatch({
        type: LOGOUT_SUCCESS,
      })
  }
}

export const BUTTON_RESET = 'BUTTON_RESET'

//  to save a submission, first check wether header matches grid
//  then check wether submission exists
export const SAVE_PARTIAL_SUBMISSION = 'SAVE_PARTIAL_SUBMISSION'
export const SAVE_PARTIAL_SUBMISSION_CANCEL = 'SAVE_PARTIAL_SUBMISSION_CANCEL'
export const SAVE_PARTIAL_SUBMISSION_FAIL = 'SAVE_PARTIAL_SUBMISSION_FAIL'
export const SAVE_PARTIAL_SUBMISSION_SUCCESS = 'SAVE_PARTIAL_SUBMISSION_SUCCESS'
export function savePartialSubmission(grid) {
  return (dispatch, getState) => {
    let user = getState().user
    dispatch({ type: SAVE_PARTIAL_SUBMISSION })

    let match = checkGridAndForm(
      getState().upload.form.selected,
      getState().upload.grid.form
    )
    if (!match.success) {
      Swal.fire({
        title: 'Header does not match grid',
        html:
          'Please make sure your current header values match the ones used to generate the table. <br>(Header value x Table value) <br>' +
          match.message,
        // footer: 'To avoid mistakes, invalid cells are cleared immediately.',
        type: 'error',
        animation: false,
        confirmButtonText: 'Dismiss',
        // customClass: { content: 'alert' },
      })
      return
    } else {
      if (
        submissionExists(
          grid.form.service_id,
          grid.form.material,
          user.username,
          user.submissions
        )
      ) {
        Swal.fire({
          title: 'Duplicate found',
          html:
            'A request for ' +
            grid.form.material +
            ' with this Service ID and your username already exists. Are you sure you want to overwrite it?',
          // footer:
          //   'If you need to split up a large request into multiple smaller ones, we recommend you select "I don\'t have an iLabs ID" to avoid the duplicate check on "Save Table" and fill in the correct ID on submission.',
          type: 'info',
          animation: 'false',

          showCancelButton: true,
          animation: false,
          confirmButtonColor: '#df4602',
          cancelButtonColor: '#007cba',
          confirmButtonText: 'Overwrite',
          cancelButtonText: 'Cancel',
        }).then(value => {
          if (value) {
            return axios
              .post(Config.API_ROOT + '/saveSubmission', {
                data: {
                  ...generateSubmitData(getState()),
                  username: getState().user.username,
                },
              })
              .then(response => {
                // Handsontable binds to your data source (list of arrays or list of objects) by reference. Therefore, all the data entered in the grid will alter the original data source.
                dispatch({
                  type: SAVE_PARTIAL_SUBMISSION_SUCCESS,
                  payload: {
                    submissions: response.data.submissions,
                    table: generateSubmissionsGrid(response.data),
                  },
                  message: 'Saved!',
                })
                // used to reset saved! msg on button
                return setTimeout(() => {
                  dispatch({ type: BUTTON_RESET })
                }, 2000)
              })
              .catch(error => {
                dispatch({
                  type: SAVE_PARTIAL_SUBMISSION_FAIL,
                  error: error,
                })
                return error
              })
          } else {
            return dispatch({
              type: SAVE_PARTIAL_SUBMISSION_CANCEL,
            })
          }
        })
      } else {
        return axios
          .post(Config.API_ROOT + '/saveSubmission', {
            data: {
              ...generateSubmitData(getState()),
              username: getState().user.username,
            },
          })
          .then(response => {
            // Handsontable binds to your data source (list of arrays or list of objects) by reference. Therefore, all the data entered in the grid will alter the original data source.
            dispatch({
              type: SAVE_PARTIAL_SUBMISSION_SUCCESS,
              payload: {
                submissions: response.data.submissions,
                table: generateSubmissionsGrid(response.data),
              },
              message: 'Saved!',
            })
            // used to reset saved! msg on button
            return setTimeout(() => {
              dispatch({ type: BUTTON_RESET })
            }, 2000)
          })
          .catch(error => {
            dispatch({
              type: SAVE_PARTIAL_SUBMISSION_FAIL,
              error: error,
            })
            return error
          })
      }
    }
  }
}

export const GET_SUBMISSIONS = 'GET_SUBMISSIONS'
export const GET_SUBMISSIONS_FAIL = 'GET_SUBMISSIONS_FAIL'
export const GET_SUBMISSIONS_SUCCESS = 'GET_SUBMISSIONS_SUCCESS'
export function getSubmissions() {
  return dispatch => {
    dispatch({ type: GET_SUBMISSIONS })
    return axios
      .get(Config.API_ROOT + '/getSubmissions', {})
      .then(response => {
        return dispatch({
          type: GET_SUBMISSIONS_SUCCESS,
          payload: {
            submissions: response.data.submissions,
            table: generateSubmissionsGrid(response.data),
          },
        })
      })
      .catch(error => {
        return dispatch({
          type: GET_SUBMISSIONS_FAIL,
          error: error,
        })
        return error
      })
  }
}

export const DELETE_SUBMISSION = 'DELETE_SUBMISSION'
export const DELETE_SUBMISSION_FAIL = 'DELETE_SUBMISSION_FAIL'
export const DELETE_SUBMISSION_SUCCESS = 'DELETE_SUBMISSION_SUCCESS'
export function deleteSubmission(id, username) {
  return dispatch => {
    dispatch({ type: DELETE_SUBMISSION })
    return axios
      .post(Config.API_ROOT + '/deleteSubmission', {
        data: { service_id: id, username: username },
      })
      .then(response => {
        return dispatch({
          type: DELETE_SUBMISSION_SUCCESS,
          payload: {
            submissions: response.data.submissions,
            table: generateSubmissionsGrid(response.data),
          },
          message: 'Submission ' + id + ' successfully deleted.',
        })
      })
      .catch(error => {
        return dispatch({
          type: DELETE_SUBMISSION_FAIL,
          error: error,
        })
        return error
      })
  }
}

export const DOWNLOAD_RECEIPT = 'DOWNLOAD_RECEIPT'
export const DOWNLOAD_RECEIPT_FAIL = 'DOWNLOAD_RECEIPT_FAIL'
export const DOWNLOAD_RECEIPT_SUCCESS = 'DOWNLOAD_RECEIPT_SUCCESS'
export function downloadReceipt(id, username) {
  return dispatch => {
    dispatch({ type: DOWNLOAD_RECEIPT })
    return axios
      .get(Config.API_ROOT + '/download', {
        params: { service_id: id, username: username },
        responseType: 'blob',
      })
      .then(response => {
        dispatch({
          type: DOWNLOAD_RECEIPT_SUCCESS,
          file: response.data,
          filename: 'Receipt-' + id + '-' + username, // payload: {
          //   submissions: response.data.submissions,
          //   table: generateSubmissionsGrid(response.data),
          // },
        })
      })
      .catch(error => {
        return dispatch({
          type: DOWNLOAD_RECEIPT_FAIL,
          error: error,
        })
        return error
      })
  }
}

// export const EDIT_SUBMISSION = 'EDIT_SUBMISSION'
// export const EDIT_SUBMISSION_FAIL = 'EDIT_SUBMISSION_FAIL'
// export const EDIT_SUBMISSION_SUCCESS = 'EDIT_SUBMISSION_SUCCESS'
// export function editSubmission(id) {
//   return (dispatch, getState) => {
//     dispatch({ type: 'EDIT_SUBMISSION' })
//     let submission = findSubmission(getState().user.submissions, id)
//     if (submission) {
//       return dispatch({
//         type: 'EDIT_SUBMISSION_SUCCESS',
//         payload: 'submission',
//       })
//     } else {
//       return dispatch({
//         type: 'EDIT_SUBMISSION_FAIL',
//       })
//     }
//   }
// }

// export const GET_SUBMISSIONS_EXISTS = 'GET_SUBMISSIONS_EXISTS'
// export const GET_SUBMISSIONS_EXISTS_FAIL = 'GET_SUBMISSIONS_EXISTS_FAIL'
// export const GET_SUBMISSIONS_EXISTS_SUCCESS = 'GET_SUBMISSIONS_EXISTS_SUCCESS'
// export function submissionExists(username, request_id) {
//   return dispatch => {
//     dispatch({ type: GET_SUBMISSIONS_EXISTS })
//     return axios
//       .post(Config.API_ROOT + '/submissionExists', {
//         data: {
//           username: username,
//           request_id: request_id,
//         },
//       })
//       .then(response => {
//         console.log(response.data)
//         dispatch({
//           type: GET_SUBMISSIONS_EXISTS_SUCCESS,
//           payload: response.data,
//         })
//       })
//       .catch(error => {
//         dispatch({
//           type: GET_SUBMISSIONS_EXISTS_FAIL,
//           error: error,
//         })
//         return error
//       })
//   }
// }

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

// Resets the currently visible error message.
export const resetErrorMessage = () => ({
  type: RESET_ERROR_MESSAGE,
})
