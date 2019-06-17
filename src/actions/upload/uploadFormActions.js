//TODO ERROR HANDLING
import axios from 'axios'

import { Config } from '../../config.js'

import { generateSubmissionsGrid } from '../helpers'

// materials that be combined with a Blocks/Slides/Tubes container
const BSTMaterials = ['tissue', 'cells', 'blood', 'buffy coat', 'other']
const PatientIDSpecies = ['human']
// const PatientIDSpecies = ['human', 'mouse', 'mouse_geneticallymodified']

export const REQUEST_MATERIALS_AND_APPLICATIONS =
  'REQUEST_MATERIALS_AND_APPLICATIONS'

export const RECEIVE_MATERIALS_AND_APPLICATIONS_SUCCESS =
  'RECEIVE_MATERIALS_AND_APPLICATIONS_SUCCESS'

export const RECEIVE_MATERIALS_AND_APPLICATIONS_FAIL =
  'RECEIVE_MATERIALS_AND_APPLICATIONS_FAIL'

export const REQUEST_INITIAL_STATE = 'REQUEST_INITIAL_STATE'

export const RECEIVE_INITIAL_STATE_SUCCESS = 'RECEIVE_INITIAL_STATE_SUCCESS'

export const RECEIVE_INITIAL_STATE_FAIL = 'RECEIVE_INITIAL_STATE_FAIL'
export const INITIAL_STATE_RETRIEVED = 'INITIAL_STATE_RETRIEVED'

export function getInitialState() {
  return (dispatch, getState) => {
    if (getState().upload.form.initialFetched)
      return dispatch({ type: INITIAL_STATE_RETRIEVED })
    else {
      dispatch({ type: REQUEST_INITIAL_STATE })
      return axios
        .get(Config.API_ROOT + '/upload/initialState')
        .then(response => {
          dispatch({
            type: RECEIVE_INITIAL_STATE_SUCCESS,
            form_data: response.data,
            user_data: {
              submissions: response.data.submissions,
              table: generateSubmissionsGrid(response.data),
            },
          })
          return response
        })
        .catch(error =>
          dispatch({
            type: RECEIVE_INITIAL_STATE_FAIL,
            error: error,
          })
        )
    }
  }
}

// get materials that can be combined with application

export const REQUEST_MATERIALS_FOR_APPLICATION =
  'REQUEST_MATERIALS_FOR_APPLICATION'

export const SELECT_APPLICATION = 'SELECT_APPLICATION'

export const RECEIVE_MATERIALS_FOR_APPLICATION_SUCCESS =
  'RECEIVE_MATERIALS_FOR_APPLICATION_SUCCESS'

export const RECEIVE_MATERIALS_FOR_APPLICATION_FAIL =
  'RECEIVE_MATERIALS_FOR_APPLICATION_FAIL'

export function getMaterialsForApplication(selectedApplication) {
  return dispatch => {
    dispatch({ type: SELECT_APPLICATION, selectedApplication })
    dispatch({ type: REQUEST_MATERIALS_FOR_APPLICATION })
    return axios
      .get(Config.API_ROOT + '/columnDefinition', {
        params: {
          // weird, legacy slash workaround, has to be changed in /LimsRest/getIntakeTerms
          recipe: selectedApplication.replace('/', '_PIPI_SLASH_'),
        },
      })
      .then(response => {
        dispatch({
          type: RECEIVE_MATERIALS_FOR_APPLICATION_SUCCESS,
          materials: response.data.choices,
          species: response.data.species,
        })
        return response
      })
      .catch(error => {
        dispatch({
          type: RECEIVE_MATERIALS_FOR_APPLICATION_FAIL,
          error: error,
        })
        return error
      })
  }
}
export const SELECT = 'SELECT'

export function select(id, value) {
  return dispatch => {
    if (id == 'service_id') {
      dispatch({
        type: SELECT,
        payload: { id: id, value: value },
        message: 'Service Id updated.',
      })
    } else {
      dispatch({ type: SELECT, payload: { id: id, value: value } })
    }
  }
}
export const CLEAR = 'CLEAR'

