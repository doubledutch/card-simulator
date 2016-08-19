/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import Update from 'react-addons-update'

React.addons = { update : Update }

import Feed, { FeedCardWrapper, GET_CARD_WIDTH, CARD_MARGIN } from 'dd-feed'
import DDView from 'dd-ddview'

var DD = ReactNative.NativeModules.DDBindings

var RNFS = require('react-native-fs')

const feedDataPath = RNFS.DocumentDirectoryPath + '/feed.json'
const feedTemplatePath = RNFS.DocumentDirectoryPath + '/feed-templates.json'

class Project extends Component {
  constructor() {
    super()
    this.state = { templates : [], data: [] }
  }

  componentDidMount() {
    var self = this
    DD.requestAccessToken((err, token) => {
      var url = 'http://localhost:8181/api/cards'
      // TODO - if we have auth, we need to set the head
      fetch(url, { method: 'GET', headers: { Authorization: 'Bearer ' + token }})
      .then((response) => response.json())
      .catch((error) => {
        console.error(error)
      })
      .then((responseData) => {
        console.log('got feed data')
        var templateNames = responseData.reduce((prev, curr) => {
          prev[curr.template] = true
          return prev
        }, {})
        if (Object.keys(templateNames).length) {
          var filterPrefix = '&filter='
          var filter = filterPrefix+Object.keys(templateNames).join(filterPrefix)
          var url ='http://localhost:8181/api/templates?' + filter
          console.log(url)
          fetch(url, { method: 'GET', headers: { Authorization: 'Bearer ' + token }})
            .then((response) => {
              console.log('data')
              var x = response.json()
              console.log('data')
              return x
            })
            .catch((error) => {
              console.error(error)
            })
            .then((templateData) => {
              console.log('got template data')
              var templates = {}
              templateData.forEach((t) => {
                try {
                  var loadTemplate = eval('(function() { _inherits = babelHelpers.inherits; _classCallCheck = babelHelpers.classCallCheck; _possibleConstructorReturn = babelHelpers.possibleConstructorReturn; _createClass = babelHelpers.createClass; ' + t.compiled + '; return loadTemplate; })()')
                  var Template = loadTemplate(React, ReactNative, { Feed, FeedCardWrapper, GET_CARD_WIDTH, CARD_MARGIN })
                  templates[t.id] = (id, data) => {
                    return <Template data={data} onDismiss={self.onDismissCard.bind(self, id)} onUpdate={self.onUpdateCard.bind(self, id)} onLog={self.onLogMetric.bind(self, id)} />
                  }
                } catch (e) {
                  console.error(e)
                }
              })
              console.log(responseData)
              console.log(templates)
              self.setState({ data: responseData, templates: templates })
            })
        }
      })
    })
  }

  onDismissCard(id) {
    // TODO - report back to the server that this happened
    for (var i = 0; i < this.state.data.length; ++i) {
      if (this.state.data[i].id === id) {
        var data = React.addons.update(this.state.data, { $splice: [[i, 1]] })
        this.setState({ data: data })
      }
    }
  }

  onLogMetric(id, data) {
    alert('Logging for card id ' + id + ' :' + JSON.stringify(data))
  }

  onUpdateCard(id, cardData) {
    // TODO - report back to the server that this happened
    for (var i = 0; i < this.state.data.length; ++i) {
      if (this.state.data[i].id === id) {
        var data = React.addons.update(this.state.data, { [i] : { data: { $set: cardData } } })
        this.setState({ data: data })
        break
      }
    }
  }

  render() {
    return (
      <DDView title="DoubleDutch Now">
        <Feed data={this.state.data} templates={this.state.templates} onDismissCard={this.onDimissCard} onUpdateCard={this.onUpdateCard} onLog={this.onLogMetric} />
      </DDView>
    );
  }
}

const pstyles = ReactNative.StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

ReactNative.AppRegistry.registerComponent('Project', () => Project);
