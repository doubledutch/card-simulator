import React, { Component } from 'react';
import ReactNative from 'react-native';
import Update from 'react-addons-update'
import CardViewAPI from './cardview.api'
import EmptyCardView from './cardview.empty'

React.addons = { update : Update }

import Feed, { FeedCardWrapper, GET_CARD_WIDTH, CARD_MARGIN } from 'dd-feed'
import DDView from 'dd-ddview'

const DD = ReactNative.NativeModules.DDBindings
const eventID = DD.currentEvent.EventId

class CardView extends Component {
  constructor() {
    super()
    this.state = { templates : [], data: null }
  }

  componentDidMount() {
    var self = this
    CardViewAPI.fetchFeed(eventID).then((data) => {
      var [cards, templateLoaders] = data
      var templates = {}
      templateLoaders.forEach((t) => {
        var { Template } = t.loadTemplate(React, ReactNative, { Feed, FeedCardWrapper, GET_CARD_WIDTH, CARD_MARGIN }, DD)
        templates[t.id] = (id, data) => {
          return <Template data={data} onDismiss={self.onDismissCard.bind(self, t.id, id) } onUpdate={self.onUpdateCard.bind(self, t.id, id) } onLog={self.onLogMetric.bind(self, t.id, id) } />
        }
      })
      self.setState({ data: cards, templates: templates })
    })

    // Log 
    this.onLogMetric("base", "base", { action: 'loaded' })
    DD.setTitle('PartyForce Now')
  }

  onDismissCard(templateID, id) {
    // TODO - report back to the server that this happened
    for (var i = 0; i < this.state.data.length; ++i) {
      if (this.state.data[i].id === id) {
        var data = React.addons.update(this.state.data, { $splice: [[i, 1]] })
        this.setState({ data: data })

        // Log that the card was dismissed
        this.onLogMetric(templateID, id, { action: 'dismiss' })
        CardViewAPI.dismissCard(eventID, templateID, id)
      }
    }
  }

  onLogMetric(templateID, id, data) {
    CardViewAPI.logCardMetric(eventID, templateID, id, data).then((response) => {
    })
  }

  onUpdateCard(templateID, id, cardData) {
    // TODO - report back to the server that this happened
    for (var i = 0; i < this.state.data.length; ++i) {
      if (this.state.data[i].id === id) {
        var data = React.addons.update(this.state.data, { [i] : { data: { $set: cardData } } })
        this.setState({ data: data })
        
        CardViewAPI.updateCard(eventID, templateID, id, cardData).then((response) => {
          // The card is updated here
          alert(response)
        })

        break
      }
    }
  }

  render() {

    if (!this.state.data || !this.state.data.length) {
      return (
        <DDView title="">
          <EmptyCardView />
        </DDView>
      )
    }

    return (
      <DDView title="">
      <ReactNative.View style={{ flex: 1, backgroundColor: '#dedede' }}>
        <Feed data={this.state.data} templates={this.state.templates} onDismissCard={this.onDimissCard} onUpdateCard={this.onUpdateCard} onLog={this.onLogMetric} />
        </ReactNative.View>
      </DDView>
    );
  }
}

const pstyles = ReactNative.StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dedede',
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

export default CardView
