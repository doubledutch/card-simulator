/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import ReactNative from 'react-native'
import CardView from './cardview'

class Project extends Component {
  constructor() {
    super()
  }

  render() {

    return (
      <CardView />
    );
  }
}

ReactNative.AppRegistry.registerComponent('Project', () => Project);
