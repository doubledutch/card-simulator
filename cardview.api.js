import React, { Component } from 'react';
import ReactNative from 'react-native';
//var RNFS = require('react-native-fs')
const DD = ReactNative.NativeModules.DDBindings

// const feedDataPath = RNFS.DocumentDirectoryPath + '/feed.json'
// const feedTemplatePath = RNFS.DocumentDirectoryPath + '/feed-templates.json'
const cardsBaseURL = "https://stroom.doubledutch.me/api/cards"
const templatesBaseURL = "https://stroom.doubledutch.me/api/templates"

export default class CardViewUtils {
  static dismissCard(eventID, templateID, id) {
    return new Promise((resolve, reject) => {
      DD.requestAccessToken((err, token) => {
        fetch(cardsBaseURL + '/' + id + '?eventID=' + eventID, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } }).
          then((response) => {
            // The card is deleted here
          })
      })
    })
  }

  static logCardMetric(eventID, templateID, id, data) {
    return new Promise((resolve, reject) => {
      DD.requestAccessToken((err, token) => {
        const options = {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: JSON.stringify(data)
        }
        fetch(cardsBaseURL + '/' + id + '/log' + '?eventID=' + eventID + '&templateID=' + templateID, options).
          then((response) => {
            // The metric is logged here
          })
      })
    })
  }

  static updateCard(eventID, templateID, id, cardData) {
    return new Promise((resolve, reject) => {
      DD.requestAccessToken((err, token) => {
        const options = {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ id: id, data: cardData })
        }

        fetch(cardsBaseURL + '/' + id + '?eventID=' + eventID, options).then((response) => {
          // The card is updated here
          // alert(response)
        })
      })
    })
  }

  static fetchFeed(eventID) {
    return new Promise((resolve, reject) => {
      DD.requestAccessToken((err, token) => {
        var url = cardsBaseURL + '?eventID=' + eventID
        fetch(url, { method: 'GET', headers: { Authorization: 'Bearer ' + token } })
          .then((response) => response.json())
          .catch((error) => {
            console.error(error)
          })
          .then((cards) => {
            console.log('got feed data')
            var templateNames = cards.reduce((prev, curr) => {
              prev[curr.template] = true
              return prev
            }, {})
            if (Object.keys(templateNames).length) {
              var filterPrefix = '&filter='
              var filter = filterPrefix + Object.keys(templateNames).join(filterPrefix)
              var url = templatesBaseURL + '?' + filter + '&eventID=' + eventID
              console.log(url)
              fetch(url, { method: 'GET', headers: { Authorization: 'Bearer ' + token } })
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
                  var templates = []
                  if (templateData && templateData.length) {
                    templateData.forEach((t) => {
                      try {
                        var loadTemplate = eval('(function() { function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;}; _inherits = babelHelpers.inherits; _classCallCheck = babelHelpers.classCallCheck; _possibleConstructorReturn = babelHelpers.possibleConstructorReturn; _createClass = babelHelpers.createClass; ' + t.compiled + '; return loadTemplate; })()')
                        templates.push({ id: t.id, loadTemplate: loadTemplate })
                      } catch (e) {
                        console.error(e)
                      }
                    })
                  }

                  // TODO - change this once we add filtering?
                  cards = cards.filter((c) => templates.find((t) => t.id === c.template))
                  resolve([cards, templates])
                })
            }
          })
      })
    })
  }
}