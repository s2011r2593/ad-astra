import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import * as THREE from 'three';

import Solar from './components/solar';
import Sand from './components/sandbox';

function App(props) {
  return (
    <Router>
      <Switch>
        <Route path='/' component={Solar} />
        <Route path='/sandbox' component={Sand} />
      </Switch>
    </Router>
  )
}

export default App;
