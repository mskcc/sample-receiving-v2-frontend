import { uploadFormActions as ActionTypes } from '../../actions'
import { initialFormState } from './initialState'

export default function uploadFormReducer(state = initialFormState, action) {
  switch (action.type) {
    case ActionTypes.REQUEST_INITIAL_STATE:
      return {
        ...state,
        formIsLoading: true,
      }

    case ActionTypes.RECEIVE_INITIAL_STATE_SUCCESS:
      return {
        ...state,
        formIsLoading: false,
        materials: action.data.materials,
        applications: action.data.applications,
        allMaterials: action.data.materials,
        allApplications: action.data.applications,
        species: action.data.species,
        allContainers: action.data.containers,
        containers: action.data.containers,
        // patientIdFormats: action.data.patientIdFormats,
      }

    case ActionTypes.RECEIVE_INITIAL_STATE_FAIL:
      return {
        ...state,
        error: action.error,
        formIsLoading: false,
      }

    case ActionTypes.REQUEST_MATERIALS_AND_APPLICATIONS:
      return {
        ...state,
        formIsLoading: true,
      }

    case ActionTypes.RECEIVE_MATERIALS_AND_APPLICATIONS_FAIL:
      return {
        ...state,
        error: action.error,
        formIsLoading: false,
      }

    case ActionTypes.SELECT_MATERIAL:
      return {
        ...state,
        selectedMaterial: action.selectedMaterial,
      }

    case ActionTypes.FILTER_CONTAINERS:
      return {
        ...state,
        containers: state.filteredContainers,
      }

    case ActionTypes.FILTER_CONTAINERS_FOR_BS:
      return {
        ...state,
        containers: state.filteredContainersBS,
      }
    case ActionTypes.SHOW_ALL_CONTAINERS:
      return {
        ...state,
        containers: state.allContainers,
      }
    case ActionTypes.SELECT_APPLICATION:
      return {
        ...state,
        selectedApplication: action.selectedApplication,
      }

    case ActionTypes.REQUEST_MATERIALS_FOR_APPLICATION:
      return {
        ...state,
        formIsLoading: true,
      }
    case ActionTypes.RECEIVE_MATERIALS_FOR_APPLICATION_SUCCESS:
      return {
        ...state,
        formIsLoading: false,
        materials: action.materials,
      }
    case ActionTypes.RECEIVE_MATERIALS_FOR_APPLICATION_FAIL:
      return {
        ...state,
        formIsLoading: false,
        error: action.error,
      }

    case ActionTypes.REQUEST_APPLICATIONS_FOR_MATERIAL:
      return {
        ...state,
        formIsLoading: true,
      }
    case ActionTypes.RECEIVE_APPLICATIONS_FOR_MATERIAL_SUCCESS:
      return {
        ...state,
        formIsLoading: false,
        applications: action.applications,
      }
    case ActionTypes.RECEIVE_APPLICATIONS_FOR_MATERIAL_FAIL:
      return {
        ...state,
        formIsLoading: false,
        error: action.error,
      }
    case ActionTypes.SELECT_SPECIES_WITH_ID_FORMATTER:
      return {
        ...state,
        patientIDTypeNeedsFormatting: true,
      }
    case ActionTypes.SELECT_SPECIES_WITHOUT_ID_FORMATTER:
      return {
        ...state,
        patientIDTypeNeedsFormatting: false,
      }
    case ActionTypes.CLEAR_SPECIES:
      return {
        ...state,
        patientIDTypeNeedsFormatting: false,
      }
    case ActionTypes.REQUEST_PICKLIST:
      return {
        ...state,
        formIsLoading: true,
      }
    case ActionTypes.RECEIVE_PICKLIST_SUCCESS:
      return {
        ...state,
        formIsLoading: false,
        picklists: {
          ...state.picklists,

          [action.picklist.listname]: action.picklist.values,
        },
      }

    case ActionTypes.RECEIVE_PICKLIST_FAIL:
      return {
        ...state,
        formIsLoading: false,
        error: action.error,
      }

    case ActionTypes.REQUEST_COLUMNS:
      return {
        ...state,
        formIsLoading: true,
      }
    case ActionTypes.RECEIVE_COLUMNS_SUCCESS:
      return {
        ...state,
        formIsLoading: false,
        columns: {
          ...state.columns,

          ...[action.columns],
        },
      }

    case ActionTypes.RECEIVE_COLUMNS_FAIL:
      return {
        ...state,
        formIsLoading: false,
        error: action.error,
      }

    case ActionTypes.CLEAR_MATERIAL:
      return {
        ...state,
        applications: state.allApplications,
        selectedMaterial: '',
        formIsLoading: true,
      }
    case ActionTypes.CLEAR_APPLICATION:
      return {
        ...state,
        materials: state.allMaterials,
        selectedApplication: '',
        formIsLoading: true,
      }
    case ActionTypes.CLEARED:
      return {
        ...state,
        formIsLoading: false,
      }

    default:
      return state
  }
}
