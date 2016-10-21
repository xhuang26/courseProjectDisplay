import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import App from './modules/App'
import Projects from './modules/Projects'
import Project from './modules/Project'
import Main from './modules/Main'

render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Main}/>
      <Route path="/projects" component={Projects}/>
      <Route path="/project/:filePath" component={Project}/>
    </Route>
  </Router>
), document.getElementById('app'))