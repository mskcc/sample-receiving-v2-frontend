import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Main from './Main'
import * as serviceWorker from './serviceWorker'

import { LocalizeProvider } from 'react-localize-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'

const App = props => (
  <LocalizeProvider>
    <Router>
      <Route path="/" component={Main} />
    </Router>
  </LocalizeProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
