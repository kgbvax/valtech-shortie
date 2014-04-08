/// <reference path="../../.types/node/node.d.ts" />
/// <reference path="../../.types/underscore/underscore.d.ts" />
/// <reference path="../../.types/jquery/jquery.d.ts" />

// This is for frontend logic

import ko = require('knockout');
import _ = require('underscore');
import $ = require('jquery');

import viewModels = require('./viewModels');
import model = require('../shorties/model');
import api = require('../api/api');

// temporary shorties
var raws = [
  new model.Shortie("fun", "http://9gag.com/trending"),
  new model.Shortie("funner", "http://9gag.com/hot"),
  new model.Shortie("funniest", "http://money.cnn.com/data/markets/")
];

var listViewModel = new viewModels.ListViewModel(new api.ApiClient());

ko.applyBindings(listViewModel, document.getElementById('organizer'));

listViewModel.loadShorties();