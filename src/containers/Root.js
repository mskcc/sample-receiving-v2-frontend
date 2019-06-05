import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'

import { connect } from 'react-redux'
import { commonActions, userActions } from '../actions'
import DevTools from './DevTools'

import { LocalizeProvider, withLocalize } from 'react-localize-redux'
import enTranslations from '../translations/en.json'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

import { Header, Message, SnackMessage } from '../components'
import UploadPage from './Upload/UploadPage'
import SubmissionsPage from './Submissions/SubmissionsPage'
import Promote from './Promote/Promote'
import Login from './Login'
import Logout from './Logout'
import ErrorPage from './ErrorPage'

function PrivateRoute({ component: Component, loggedIn, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        loggedIn === true ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login' }} />
        )
      }
    />
  )
}

class Root extends Component {
  constructor(props) {
    super(props)

    // basic init of localization component
    this.props.initialize({
      languages: [{ name: 'English', code: 'en' }],
      translation: enTranslations,
      options: {
        renderToStaticMarkup,
        renderInnerHtml: false,
        defaultLanguage: 'en',
      },
    })
  }

  componentDidMount() {
    // making sure BE and FE versions match - shows info message if not
    this.props.checkVersion(this.props.common.version)
    this.props.refreshToken()
  }

  handleMsgClose = () => {
    this.props.resetMessage()
    // this.props.resetErrorMessage()
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Router basename="sample-receiving">
          <div>
            <div className="app">
              <Header loggedIn={this.props.loggedIn} />
              {process.env.NODE_ENV !== 'production' ? <DevTools /> : <div />}

              {this.props.common.serverError ? (
                <ErrorPage />
              ) : (
                <React.Fragment>
                  {this.props.common.loading && (
                    <CircularProgress color="secondary" size={24} />
                  )}
                  <div>
                    <PrivateRoute
                      loggedIn={this.props.loggedIn}
                      path="/(upload|)"
                      component={UploadPage}
                    />
                    <PrivateRoute
                      loggedIn={this.props.loggedIn}
                      path="/promote"
                      component={Promote}
                    />
                    <PrivateRoute
                      loggedIn={this.props.loggedIn}
                      path="/submissions"
                      component={SubmissionsPage}
                    />
                    <PrivateRoute
                      loggedIn={this.props.loggedIn}
                      path="/logout"
                      component={Logout}
                    />
                    <Route path="/login" component={Login} />
                    <Route path="/error" component={ErrorPage} />
                  </div>{' '}
                  {this.props.common.message &&
                  this.props.common.message.length > 0 ? (
                    <span>
                      <SnackMessage
                        open
                        type={this.props.error ? 'error' : 'info'}
                        message={this.props.common.message}
                        handleClose={this.handleMsgClose}
                      />
                    </span>
                  ) : null}
                </React.Fragment>
              )}
            </div>
          </div>
        </Router>
      </MuiThemeProvider>
    )
  }
}

const mapStateToProps = state => ({
  common: state.common,
  ...state.user,
})
const mapDispatchToProps = {
  ...commonActions,
  ...userActions,
}

export default withLocalize(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Root)
)

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      logo: '#319ae8',
      light: '#8FC7E8',
      main: '#007CBA',
      dark: '#006098',
    },
    secondary: {
      light: '#F6C65B',
      main: '#DF4602',
      dark: '#C24D00',
    },

    textSecondary: '#e0e0e0',
  },
})