export function clear(id) {
  return dispatch => {
    dispatch({ type: CLEAR, payload: { id: id } })
  }
}

export const SELECT_MATERIAL = 'SELECT_MATERIAL'

export const REQUEST_APPLICATIONS_FOR_MATERIAL =
  'REQUEST_APPLICATIONS_FOR_MATERIAL'

export const RECEIVE_APPLICATIONS_FOR_MATERIAL_SUCCESS =
  'RECEIVE_APPLICATIONS_FOR_MATERIAL_SUCCESS'

export const RECEIVE_APPLICATIONS_FOR_MATERIAL_FAIL =
  'RECEIVE_APPLICATIONS_FOR_MATERIAL_FAIL'

// get applications that can be combined with material
// SelectedMaterial impacts applications and containers, containers are filtered in FormContainer
export function getApplicationsForMaterial(selectedMaterial) {
  return dispatch => {
    dispatch({ type: SELECT_MATERIAL, selectedMaterial })
    dispatch({ type: REQUEST_APPLICATIONS_FOR_MATERIAL })
    return axios
      .get(Config.API_ROOT + '/columnDefinition', {
        params: {
          type: selectedMaterial.replace('/', '_PIPI_SLASH_'),
        },
      })
      .then(response => {
        dispatch({
          type: RECEIVE_APPLICATIONS_FOR_MATERIAL_SUCCESS,
          applications: response.data.choices,
          containers: response.data.containers,
        })
        return response
      })
      .catch(error => {
        dispatch({
          type: RECEIVE_APPLICATIONS_FOR_MATERIAL_FAIL,
          error: error,
        })
        return error
      })
  }
}

export const SELECT_SPECIES_WITH_ID_FORMATTER =
  'SELECT_SPECIES_WITH_ID_FORMATTER'
export const SELECT_SPECIES_WITHOUT_ID_FORMATTER =
  'SELECT_SPECIES_WITHOUT_ID_FORMATTER'
export const CLEAR_SPECIES = 'CLEAR_SPECIES'
export function getFormatterForSpecies(selectedSpecies) {
  return dispatch => {
    if (PatientIDSpecies.includes(selectedSpecies.toLowerCase())) {
      let formatter = 'PatientIDTypes'

      dispatch({
        type: SELECT_SPECIES_WITH_ID_FORMATTER,
      })
      return dispatch(getPicklist(formatter))
    } else {
      return dispatch({
        type: SELECT_SPECIES_WITHOUT_ID_FORMATTER,
      })
    }
  }
}

export const clearSpecies = () => {
  return { type: CLEAR_SPECIES }
}

export const REQUEST_PICKLIST = 'REQUEST_PICKLIST'
export const RECEIVE_PICKLIST_SUCCESS = 'RECEIVE_PICKLIST_SUCCESS'
export const RECEIVE_PICKLIST_FAIL = 'RECEIVE_PICKLIST_FAIL'

export function getPicklist(picklist) {
  return dispatch => {
    dispatch({ type: REQUEST_PICKLIST, picklist })
    return axios
      .get(Config.API_ROOT + '/listValues/' + picklist)

      .then(response => {
        dispatch({ type: RECEIVE_PICKLIST_SUCCESS, picklist: response.data })
        return response
      })
      .catch(error => {
        dispatch({
          type: RECEIVE_PICKLIST_FAIL,
          error: error,
        })
        return error
      })
  }
}

export const CLEAR_MATERIAL = 'CLEAR_MATERIAL'

export const clearMaterial = () => {
  return [{ type: CLEAR_MATERIAL }, { type: CLEARED }]
}

export const CLEAR_APPLICATION = 'CLEAR_APPLICATION'

export const clearApplication = () => {
  return [{ type: CLEAR_APPLICATION }, { type: CLEARED }]
}

export const CLEARED = 'CLEARED'
// timeout for CLEARED to show user loading animation to indicate change
export const cleared = () => {
  return dispatch => {
    return setTimeout(() => {
      dispatch({ type: CLEARED })
    }, 500)
  }
}
