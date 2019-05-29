import { commonActions as ActionTypes } from '../../actions'

const initialState = {
  version: '2.0',
  error: null,
  message: '',
  // loading: true,
}

function commonReducer(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SERVER_ERROR:
      return {
        ...state,
        error: action.error,
        message:
          'Our backend is experiencing some downtime. Please check back later or message an admin.',
      }

    case ActionTypes.RESET_ERROR_MESSAGE:
      return {
        ...state,
        error: null,
      }

    case ActionTypes.REQUEST_CHECK_VERSION:
      return {
        ...state,
      }

    case ActionTypes.RECEIVE_CHECK_VERSION_SUCCESS:
      return {
        ...state,
        versionValid: true,
        error: null,
      }

    case ActionTypes.RECEIVE_CHECK_VERSION_FAIL:
      return {
        ...state,
        error: action.error,
        message: action.message,
        
        versionValid: false,
      }
   

    default:
      return state
  }
}

export default commonReducer
