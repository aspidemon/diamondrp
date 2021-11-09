/*
 * fairplay-gaming-voice-chat v2.0.0
 * fairplay gaming voice chat powered by mediasoup 
 * Copyright: 2017-2019 kemperrr <kemperrr@fpgm.ru>
 * License: All Rights Reserved
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
			value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _values = require('babel-runtime/core-js/object/values');
	
	var _values2 = _interopRequireDefault(_values);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _utils = require('./utils');
	
	var _hark = require('hark');
	
	var _hark2 = _interopRequireDefault(_hark);
	
	var _mediastreamGain = require('mediastream-gain');
	
	var _mediastreamGain2 = _interopRequireDefault(_mediastreamGain);
	
	var _events = require('./helpers/events');
	
	var _events2 = _interopRequireDefault(_events);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DataStore = function () {
			function DataStore() {
					(0, _classCallCheck3.default)(this, DataStore);
	
	
					this.mainContext = new AudioContext();
					this.mainVolume = this.mainContext.createGain();
	
					this.mainVolume.connect(this.mainContext.destination);
					this.mainVolume.gain.setValueAtTime(1, this.mainContext.currentTime);
	
					this._peers = new _map2.default();
					this._consumers = {};
					this._producers = {};
	
					/** @type {Object} */
					this._producerHark = null;
	
					this.isPositioning = true;
	
					this._producerVolume = null;
	
					this.lastVolumeUpdate = Date.now();
					this.consumersVolumeQueue = {};
			}
	
			(0, _createClass3.default)(DataStore, [{
					key: 'changePositioning',
					value: function changePositioning(isPositioning) {
							this.isPositioning = isPositioning;
					}
	
					/* MAIN - START */
	
			}, {
					key: 'changeMainVolume',
					value: function changeMainVolume(volume) {
							if (typeof this.mainVolume !== 'undefined' && typeof this.mainVolume.gain !== 'undefined' && !isNaN(volume)) {
									this.mainVolume.gain.setValueAtTime(volume, this.mainContext.currentTime);
							}
					}
	
					/* MAIN - END */
	
					/* PRODUCERS - START */
	
			}, {
					key: 'addProducer',
					value: function addProducer(producer) {
							var _this = this;
	
							if (this._producerHark) {
									this._producerHark.stop();
							}
	
							var stream = new MediaStream();
	
							if (producer.track) {
									stream.addTrack(producer.track);
							}
	
							this._producerVolume = new _mediastreamGain2.default(stream);
	
							this._producerHark = (0, _hark2.default)(stream, { play: false });
	
							this._producerHark.on('volume_change', function (dBs, threshold) {
									var volume = Math.round(Math.pow(10, dBs / 85) * 10);
	
									if (volume === 1) {
											volume = 0;
									}
	
									var currentTime = Date.now();
	
									if (currentTime >= _this.lastVolumeUpdate + 1000) {
											//MpEvents.triggerClientChangeProducerVolume(volume);
	
											//MpEvents.triggerClientChangeConsumersVolume(this.consumersVolumeQueue);
											_this.consumersVolumeQueue = {};
	
											_this.lastVolumeUpdate = currentTime;
									}
							});
	
							this._producers[producer.id] = producer;
					}
			}, {
					key: 'removeProducer',
					value: function removeProducer(producerId) {
	
							if (this._producerHark) {
									this._producerHark.stop();
							}
	
							delete this._producerVolume;
							delete this._producers[producerId];
					}
			}, {
					key: 'setProducerPaused',
					value: function setProducerPaused(producerId, originator) {
							var producer = this._producers[producerId];
	
							if (originator === 'local') {
									producer.locallyPaused = true;
							} else {
									producer.remotelyPaused = true;
							}
					}
			}, {
					key: 'setProducerResumed',
					value: function setProducerResumed(producerId, originator) {
							var producer = this._producers[producerId];
	
							if (originator === 'local') {
									producer.locallyPaused = false;
							} else {
									producer.remotelyPaused = false;
							}
					}
			}, {
					key: 'setProducerTrack',
					value: function setProducerTrack(producerId, track) {
							var producer = this._producers[producerId];
							producer.track = track;
					}
			}, {
					key: 'changeProducerVolume',
					value: function changeProducerVolume(volume) {
							var _iteratorNormalCompletion = true;
							var _didIteratorError = false;
							var _iteratorError = undefined;
	
							try {
									for (var _iterator = (0, _getIterator3.default)((0, _values2.default)(this._producers)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
											var producer = _step.value;
	
											if (typeof this._producerVolume !== 'undefined' && !isNaN(volume)) {
													this._producerVolume.setGain(volume);
											}
									}
							} catch (err) {
									_didIteratorError = true;
									_iteratorError = err;
							} finally {
									try {
											if (!_iteratorNormalCompletion && _iterator.return) {
													_iterator.return();
											}
									} finally {
											if (_didIteratorError) {
													throw _iteratorError;
											}
									}
							}
					}
	
					/* PRODUCERS - END */
	
					/* PEERS - START */
	
			}, {
					key: 'addPeer',
					value: function addPeer(peer) {
							this._peers.set(peer.name, peer);
					}
			}, {
					key: 'removePeer',
					value: function removePeer(peerName) {
							this._peers.delete(peerName);
					}
	
					/* PEERS - END */
	
					/* CONSUMERS - START */
	
			}, {
					key: 'addConsumer',
					value: function addConsumer(consumer) {
							consumer.volume = 0;
							consumer.balance = 0;
	
							this._consumers[consumer.id] = consumer;
					}
			}, {
					key: 'removeConsumer',
					value: function removeConsumer(consumerId) {
	
							var consumer = this._consumers[consumerId];
	
							if (!consumer) {
									console.log(consumerId + ' is not found');
									return false;
							}
	
							if (typeof consumer.audioElement !== 'undefined') {
									consumer.audioElement.remove();
							}
	
							if (consumer.hark) {
									consumer.hark.stop();
							}
	
							if (typeof consumer.streamSource !== 'undefined') {
									consumer.gainNode.disconnect(this.mainVolume);
									consumer.streamSource.disconnect(consumer.gainNode);
									consumer.gainNode.disconnect(consumer.panner);
									consumer.panner.disconnect(this.mainVolume);
							}
	
							delete this._consumers[consumerId];
					}
			}, {
					key: 'setConsumerPaused',
					value: function setConsumerPaused(consumerId, originator) {
							var consumer = this._consumers[consumerId];
	
							if (!consumer) {
									console.log(consumerId + ' is not found');
									return false;
							}
	
							if (originator === 'local') {
									consumer.locallyPaused = true;
							} else {
									consumer.remotelyPaused = true;
							}
					}
			}, {
					key: 'setConsumerResumed',
					value: function setConsumerResumed(consumerId, originator) {
							var consumer = this._consumers[consumerId];
	
							if (!consumer) {
									console.log(consumerId + ' is not found');
									return false;
							}
	
							if (originator === 'local') {
									consumer.locallyPaused = false;
							} else {
									consumer.remotelyPaused = false;
							}
					}
			}, {
					key: 'setConsumerEffectiveProfile',
					value: function setConsumerEffectiveProfile(consumerId, profile) {
							var consumer = this._consumers[consumerId];
	
							if (!consumer) {
									console.log(consumerId + ' is not found');
									return false;
							}
	
							consumer.profile = profile;
					}
			}, {
					key: 'setConsumerTrack',
					value: function setConsumerTrack(consumerId, track) {
							var _this2 = this;
	
							var consumer = this._consumers[consumerId];
	
							if (!consumer) {
									console.log(consumerId + ' is not found');
									return false;
							}
	
							var audio = new Audio();
							audio.autoplay = !this.isPositioning;
							audio.volume = 0;
	
							var stream = new MediaStream();
	
							if (track) {
									stream.addTrack(track);
							}
	
							audio.srcObject = stream;
	
							if (consumer.hark) {
									consumer.hark.stop();
							}
	
							var consumerHark = (0, _hark2.default)(stream, { play: false });
	
							consumerHark.on('volume_change', function (dBs, threshold) {
									var volume = Math.round(Math.pow(10, dBs / 85) * 10);
	
									if (volume === 1) {
											volume = 0;
									}
	
									_this2.consumersVolumeQueue[consumer.peerName] = volume;
							});
	
							if (this.isPositioning) {
									var source = this.mainContext.createMediaStreamSource(stream);
	
									// GainNode (proximity)
									consumer.gainNode = this.mainContext.createGain();
									source.connect(consumer.gainNode);
									consumer.gainNode.connect(this.mainVolume);
									consumer.gainNode.gain.setValueAtTime(0, this.mainContext.currentTime);
	
									// PannerNode (stereo)
									var panner = this.mainContext.createPanner();
									consumer.panner = panner;
									consumer.gainNode.connect(consumer.panner);
									consumer.panner.connect(this.mainVolume);
									consumer.panner.setOrientation(0, 0, 1);
	
									consumer.streamSource = source;
							} else {
									consumer.audioElement = audio;
							}
	
							consumer.hark = consumerHark;
							consumer.track = track;
					}
			}, {
					key: 'changeConsumerVolume',
					value: function changeConsumerVolume(peerName, volume, balance) {
							var _iteratorNormalCompletion2 = true;
							var _didIteratorError2 = false;
							var _iteratorError2 = undefined;
	
							try {
									for (var _iterator2 = (0, _getIterator3.default)((0, _values2.default)(this._consumers)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
											var consumer = _step2.value;
	
											if (consumer.peerName === peerName) {
	
													if (consumer.audioElement) {
															consumer.audioElement.volume = volume;
													}
	
													if (typeof consumer.gainNode !== 'undefined' && typeof consumer.gainNode.gain !== 'undefined' && !isNaN(volume)) {
															consumer.gainNode.gain.setValueAtTime(volume, this.mainContext.currentTime);
															consumer.volume = volume;
													}
	
													if (typeof consumer.panner !== 'undefined' && !isNaN(balance)) {
															consumer.panner.setPosition(balance, 0, 1 - Math.abs(balance));
															consumer.balance = balance;
													}
											}
									}
							} catch (err) {
									_didIteratorError2 = true;
									_iteratorError2 = err;
							} finally {
									try {
											if (!_iteratorNormalCompletion2 && _iterator2.return) {
													_iterator2.return();
											}
									} finally {
											if (_didIteratorError2) {
													throw _iteratorError2;
											}
									}
							}
					}
	
					/* CONSUMERS - END */
	
			}, {
					key: 'producers',
					get: function get() {
							return (0, _from2.default)(this._producers);
					}
			}]);
			return DataStore;
	}();
	
	exports.default = new DataStore();
	
	},{"./helpers/events":4,"./utils":8,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/values":46,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"hark":195,"mediastream-gain":196}],2:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _debug = require('debug');
	
	var _debug2 = _interopRequireDefault(_debug);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var APP_NAME = 'mediasoup-demo';
	
	var Logger = function () {
		function Logger(prefix) {
			(0, _classCallCheck3.default)(this, Logger);
	
			if (prefix) {
				this._debug = (0, _debug2.default)(APP_NAME + ':' + prefix);
				this._warn = (0, _debug2.default)(APP_NAME + ':WARN:' + prefix);
				this._error = (0, _debug2.default)(APP_NAME + ':ERROR:' + prefix);
			} else {
				this._debug = (0, _debug2.default)(APP_NAME);
				this._warn = (0, _debug2.default)(APP_NAME + ':WARN');
				this._error = (0, _debug2.default)(APP_NAME + ':ERROR');
			}
	
			/* eslint-disable no-console */
			this._debug.log = console.info.bind(console);
			this._warn.log = console.warn.bind(console);
			this._error.log = console.error.bind(console);
			/* eslint-enable no-console */
		}
	
		(0, _createClass3.default)(Logger, [{
			key: 'debug',
			get: function get() {
				return this._debug;
			}
		}, {
			key: 'warn',
			get: function get() {
				return this._warn;
			}
		}, {
			key: 'error',
			get: function get() {
				return this._error;
			}
		}]);
		return Logger;
	}();
	
	exports.default = Logger;
	
	},{"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"debug":192}],3:[function(require,module,exports){
	'use strict';
	
	if (typeof window.mp === 'undefined') {
			window.mp = {
					invoke: function invoke(name) {
							var _console;
	
							for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
									args[_key - 1] = arguments[_key];
							}
	
							(_console = console).log.apply(_console, ['invoke', name].concat(args));
					},
					trigger: function trigger(name) {
							var _console2;
	
							for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
									args[_key2 - 1] = arguments[_key2];
							}
	
							(_console2 = console).log.apply(_console2, ['trigger', name].concat(args));
					},
					enableDebuggingAlerts: function enableDebuggingAlerts() {}
			};
	}
	
	},{}],4:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
			value: true
	});
	
	var _stringify = require('babel-runtime/core-js/json/stringify');
	
	var _stringify2 = _interopRequireDefault(_stringify);
	
	var _extends2 = require('babel-runtime/helpers/extends');
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * @type {Map<String, Set<Function>>}
	*/
	var __events = new _map2.default();
	
	if (!window.isRageMp) {
			window.addEventListener('message', function (event) {
					var data = event.data;
					if (__events.has(data.type)) {
							var args = data.args || [];
							callEvent.apply(undefined, [data.type].concat((0, _toConsumableArray3.default)(args)));
					}
			});
	}
	
	var listenEvent = function listenEvent(eventName, eventFunction) {
			if (__events.has(eventName)) {
					var event = __events.get(eventName);
	
					if (!event.has(eventFunction)) {
							event.add(eventFunction);
					}
			} else {
					__events.set(eventName, new _set2.default([eventFunction]));
			}
	};
	
	var callEvent = function callEvent(eventName) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
			}
	
			if (__events.has(eventName)) {
					var event = __events.get(eventName);
	
					event.forEach(function (eventFunction) {
							eventFunction.apply(undefined, args);
					});
			}
	};
	
	var removeEvent = function removeEvent(eventName, eventFunction) {
			if (__events.has(eventName)) {
					var event = __events.get(eventName);
	
					if (event.has(eventFunction)) {
							event.delete(eventFunction);
					} else {
							event.clear();
					}
			}
	};
	
	var FiveMTrigger = function FiveMTrigger(eventName, args) {
			args = (0, _extends3.default)({}, args);
	
			fetch('http://' + eventName, {
					method: 'POST',
					body: (0, _stringify2.default)(args)
			});
	};
	
	var triggerClientChangeStateConnection = function triggerClientChangeStateConnection(state) {
			if (isRageMp) {
					mp.trigger('voice.changeStateConnection', state);
			} else {
					FiveMTrigger('voice/changeStateConnection', { state: state });
			}
	};
	
	var triggerClientRequestMediaPeerResponse = function triggerClientRequestMediaPeerResponse(peerName, status) {
			if (isRageMp) {
					mp.trigger('voice.requestMediaPeerResponse', peerName, status);
			} else {
					FiveMTrigger('voice/requestMediaPeerResponse', { peerName: peerName, status: status });
			}
	};
	
	var triggerClientRequestCloseMediaPeerResponse = function triggerClientRequestCloseMediaPeerResponse(peerName, status) {
			if (isRageMp) {
					mp.trigger('voice.requestCloseMediaPeerResponse', peerName, status);
			} else {
					FiveMTrigger('voice/requestCloseMediaPeerResponse', { peerName: peerName, status: status });
			}
	};
	
	var triggerClientChangeProducerVolume = function triggerClientChangeProducerVolume(volume) {
			if (isRageMp) {
					mp.trigger('voice.changeProducerVolume', volume);
			} else {
					FiveMTrigger('voice/changeProducerVolume', { volume: volume });
			}
	};
	
	var triggerClientChangeConsumerVolume = function triggerClientChangeConsumerVolume(peerName, volume) {
			if (isRageMp) {
					mp.trigger('voice.changeConsumerVolume', peerName, volume);
			} else {
					FiveMTrigger('voice/changeConsumerVolume', { peerName: peerName, volume: volume });
			}
	};
	
	var triggerClientChangeConsumersVolume = function triggerClientChangeConsumersVolume(consumers) {
			if (isRageMp) {
					mp.trigger('voice.changeConsumersVolume', (0, _stringify2.default)(consumers));
			} else {
					FiveMTrigger('voice/changeConsumersVolume', { consumers: consumers });
			}
	};
	
	var triggerClientMicrophoneEnabled = function triggerClientMicrophoneEnabled(peerName, isEnabled) {
			if (isRageMp) {
					mp.trigger('voice.toggleMicrophone', peerName, isEnabled);
			} else {
					FiveMTrigger('voice/toggleMicrophone', { peerName: peerName, isEnabled: isEnabled });
			}
	};
	
	exports.default = {
			on: listenEvent,
			call: callEvent,
			remove: removeEvent,
			triggerClientChangeStateConnection: triggerClientChangeStateConnection,
			triggerClientRequestMediaPeerResponse: triggerClientRequestMediaPeerResponse,
			triggerClientRequestCloseMediaPeerResponse: triggerClientRequestCloseMediaPeerResponse,
			triggerClientChangeProducerVolume: triggerClientChangeProducerVolume,
			triggerClientChangeConsumerVolume: triggerClientChangeConsumerVolume,
			triggerClientChangeConsumersVolume: triggerClientChangeConsumersVolume,
			triggerClientMicrophoneEnabled: triggerClientMicrophoneEnabled,
			__events: __events
	};
	
	},{"babel-runtime/core-js/json/stringify":38,"babel-runtime/core-js/map":39,"babel-runtime/core-js/set":48,"babel-runtime/helpers/extends":53,"babel-runtime/helpers/toConsumableArray":57}],5:[function(require,module,exports){
	'use strict';
	
	var _domready = require('domready');
	
	var _domready2 = _interopRequireDefault(_domready);
	
	var _urlParse = require('url-parse');
	
	var _urlParse2 = _interopRequireDefault(_urlParse);
	
	var _mediasoupClient = require('../mediasoup-client/');
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _events = require('./helpers/events');
	
	var _events2 = _interopRequireDefault(_events);
	
	var _newClient = require('./newClient');
	
	var _newClient2 = _interopRequireDefault(_newClient);
	
	var _utils = require('./utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	require('./dummies/mp');
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	mp.enableDebuggingAlerts(true);
	mp.events = _events2.default;
	
	var logger = new _Logger2.default();
	
	/** @type {NewClient} */
	var client = null;
	
	(0, _domready2.default)(function () {
		logger.debug('DOM ready');
	
		// init(undefined, 'asfds')
	});
	
	function init(playerId, playerToken) {
		var deviceId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';
		var producerVolume = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
		var isUsb = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
		var isPositioning = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
	
		logger.debug('run() [environment:%s]', "development");
	
		var urlParser = new _urlParse2.default(window.location.href, true);
		var produce = urlParser.query.produce !== 'false';
		var isSipEndpoint = urlParser.query.sipEndpoint === 'true';
		var useSimulcast = urlParser.query.simulcast !== 'false';
		var _userName_ = urlParser.query.name;
	
		var peerName = playerId || _userName_;
	
		console.log('myPeerName', peerName);
	
		var device = (0, _mediasoupClient.getDeviceInfo)();
	
		if (isSipEndpoint) {
			device.flag = 'sipendpoint';
			device.name = 'SIP Endpoint';
			device.version = undefined;
		}
	
		client = new _newClient2.default({
			peerName: peerName,
			token: playerToken,
			device: device,
			produce: produce,
			useSimulcast: useSimulcast,
			deviceId: deviceId,
			producerVolume: producerVolume,
			isUsb: isUsb,
			isPositioning: isPositioning
		});
	
		window._client = client;
	}
	
	mp.events.on('init', function (playerId, token, deviceId, producerVolume, isUsb, isPositioning) {
		init(playerId, token, deviceId, producerVolume, isUsb, isPositioning);
	});
	
	mp.events.on('streamIn', function (playerId) {
		if (client && client._stateConnection !== 'closed') {
			client.requestMediaPeer(playerId);
		}
	});
	
	mp.events.on('streamOut', function (playerId) {
		if (client && client._stateConnection !== 'closed') {
			client.requestCloseMediaPeer(playerId);
		}
	});
	
	mp.events.on('changeVolumeConsumer', function (playerId, volume, balance) {
		if (client && client._stateConnection !== 'closed') {
			client.changeConsumerVolume(playerId, volume, balance);
		}
	});
	
	mp.events.on('changeVolumeConsumers', function (peers) {
		if (client && client._stateConnection !== 'closed') {
			client.changeConsumersVolume(peers);
		}
	});
	
	mp.events.on('changeProducerVolume', function (volume) {
		if (client && client._stateConnection !== 'closed') {
			client.changeProducerVolume(volume);
		}
	});
	
	mp.events.on('changeMainVolume', function (volume) {
		if (client && client._stateConnection !== 'closed') {
			client.changeMainVolume(volume);
		}
	});
	
	mp.events.on('changeProducer', function (deviceId) {
		var producerVolume = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
	
		if (client && client._stateConnection !== 'closed') {
			client.changeProducer(deviceId, producerVolume);
		}
	});
	
	mp.events.on('changeProducerIsUsb', function (isUsb) {
		if (client && client._stateConnection !== 'closed') {
			client.changeProducerIsUsb(isUsb);
		}
	});
	
	mp.events.on('changePositioning', function (isPositioning) {
		if (client && client._stateConnection !== 'closed') {
			client.changePositioning(isPositioning);
		}
	});
	
	mp.events.on('muteMic', function () {
		if (client && client._stateConnection !== 'closed') {
			client.muteMic();
		}
	});
	
	mp.events.on('unmuteMic', function () {
		if (client && client._stateConnection !== 'closed') {
			client.unmuteMic();
		}
	});
	
	mp.events.on('restartIce', function () {
		if (client && client._stateConnection !== 'closed') {
			client.restartIce();
		}
	});
	
	mp.events.on('quit', function () {
		if (client && client._stateConnection !== 'closed') {
			client.close();
		}
	});
	
	},{"../mediasoup-client/":32,"./Logger":2,"./dummies/mp":3,"./helpers/events":4,"./newClient":6,"./utils":8,"domready":194,"url-parse":216}],6:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _protooClient = require('protoo-client');
	
	var _protooClient2 = _interopRequireDefault(_protooClient);
	
	var _mediasoupClient = require('../mediasoup-client/');
	
	var mediasoupClient = _interopRequireWildcard(_mediasoupClient);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _urlFactory = require('./urlFactory');
	
	var _DataStore = require('./DataStore');
	
	var _DataStore2 = _interopRequireDefault(_DataStore);
	
	var _events = require('./helpers/events');
	
	var _events2 = _interopRequireDefault(_events);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('NewClient');
	
	var ROOM_OPTIONS = {
		requestTimeout: 10000,
		transportOptions: {
			tcp: false
		},
		turnServers: [{ urls: "stun:voice.fpgm.ru:3478", username: "kemperrr", credential: "625101" }, { urls: "turn:voice.fpgm.ru:3478", username: "kemperrr", credential: "625101" }, { urls: "stun:voip.libertyroleplay.ru:3478", username: "disquse", credential: "625101" }, { urls: "turn:voip.libertyroleplay.ru:3478", username: "disquse", credential: "625101" }, { urls: "turn:turn.kandidatrp.ru:3478", username: "kandidat", credential: "1992" }, { urls: "stun:stun.kandidatrp.ru:3478", username: "kandidat", credential: "1992" }, { urls: "stun:top-gta.com:3478", username: "arp", credential: "arparp11" }, { urls: "turn:top-gta.com:3478", username: "arp", credential: "arparp11" }]
	};
	
	var NewClient = function () {
		function NewClient(_ref) {
			var peerName = _ref.peerName,
					token = _ref.token,
					device = _ref.device,
					useSimulcast = _ref.useSimulcast,
					produce = _ref.produce,
					deviceId = _ref.deviceId,
					producerVolume = _ref.producerVolume,
					isUsb = _ref.isUsb,
					isPositioning = _ref.isPositioning;
			(0, _classCallCheck3.default)(this, NewClient);
	
			logger.debug('constructor() [peerName:"%s", device:%s]', peerName, device.flag);
	
			this._dataStore = _DataStore2.default;
	
			var protooUrl = (0, _urlFactory.getProtooUrl)(peerName, token);
			var protooTransport = new _protooClient2.default.WebSocketTransport(protooUrl);
	
			this._token = token;
	
			this._closed = false;
	
			this._produce = produce;
	
			this._useSimulcast = useSimulcast;
	
			this._peerName = peerName;
	
			this.deviceId = deviceId;
	
			this.producerVolume = producerVolume;
	
			this._protoo = new _protooClient2.default.Peer(protooTransport);
	
			this._room = new mediasoupClient.Room(ROOM_OPTIONS);
	
			this._sendTransport = null;
	
			this._recvTransport = null;
	
			this._micProducer = null;
	
			this.isUsb = isUsb;
	
			this.isPositioning = isPositioning;
			_DataStore2.default.changePositioning(isPositioning);
	
			this._stateConnection = 'closed';
	
			this._join({ device: device, token: token });
		}
	
		(0, _createClass3.default)(NewClient, [{
			key: 'setStateConnection',
			value: function setStateConnection(state) {
				this._stateConnection = state;
				_events2.default.triggerClientChangeStateConnection(state);
			}
		}, {
			key: 'close',
			value: function close() {
				var _this = this;
	
				if (this._closed) return;
	
				this._closed = true;
	
				logger.debug('close()');
	
				// Leave the mediasoup Room.
				this._room.leave();
	
				// Close protoo Peer (wait a bit so mediasoup-client can send
				// the 'leaveRoom' notification).
				setTimeout(function () {
					return _this._protoo.close();
				}, 250);
	
				this.setStateConnection('closed');
			}
		}, {
			key: 'requestMediaPeer',
			value: function requestMediaPeer(peerName) {
	
				if (!this._room._peers.has(peerName)) {
					this._room.requestMediaPeer(peerName).then(function (response) {
						_events2.default.triggerClientRequestMediaPeerResponse(peerName, response.status);
					}).catch(function (err) {
						console.log('requestMediaPeer - error', peerName, err);
						_events2.default.triggerClientRequestMediaPeerResponse(peerName, false);
					});
				}
			}
		}, {
			key: 'requestCloseMediaPeer',
			value: function requestCloseMediaPeer(peerName) {
				if (this._room._peers.has(peerName)) this._room.requestCloseMediaPeer(peerName).then(function (response) {
					_events2.default.triggerClientRequestCloseMediaPeerResponse(peerName, response.status);
				}).catch(function (err) {
					console.log('requestCloseMediaPeer - error', peerName, err);
					_events2.default.triggerClientRequestCloseMediaPeerResponse(peerName, false);
				});
			}
		}, {
			key: 'muteMic',
			value: function muteMic() {
				if (!this._micProducer) return false;
	
				logger.debug('muteMic()');
	
				this._micProducer.pause();
			}
		}, {
			key: 'unmuteMic',
			value: function unmuteMic() {
				if (!this._micProducer) return false;
	
				logger.debug('unmuteMic()');
	
				this._micProducer.resume();
			}
		}, {
			key: 'changePositioning',
			value: function changePositioning(isPositioning) {
				this.isPositioning = isPositioning;
				_DataStore2.default.changePositioning(isPositioning);
			}
		}, {
			key: 'changeConsumerVolume',
			value: function changeConsumerVolume(consumerId, volume, balance) {
				_DataStore2.default.changeConsumerVolume(consumerId, volume, balance);
			}
		}, {
			key: 'changeConsumersVolume',
			value: function changeConsumersVolume(peers) {
				peers = typeof peers === 'string' ? JSON.parse(peers) : peers;
	
				peers.forEach(function (peer) {
					_DataStore2.default.changeConsumerVolume(peer.name, peer.volume, peer.balance);
				});
			}
		}, {
			key: 'changeProducerVolume',
			value: function changeProducerVolume(volume) {
				_DataStore2.default.changeProducerVolume(volume);
			}
		}, {
			key: 'changeMainVolume',
			value: function changeMainVolume(volume) {
				_DataStore2.default.changeMainVolume(volume);
			}
		}, {
			key: 'changeProducer',
			value: function changeProducer(deviceId, producerVolume) {
	
				logger.debug('changeProducer() [deviceId:"%s", producerVolume:%d]', deviceId, producerVolume);
	
				this._micProducer.close();
				this.deviceId = deviceId;
				this.producerVolume = producerVolume;
				this._setMicProducer(deviceId, producerVolume, this.isUsb).catch(function () {});
			}
		}, {
			key: 'changeProducerIsUsb',
			value: function changeProducerIsUsb(isUsb) {
				logger.debug('changeProducerIsUsb() [isUsb:"%s"]', isUsb);
	
				this._micProducer.close();
				this.isUsb = isUsb;
				this._setMicProducer(this.deviceId, this.producerVolume, isUsb).catch(function () {});
			}
		}, {
			key: 'restartIce',
			value: function restartIce() {
				var _this2 = this;
	
				logger.debug('restartIce()');
	
				return _promise2.default.resolve().then(function () {
					_this2._room.restartIce();
				}).catch(function (error) {
					logger.error('restartIce() failed: %o', error);
				});
			}
		}, {
			key: '_join',
			value: function _join(_ref2) {
				var _this3 = this;
	
				var device = _ref2.device,
						token = _ref2.token;
	
	
				this.setStateConnection('connecting');
	
				this._protoo.on('open', function () {
					logger.debug('protoo Peer "open" event');
	
					_this3._joinRoom({ device: device, token: token });
				});
	
				this._protoo.on('disconnected', function () {
					logger.warn('protoo Peer "disconnected" event');
	
					// Leave Room.
					try {
						_this3._room.remoteClose({ cause: 'protoo disconnected' });
					} catch (error) {}
	
					_this3.setStateConnection('connecting');
				});
	
				this._protoo.on('close', function () {
					if (_this3._closed) return;
	
					logger.warn('protoo Peer "close" event');
	
					_this3.close();
				});
	
				this._protoo.on('request', function (request, accept, reject) {
					logger.debug('_handleProtooRequest() [method:%s, data:%o]', request.method, request.data);
	
					switch (request.method) {
						case 'mediasoup-notification':
							{
								accept();
	
								var notification = request.data;
	
								_this3._room.receiveNotification(notification);
	
								break;
							}
	
						default:
							{
								logger.error('unknown protoo method "%s"', request.method);
	
								reject(404, 'unknown method');
							}
					}
				});
			}
		}, {
			key: '_joinRoom',
			value: function _joinRoom(_ref3) {
				var _this4 = this;
	
				var device = _ref3.device,
						token = _ref3.token;
	
				logger.debug('_joinRoom()');
	
				this._room.removeAllListeners();
	
				this._room.on('close', function (originator, appData) {
					if (originator === 'remote') {
						logger.warn('mediasoup Peer/Room remotely closed [appData:%o]', appData);
	
						_this4.setStateConnection('closed');
	
						return;
					}
				});
	
				this._room.on('request', function (request, callback, errback) {
					logger.debug('sending mediasoup request [method:%s]:%o', request.method, request);
	
					_this4._protoo.send('mediasoup-request', request).then(callback).catch(errback);
				});
	
				this._room.on('notify', function (notification) {
					logger.debug('sending mediasoup notification [method:%s]:%o', notification.method, notification);
	
					_this4._protoo.send('mediasoup-notification', notification).catch(function (error) {
						logger.warn('could not send mediasoup notification:%o', error);
					});
				});
	
				this._room.on('newpeer', function (peer) {
					logger.debug('room "newpeer" event [name:"%s", peer:%o]', peer.name, peer);
					_this4._handlePeer(peer);
				});
	
				this._room.join(this._peerName, { device: device, token: token }).then(function () {
					// Create Transport for sending.
					_this4._sendTransport = _this4._room.createTransport('send', { media: 'SEND_MIC_WEBCAM' });
	
					_this4._sendTransport.on('close', function (originator) {
						logger.debug('Transport "close" event [originator:%s]', originator);
					});
	
					_this4._sendTransport.on('connectionstatechange', function (state) {
						if (state === 'connected') {
							_this4.setStateConnection('connected');
							console.log('state connected');
						} else if (state === 'failed' || state === 'disconnected') {
							logger.warn("sendTransport connectionstatechange FAILED or DISCONNECTED!");
							_this4.restartIce();
						}
					});
	
					// Create Transport for receiving.
					_this4._recvTransport = _this4._room.createTransport('recv', { media: 'RECV' });
	
					_this4._recvTransport.on('close', function (originator) {
						logger.debug('receiving Transport "close" event [originator:%s]', originator);
					});
	
					_this4._recvTransport.on('connectionstatechange', function (state) {
						if (state === 'failed' || state === 'disconnected') {
							logger.warn("_recvTransport connectionstatechange FAILED or DISCONNECTED!");
							_this4.restartIce();
						}
					});
				}).then(function () {
					// Don't produce if explicitely requested to not to do it.
					if (!_this4._produce) return;
	
					// NOTE: Don't depend on this Promise to continue (so we don't do return).
					_promise2.default.resolve()
					// Add our mic.
					.then(function () {
						if (!_this4._room.canSend('audio')) return;
	
						_this4._setMicProducer(_this4.deviceId, _this4.producerVolume, _this4.isUsb).catch(function () {});
					});
				}).then(function () {
					// this.setStateConnection('connected');
				}).catch(function (error) {
					logger.error('_joinRoom() failed:%o', error);
	
					_this4.close();
				});
			}
		}, {
			key: '_setMicProducer',
			value: function _setMicProducer(deviceId, producerVolume, isUsb) {
				var _this5 = this;
	
				if (!this._room.canSend('audio')) {
					return _promise2.default.reject(new Error('cannot send audio'));
				}
	
				if (this._micProducer) {
					return _promise2.default.reject(new Error('mic Producer already exists'));
				}
	
				var producer = void 0;
	
				return _promise2.default.resolve().then(function () {
					logger.debug('_setMicProducer() | calling getUserMedia()');
	
					var constraints = {
						audio: {
							echoCancellation: window.isRageMp ? true : isUsb ? false : null,
							noiseSuppression: false,
							autoGainControl: false,
							deviceId: deviceId,
							volume: producerVolume
						}
					};
	
					return navigator.mediaDevices.getUserMedia(constraints);
				}).then(function (stream) {
					var track = stream.getAudioTracks()[0];
					track.enabled = false;
	
					producer = _this5._room.createProducer(track, null, { source: 'mic' });
	
					// No need to keep original track.
					track.stop();
	
					// Send it.
					return producer.send(_this5._sendTransport);
				}).then(function () {
					producer.pause();
	
					_this5._micProducer = producer;
	
					_DataStore2.default.addProducer({
						id: producer.id,
						source: 'mic',
						locallyPaused: producer.locallyPaused,
						remotelyPaused: producer.remotelyPaused,
						track: producer.track,
						codec: producer.rtpParameters.codecs[0].name
					});
	
					producer.on('close', function (originator) {
						logger.debug('mic Producer "close" event [originator:%s]', originator);
	
						_this5._micProducer = null;
						_DataStore2.default.removeProducer(producer.id);
					});
	
					producer.on('pause', function (originator) {
						logger.debug('mic Producer "pause" event [originator:%s]', originator);
	
						_DataStore2.default.setProducerPaused(producer.id, originator);
					});
	
					producer.on('resume', function (originator) {
						logger.debug('mic Producer "resume" event [originator:%s]', originator);
	
						_DataStore2.default.setProducerResumed(producer.id, originator);
					});
	
					producer.on('handled', function () {
						logger.debug('mic Producer "handled" event');
					});
	
					producer.on('unhandled', function () {
						logger.debug('mic Producer "unhandled" event');
					});
				}).then(function () {
					logger.debug('_setMicProducer() succeeded');
				}).catch(function (error) {
					logger.error('_setMicProducer() failed:%o', error);
	
					if (producer) producer.close();
	
					/* throw error; */
				});
			}
		}, {
			key: '_handlePeer',
			value: function _handlePeer(peer) {
				var _this6 = this;
	
				var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
						_ref4$notify = _ref4.notify,
						notify = _ref4$notify === undefined ? true : _ref4$notify;
	
				_DataStore2.default.addPeer({
					name: peer.name,
					consumers: []
				});
	
				console.log('newPeer', peer.name);
	
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _getIterator3.default)(peer.consumers), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var consumer = _step.value;
	
						this._handleConsumer(consumer);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				peer.on('close', function (originator) {
					logger.debug('peer "close" event [name:"%s", originator:%s]', peer.name, originator);
	
					_DataStore2.default.removePeer(peer.name);
				});
	
				peer.on('newconsumer', function (consumer) {
					logger.debug('peer "newconsumer" event [name:"%s", id:%s, consumer:%o]', peer.name, consumer.id, consumer);
	
					_this6._handleConsumer(consumer);
				});
			}
		}, {
			key: '_handleConsumer',
			value: function _handleConsumer(consumer) {
				var codec = consumer.rtpParameters.codecs[0];
	
				_DataStore2.default.addConsumer({
					id: consumer.id,
					peerName: consumer.peer.name,
					source: consumer.appData.source,
					supported: consumer.supported,
					locallyPaused: consumer.locallyPaused,
					remotelyPaused: consumer.remotelyPaused,
					track: null,
					codec: codec ? codec.name : null
				});
	
				consumer.on('close', function (originator) {
					logger.debug('consumer "close" event [id:%s, originator:%s, consumer:%o]', consumer.id, originator, consumer);
	
					_DataStore2.default.removeConsumer(consumer.id);
				});
	
				consumer.on('pause', function (originator) {
					logger.debug('consumer "pause" event [id:%s, originator:%s, consumer:%o]', consumer.id, originator, consumer);
	
					_DataStore2.default.setConsumerPaused(consumer.id, originator);
	
					if (typeof consumer !== 'undefined' && typeof consumer.peer !== 'undefined') {
						_events2.default.triggerClientMicrophoneEnabled(consumer.peer.name, false);
					}
				});
	
				consumer.on('resume', function (originator) {
					logger.debug('consumer "resume" event [id:%s, originator:%s, consumer:%o]', consumer.id, originator, consumer);
	
					_DataStore2.default.setConsumerResumed(consumer.id, originator);
	
					if (typeof consumer !== 'undefined' && typeof consumer.peer !== 'undefined') {
						_events2.default.triggerClientMicrophoneEnabled(consumer.peer.name, true);
					}
				});
	
				consumer.on('effectiveprofilechange', function (profile) {
					logger.debug('consumer "effectiveprofilechange" event [id:%s, consumer:%o, profile:%s]', consumer.id, consumer, profile);
	
					_DataStore2.default.setConsumerEffectiveProfile(consumer.id, profile);
				});
	
				// Receive the consumer (if we can).
				if (consumer.supported) {
	
					consumer.receive(this._recvTransport).then(function (track) {
						_DataStore2.default.setConsumerTrack(consumer.id, track);
					}).catch(function (error) {
						logger.error('unexpected error while receiving a new Consumer:%o', error);
					});
				}
			}
		}, {
			key: 'stateConnection',
			get: function get() {
				return this._stateConnection;
			}
		}]);
		return NewClient;
	}();
	
	exports.default = NewClient;
	
	},{"../mediasoup-client/":32,"./DataStore":1,"./Logger":2,"./helpers/events":4,"./urlFactory":7,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"protoo-client":201}],7:[function(require,module,exports){
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.getProtooUrl = getProtooUrl;
	function getProtooUrl(peerName, token) {
		var hostname = window.location.hostname;
		var url = "wss://diamond-voice.ru:3443/?peerName=" + peerName + "&token=" + token;
	
		return url;
	}
	
	},{}],8:[function(require,module,exports){
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var UUID = exports.UUID = function UUID(a) {
		return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, UUID);
	};
	
	var lerp = exports.lerp = function lerp(value_one, value_two, deltaTime) {
		return value_one + (value_two - value_one) * deltaTime;
	};
	
	var clamp = exports.clamp = function clamp(min, max, current) {
		return Math.min(Math.max(current, min), max);
	};
	
	},{}],9:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _extends2 = require('babel-runtime/helpers/extends');
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _events = require('events');
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _errors = require('./errors');
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('CommandQueue');
	
	var CommandQueue = function (_EventEmitter) {
		(0, _inherits3.default)(CommandQueue, _EventEmitter);
	
		function CommandQueue() {
			(0, _classCallCheck3.default)(this, CommandQueue);
	
			var _this = (0, _possibleConstructorReturn3.default)(this, (CommandQueue.__proto__ || (0, _getPrototypeOf2.default)(CommandQueue)).call(this));
	
			_this.setMaxListeners(Infinity);
	
			// Closed flag.
			// @type {Boolean}
			_this._closed = false;
	
			// Busy running a command.
			// @type {Boolean}
			_this._busy = false;
	
			// Queue for pending commands. Each command is an Object with method,
			// resolve, reject, and other members (depending the case).
			// @type {Array<Object>}
			_this._queue = [];
			return _this;
		}
	
		(0, _createClass3.default)(CommandQueue, [{
			key: 'close',
			value: function close() {
				this._closed = true;
			}
		}, {
			key: 'push',
			value: function push(method, data) {
				var _this2 = this;
	
				var command = (0, _extends3.default)({ method: method }, data);
	
				logger.debug('push() [method:%s]', method);
	
				return new _promise2.default(function (resolve, reject) {
					var queue = _this2._queue;
	
					command.resolve = resolve;
					command.reject = reject;
	
					// Append command to the queue.
					queue.push(command);
					_this2._handlePendingCommands();
				});
			}
		}, {
			key: '_handlePendingCommands',
			value: function _handlePendingCommands() {
				var _this3 = this;
	
				if (this._busy) return;
	
				var queue = this._queue;
	
				// Take the first command.
				var command = queue[0];
	
				if (!command) return;
	
				this._busy = true;
	
				// Execute it.
				this._handleCommand(command).then(function () {
					_this3._busy = false;
	
					// Remove the first command (the completed one) from the queue.
					queue.shift();
	
					// And continue.
					_this3._handlePendingCommands();
				});
			}
		}, {
			key: '_handleCommand',
			value: function _handleCommand(command) {
				var _this4 = this;
	
				logger.debug('_handleCommand() [method:%s]', command.method);
	
				if (this._closed) {
					command.reject(new _errors.InvalidStateError('closed'));
	
					return _promise2.default.resolve();
				}
	
				var promiseHolder = { promise: null };
	
				this.emit('exec', command, promiseHolder);
	
				return _promise2.default.resolve().then(function () {
					return promiseHolder.promise;
				}).then(function (result) {
					logger.debug('_handleCommand() | command succeeded [method:%s]', command.method);
	
					if (_this4._closed) {
						command.reject(new _errors.InvalidStateError('closed'));
	
						return;
					}
	
					// Resolve the command with the given result (if any).
					command.resolve(result);
				}).catch(function (error) {
					logger.error('_handleCommand() | command failed [method:%s]: %o', command.method, error);
	
					// Reject the command with the error.
					command.reject(error);
				});
			}
		}]);
		return CommandQueue;
	}(_events.EventEmitter);
	
	exports.default = CommandQueue;
	
	},{"./Logger":13,"./errors":18,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/extends":53,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"events":60}],10:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof2 = require('babel-runtime/helpers/typeof');
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _errors = require('./errors');
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var PROFILES = new _set2.default(['default', 'low', 'medium', 'high']);
	var DEFAULT_STATS_INTERVAL = 1000;
	
	var logger = new _Logger2.default('Consumer');
	
	var Consumer = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Consumer, _EnhancedEventEmitter);
	
		/**
		* @private
		*
		* @emits {originator: String, [appData]: Any} pause
		* @emits {originator: String, [appData]: Any} resume
		* @emits {profile: String} effectiveprofilechange
		* @emits {stats: Object} stats
		* @emits handled
		* @emits unhandled
		* @emits {originator: String} close
		*
		* @emits @close
		*/
		function Consumer(id, kind, rtpParameters, peer, appData) {
			(0, _classCallCheck3.default)(this, Consumer);
	
			// Id.
			// @type {Number}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Consumer.__proto__ || (0, _getPrototypeOf2.default)(Consumer)).call(this, logger));
	
			_this._id = id;
	
			// Closed flag.
			// @type {Boolean}
			_this._closed = false;
	
			// Media kind.
			// @type {String}
			_this._kind = kind;
	
			// RTP parameters.
			// @type {RTCRtpParameters}
			_this._rtpParameters = rtpParameters;
	
			// Associated Peer.
			// @type {Peer}
			_this._peer = peer;
	
			// App custom data.
			// @type {Any}
			_this._appData = appData;
	
			// Whether we can receive this Consumer (based on our RTP capabilities).
			// @type {Boolean}
			_this._supported = false;
	
			// Associated Transport.
			// @type {Transport}
			_this._transport = null;
	
			// Remote track.
			// @type {MediaStreamTrack}
			_this._track = null;
	
			// Locally paused flag.
			// @type {Boolean}
			_this._locallyPaused = false;
	
			// Remotely paused flag.
			// @type {Boolean}
			_this._remotelyPaused = false;
	
			// Periodic stats flag.
			// @type {Boolean}
			_this._statsEnabled = false;
	
			// Periodic stats gathering interval (milliseconds).
			// @type {Number}
			_this._statsInterval = DEFAULT_STATS_INTERVAL;
	
			// Preferred profile.
			// @type {String}
			_this._preferredProfile = 'default';
	
			// Effective profile.
			// @type {String}
			_this._effectiveProfile = null;
			return _this;
		}
	
		/**
		* Consumer id.
		*
		* @return {Number}
		*/
	
	
		(0, _createClass3.default)(Consumer, [{
			key: 'close',
	
	
			/**
		 * Closes the Consumer.
		 * This is called when the local Room is closed.
		 *
		 * @private
		 */
			value: function close() {
				logger.debug('close()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				if (this._statsEnabled) {
					this._statsEnabled = false;
	
					if (this.transport) this.transport.disableConsumerStats(this);
				}
	
				this.emit('@close');
				this.safeEmit('close', 'local');
	
				this._destroy();
			}
	
			/**
		 * My remote Consumer was closed.
		 * Invoked via remote notification.
		 *
		 * @private
		 */
	
		}, {
			key: 'remoteClose',
			value: function remoteClose() {
				logger.debug('remoteClose()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				if (this._transport) this._transport.removeConsumer(this);
	
				this._destroy();
	
				this.emit('@close');
				this.safeEmit('close', 'remote');
			}
		}, {
			key: '_destroy',
			value: function _destroy() {
				this._transport = null;
	
				try {
					this._track.stop();
				} catch (error) {}
	
				this._track = null;
			}
	
			/**
		 * Receives RTP.
		 *
		 * @param {transport} Transport instance.
		 *
		 * @return {Promise} Resolves with a remote MediaStreamTrack.
		 */
	
		}, {
			key: 'receive',
			value: function receive(transport) {
				var _this2 = this;
	
				logger.debug('receive() [transport:%o]', transport);
	
				if (this._closed) return _promise2.default.reject(new _errors.InvalidStateError('Consumer closed'));else if (!this._supported) return _promise2.default.reject(new Error('unsupported codecs'));else if (this._transport) return _promise2.default.reject(new Error('already handled by a Transport'));else if ((typeof transport === 'undefined' ? 'undefined' : (0, _typeof3.default)(transport)) !== 'object') return _promise2.default.reject(new TypeError('invalid Transport'));
	
				this._transport = transport;
	
				return transport.addConsumer(this).then(function (track) {
					_this2._track = track;
	
					// If we were paused, disable the track.
					if (_this2.paused) track.enabled = false;
	
					transport.once('@close', function () {
						if (_this2._closed || _this2._transport !== transport) return;
	
						_this2._transport = null;
	
						try {
							_this2._track.stop();
						} catch (error) {}
	
						_this2._track = null;
	
						_this2.safeEmit('unhandled');
					});
	
					_this2.safeEmit('handled');
	
					if (_this2._statsEnabled) transport.enableConsumerStats(_this2, _this2._statsInterval);
	
					return track;
				}).catch(function (error) {
					_this2._transport = null;
	
					throw error;
				});
			}
	
			/**
		 * Pauses receiving media.
		 *
		 * @param {Any} [appData] - App custom data.
		 *
		 * @return {Boolean} true if paused.
		 */
	
		}, {
			key: 'pause',
			value: function pause(appData) {
				logger.debug('pause()');
	
				if (this._closed) {
					logger.error('pause() | Consumer closed');
	
					return false;
				} else if (this._locallyPaused) {
					return true;
				}
	
				this._locallyPaused = true;
	
				if (this._track) this._track.enabled = false;
	
				if (this._transport) this._transport.pauseConsumer(this, appData);
	
				this.safeEmit('pause', 'local', appData);
	
				// Return true if really paused.
				return this.paused;
			}
	
			/**
		 * My remote Consumer was paused.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remotePause',
			value: function remotePause(appData) {
				logger.debug('remotePause()');
	
				if (this._closed || this._remotelyPaused) return;
	
				this._remotelyPaused = true;
	
				if (this._track) this._track.enabled = false;
	
				this.safeEmit('pause', 'remote', appData);
			}
	
			/**
		 * Resumes receiving media.
		 *
		 * @param {Any} [appData] - App custom data.
		 *
		 * @return {Boolean} true if not paused.
		 */
	
		}, {
			key: 'resume',
			value: function resume(appData) {
				logger.debug('resume()');
	
				if (this._closed) {
					logger.error('resume() | Consumer closed');
	
					return false;
				} else if (!this._locallyPaused) {
					return true;
				}
	
				this._locallyPaused = false;
	
				if (this._track && !this._remotelyPaused) this._track.enabled = true;
	
				if (this._transport) this._transport.resumeConsumer(this, appData);
	
				this.safeEmit('resume', 'local', appData);
	
				// Return true if not paused.
				return !this.paused;
			}
	
			/**
		 * My remote Consumer was resumed.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remoteResume',
			value: function remoteResume(appData) {
				logger.debug('remoteResume()');
	
				if (this._closed || !this._remotelyPaused) return;
	
				this._remotelyPaused = false;
	
				if (this._track && !this._locallyPaused) this._track.enabled = true;
	
				this.safeEmit('resume', 'remote', appData);
			}
	
			/**
		 * Set preferred receiving profile.
		 *
		 * @param {String} profile
		 */
	
		}, {
			key: 'setPreferredProfile',
			value: function setPreferredProfile(profile) {
				logger.debug('setPreferredProfile() [profile:%s]', profile);
	
				if (this._closed) {
					logger.error('setPreferredProfile() | Consumer closed');
	
					return;
				} else if (profile === this._preferredProfile) {
					return;
				} else if (!PROFILES.has(profile)) {
					logger.error('setPreferredProfile() | invalid profile "%s"', profile);
	
					return;
				}
	
				this._preferredProfile = profile;
	
				if (this._transport) this._transport.setConsumerPreferredProfile(this, this._preferredProfile);
			}
	
			/**
		 * Preferred receiving profile was set on my remote Consumer.
		 *
		 * @param {String} profile
		 */
	
		}, {
			key: 'remoteSetPreferredProfile',
			value: function remoteSetPreferredProfile(profile) {
				logger.debug('remoteSetPreferredProfile() [profile:%s]', profile);
	
				if (this._closed || profile === this._preferredProfile) return;
	
				this._preferredProfile = profile;
			}
	
			/**
		 * Effective receiving profile changed on my remote Consumer.
		 *
		 * @param {String} profile
		 */
	
		}, {
			key: 'remoteEffectiveProfileChanged',
			value: function remoteEffectiveProfileChanged(profile) {
				logger.debug('remoteEffectiveProfileChanged() [profile:%s]', profile);
	
				if (this._closed || profile === this._effectiveProfile) return;
	
				this._effectiveProfile = profile;
	
				this.safeEmit('effectiveprofilechange', this._effectiveProfile);
			}
	
			/**
		 * Enables periodic stats retrieval.
		 */
	
		}, {
			key: 'enableStats',
			value: function enableStats() {
				var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_STATS_INTERVAL;
	
				logger.debug('enableStats() [interval:%s]', interval);
	
				if (this._closed) {
					logger.error('enableStats() | Consumer closed');
	
					return;
				}
	
				if (this._statsEnabled) return;
	
				if (typeof interval !== 'number' || interval < 1000) this._statsInterval = DEFAULT_STATS_INTERVAL;else this._statsInterval = interval;
	
				this._statsEnabled = true;
	
				if (this._transport) this._transport.enableConsumerStats(this, this._statsInterval);
			}
	
			/**
		 * Disables periodic stats retrieval.
		 */
	
		}, {
			key: 'disableStats',
			value: function disableStats() {
				logger.debug('disableStats()');
	
				if (this._closed) {
					logger.error('disableStats() | Consumer closed');
	
					return;
				}
	
				if (!this._statsEnabled) return;
	
				this._statsEnabled = false;
	
				if (this._transport) this._transport.disableConsumerStats(this);
			}
	
			/**
		 * Mark this Consumer as suitable for reception or not.
		 *
		 * @private
		 *
		 * @param {Boolean} flag
		 */
	
		}, {
			key: 'setSupported',
			value: function setSupported(flag) {
				this._supported = flag;
			}
	
			/**
		 * Receive remote stats.
		 *
		 * @private
		 *
		 * @param {Object} stats
		 */
	
		}, {
			key: 'remoteStats',
			value: function remoteStats(stats) {
				this.safeEmit('stats', stats);
			}
		}, {
			key: 'id',
			get: function get() {
				return this._id;
			}
	
			/**
		 * Whether the Consumer is closed.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'closed',
			get: function get() {
				return this._closed;
			}
	
			/**
		 * Media kind.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'kind',
			get: function get() {
				return this._kind;
			}
	
			/**
		 * RTP parameters.
		 *
		 * @return {RTCRtpParameters}
		 */
	
		}, {
			key: 'rtpParameters',
			get: function get() {
				return this._rtpParameters;
			}
	
			/**
		 * Associated Peer.
		 *
		 * @return {Peer}
		 */
	
		}, {
			key: 'peer',
			get: function get() {
				return this._peer;
			}
	
			/**
		 * App custom data.
		 *
		 * @return {Any}
		 */
	
		}, {
			key: 'appData',
			get: function get() {
				return this._appData;
			}
	
			/**
		 * Whether we can receive this Consumer (based on our RTP capabilities).
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'supported',
			get: function get() {
				return this._supported;
			}
	
			/**
		 * Associated Transport.
		 *
		 * @return {Transport}
		 */
	
		}, {
			key: 'transport',
			get: function get() {
				return this._transport;
			}
	
			/**
		 * The associated track (if any yet).
		 *
		 * @return {MediaStreamTrack|Null}
		 */
	
		}, {
			key: 'track',
			get: function get() {
				return this._track;
			}
	
			/**
		 * Whether the Consumer is locally paused.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'locallyPaused',
			get: function get() {
				return this._locallyPaused;
			}
	
			/**
		 * Whether the Consumer is remotely paused.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'remotelyPaused',
			get: function get() {
				return this._remotelyPaused;
			}
	
			/**
		 * Whether the Consumer is paused.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'paused',
			get: function get() {
				return this._locallyPaused || this._remotelyPaused;
			}
	
			/**
		 * The preferred profile.
		 *
		 * @type {String}
		 */
	
		}, {
			key: 'preferredProfile',
			get: function get() {
				return this._preferredProfile;
			}
	
			/**
		 * The effective profile.
		 *
		 * @type {String}
		 */
	
		}, {
			key: 'effectiveProfile',
			get: function get() {
				return this._effectiveProfile;
			}
		}]);
		return Consumer;
	}(_EnhancedEventEmitter3.default);
	
	exports.default = Consumer;
	
	},{"./EnhancedEventEmitter":12,"./Logger":13,"./errors":18,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/core-js/set":48,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"babel-runtime/helpers/typeof":58}],11:[function(require,module,exports){
	(function (global){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _bowser = require('bowser');
	
	var _bowser2 = _interopRequireDefault(_bowser);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _Chrome = require('./handlers/Chrome55');
	
	var _Chrome2 = _interopRequireDefault(_Chrome);
	
	var _Chrome3 = require('./handlers/Chrome67');
	
	var _Chrome4 = _interopRequireDefault(_Chrome3);
	
	var _Safari = require('./handlers/Safari11');
	
	var _Safari2 = _interopRequireDefault(_Safari);
	
	var _Firefox = require('./handlers/Firefox50');
	
	var _Firefox2 = _interopRequireDefault(_Firefox);
	
	var _Firefox3 = require('./handlers/Firefox59');
	
	var _Firefox4 = _interopRequireDefault(_Firefox3);
	
	var _Edge = require('./handlers/Edge11');
	
	var _Edge2 = _interopRequireDefault(_Edge);
	
	var _ReactNative = require('./handlers/ReactNative');
	
	var _ReactNative2 = _interopRequireDefault(_ReactNative);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Device');
	
	/**
	 * Class with static members representing the underlying device or browser.
	 */
	
	var Device = function () {
		function Device() {
			(0, _classCallCheck3.default)(this, Device);
		}
	
		(0, _createClass3.default)(Device, null, [{
			key: 'getFlag',
	
			/**
		 * Get the device flag.
		 *
		 * @return {String}
		 */
			value: function getFlag() {
				if (!Device._detected) Device._detect();
	
				return Device._flag;
			}
	
			/**
		 * Get the device name.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'getName',
			value: function getName() {
				if (!Device._detected) Device._detect();
	
				return Device._name;
			}
	
			/**
		 * Get the device version.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'getVersion',
			value: function getVersion() {
				if (!Device._detected) Device._detect();
	
				return Device._version;
			}
	
			/**
		 * Get the bowser module Object.
		 *
		 * @return {Object}
		 */
	
		}, {
			key: 'getBowser',
			value: function getBowser() {
				if (!Device._detected) Device._detect();
	
				return Device._bowser;
			}
	
			/**
		 * Whether this device is supported.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'isSupported',
			value: function isSupported() {
				if (!Device._detected) Device._detect();
	
				return Boolean(Device._handlerClass);
			}
	
			/**
		 * Returns a suitable WebRTC handler class.
		 *
		 * @type {Class}
		 */
	
		}, {
			key: '_detect',
	
	
			/**
		 * Detects the current device/browser.
		 *
		 * @private
		 */
			value: function _detect() {
				Device._detected = true;
	
				// If this is React-Native manually fill data.
				if (global.navigator && global.navigator.product === 'ReactNative') {
					Device._flag = 'react-native';
					Device._name = 'ReactNative';
					Device._version = undefined; // NOTE: No idea how to know it.
					Device._bowser = {};
					Device._handlerClass = _ReactNative2.default;
				}
				// If this is a browser use bowser module detection.
				else if (global.navigator && typeof global.navigator.userAgent === 'string') {
						var ua = global.navigator.userAgent;
						var browser = _bowser2.default.detect(ua);
	
						Device._flag = undefined;
						Device._name = browser.name || undefined;
						Device._version = browser.version || undefined;
						Device._bowser = browser;
						Device._handlerClass = null;
	
						// Chrome, Chromium (desktop and mobile).
						if (_bowser2.default.check({ chrome: '67', chromium: '67' }, true, ua)) {
							Device._flag = 'chrome';
							Device._handlerClass = _Chrome4.default;
						} else if (_bowser2.default.check({ chrome: '55', chromium: '55' }, true, ua)) {
							Device._flag = 'chrome';
							Device._handlerClass = _Chrome2.default;
						}
						// Firefox (desktop and mobile).
						else if (_bowser2.default.check({ firefox: '59' }, true, ua)) {
								Device._flag = 'firefox';
								Device._handlerClass = _Firefox4.default;
							} else if (_bowser2.default.check({ firefox: '50' }, true, ua)) {
								Device._flag = 'firefox';
								Device._handlerClass = _Firefox2.default;
							}
							// Safari (desktop and mobile).
							else if (_bowser2.default.check({ safari: '11' }, true, ua)) {
									Device._flag = 'safari';
									Device._handlerClass = _Safari2.default;
								}
								// Edge (desktop).
								else if (_bowser2.default.check({ msedge: '11' }, true, ua)) {
										Device._flag = 'msedge';
										Device._handlerClass = _Edge2.default;
									}
						// Opera (desktop and mobile).
						if (_bowser2.default.check({ opera: '44' }, true, ua)) {
							Device._flag = 'opera';
							Device._handlerClass = _Chrome2.default;
						}
	
						if (Device.isSupported()) {
							logger.debug('browser supported [flag:%s, name:"%s", version:%s, handler:%s]', Device._flag, Device._name, Device._version, Device._handlerClass.tag);
						} else {
							logger.warn('browser not supported [name:%s, version:%s]', Device._name, Device._version);
						}
					}
					// Otherwise fail.
					else {
							logger.warn('device not supported');
						}
			}
		}, {
			key: 'Handler',
			get: function get() {
				if (!Device._detected) Device._detect();
	
				return Device._handlerClass;
			}
		}]);
		return Device;
	}();
	
	// Initialized flag.
	// @type {Boolean}
	
	
	exports.default = Device;
	Device._detected = false;
	
	// Device flag.
	// @type {String}
	Device._flag = undefined;
	
	// Device name.
	// @type {String}
	Device._name = undefined;
	
	// Device version.
	// @type {String}
	Device._version = undefined;
	
	// bowser module Object.
	// @type {Object}
	Device._bowser = undefined;
	
	// WebRTC hander for this device.
	// @type {Class}
	Device._handlerClass = null;
	
	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	
	},{"./Logger":13,"./handlers/Chrome55":19,"./handlers/Chrome67":20,"./handlers/Edge11":21,"./handlers/Firefox50":22,"./handlers/Firefox59":23,"./handlers/ReactNative":24,"./handlers/Safari11":25,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"bowser":59}],12:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _events = require('events');
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var EnhancedEventEmitter = function (_EventEmitter) {
		(0, _inherits3.default)(EnhancedEventEmitter, _EventEmitter);
	
		function EnhancedEventEmitter(logger) {
			(0, _classCallCheck3.default)(this, EnhancedEventEmitter);
	
			var _this = (0, _possibleConstructorReturn3.default)(this, (EnhancedEventEmitter.__proto__ || (0, _getPrototypeOf2.default)(EnhancedEventEmitter)).call(this));
	
			_this.setMaxListeners(Infinity);
	
			_this._logger = logger || new _Logger2.default('EnhancedEventEmitter');
			return _this;
		}
	
		(0, _createClass3.default)(EnhancedEventEmitter, [{
			key: 'safeEmit',
			value: function safeEmit(event) {
				try {
					for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
						args[_key - 1] = arguments[_key];
					}
	
					this.emit.apply(this, [event].concat(args));
				} catch (error) {
					this._logger.error('safeEmit() | event listener threw an error [event:%s]:%o', event, error);
				}
			}
		}, {
			key: 'safeEmitAsPromise',
			value: function safeEmitAsPromise(event) {
				var _this2 = this;
	
				for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
					args[_key2 - 1] = arguments[_key2];
				}
	
				return new _promise2.default(function (resolve, reject) {
					var callback = function callback(result) {
						resolve(result);
					};
	
					var errback = function errback(error) {
						_this2._logger.error('safeEmitAsPromise() | errback called [event:%s]:%o', event, error);
	
						reject(error);
					};
	
					_this2.safeEmit.apply(_this2, [event].concat(args, [callback, errback]));
				});
			}
		}]);
		return EnhancedEventEmitter;
	}(_events.EventEmitter);
	
	exports.default = EnhancedEventEmitter;
	
	},{"./Logger":13,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"events":60}],13:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _debug = require('debug');
	
	var _debug2 = _interopRequireDefault(_debug);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var APP_NAME = 'mediasoup-client';
	
	var Logger = function () {
		function Logger(prefix) {
			(0, _classCallCheck3.default)(this, Logger);
	
			if (prefix) {
				this._debug = (0, _debug2.default)(APP_NAME + ':' + prefix);
				this._warn = (0, _debug2.default)(APP_NAME + ':WARN:' + prefix);
				this._error = (0, _debug2.default)(APP_NAME + ':ERROR:' + prefix);
			} else {
				this._debug = (0, _debug2.default)(APP_NAME);
				this._warn = (0, _debug2.default)(APP_NAME + ':WARN');
				this._error = (0, _debug2.default)(APP_NAME + ':ERROR');
			}
	
			/* eslint-disable no-console */
			this._debug.log = console.info.bind(console);
			this._warn.log = console.warn.bind(console);
			this._error.log = console.error.bind(console);
			/* eslint-enable no-console */
		}
	
		(0, _createClass3.default)(Logger, [{
			key: 'debug',
			get: function get() {
				return this._debug;
			}
		}, {
			key: 'warn',
			get: function get() {
				return this._warn;
			}
		}, {
			key: 'error',
			get: function get() {
				return this._error;
			}
		}]);
		return Logger;
	}();
	
	exports.default = Logger;
	
	},{"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"debug":192}],14:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Peer');
	
	var Peer = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Peer, _EnhancedEventEmitter);
	
		/**
		* @private
		*
		* @emits {consumer: Consumer} newconsumer
		* @emits {originator: String, [appData]: Any} close
		*
		* @emits @close
		*/
		function Peer(name, appData) {
			(0, _classCallCheck3.default)(this, Peer);
	
			// Name.
			// @type {String}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Peer.__proto__ || (0, _getPrototypeOf2.default)(Peer)).call(this, logger));
	
			_this._name = name;
	
			// Closed flag.
			// @type {Boolean}
			_this._closed = false;
	
			// App custom data.
			// @type {Any}
			_this._appData = appData;
	
			// Map of Consumers indexed by id.
			// @type {map<Number, Consumer>}
			_this._consumers = new _map2.default();
			return _this;
		}
	
		/**
		* Peer name.
		*
		* @return {String}
		*/
	
	
		(0, _createClass3.default)(Peer, [{
			key: 'close',
	
	
			/**
		 * Closes the Peer.
		 * This is called when the local Room is closed.
		 *
		 * @private
		 */
			value: function close() {
				logger.debug('close()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				this.emit('@close');
				this.safeEmit('close', 'local');
	
				// Close all the Consumers.
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _getIterator3.default)(this._consumers.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var consumer = _step.value;
	
						consumer.close();
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
	
			/**
		 * The remote Peer or Room was closed.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remoteClose',
			value: function remoteClose(appData) {
				logger.debug('remoteClose()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				this.emit('@close');
				this.safeEmit('close', 'remote', appData);
	
				// Close all the Consumers.
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _getIterator3.default)(this._consumers.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var consumer = _step2.value;
	
						consumer.remoteClose();
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}
	
			/**
		 * Get the Consumer with the given id.
		 *
		 * @param {Number} id
		 *
		 * @return {Consumer}
		 */
	
		}, {
			key: 'getConsumerById',
			value: function getConsumerById(id) {
				return this._consumers.get(id);
			}
	
			/**
		 * Add an associated Consumer.
		 *
		 * @private
		 *
		 * @param {Consumer} consumer
		 */
	
		}, {
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this2 = this;
	
				if (this._consumers.has(consumer.id)) throw new Error('Consumer already exists [id:' + consumer.id + ']');
	
				// Store it.
				this._consumers.set(consumer.id, consumer);
	
				// Handle it.
				consumer.on('@close', function () {
					_this2._consumers.delete(consumer.id);
				});
	
				// Emit event.
				this.safeEmit('newconsumer', consumer);
			}
		}, {
			key: 'name',
			get: function get() {
				return this._name;
			}
	
			/**
		 * Whether the Peer is closed.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'closed',
			get: function get() {
				return this._closed;
			}
	
			/**
		 * App custom data.
		 *
		 * @return {Any}
		 */
	
		}, {
			key: 'appData',
			get: function get() {
				return this._appData;
			}
	
			/**
		 * The list of Consumers.
		 *
		 * @return {Array<Consumer>}
		 */
	
		}, {
			key: 'consumers',
			get: function get() {
				return (0, _from2.default)(this._consumers.values());
			}
		}]);
		return Peer;
	}(_EnhancedEventEmitter3.default);
	
	exports.default = Peer;
	
	},{"./EnhancedEventEmitter":12,"./Logger":13,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55}],15:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _extends2 = require('babel-runtime/helpers/extends');
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _typeof2 = require('babel-runtime/helpers/typeof');
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _errors = require('./errors');
	
	var _utils = require('./utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DEFAULT_STATS_INTERVAL = 1000;
	var SIMULCAST_DEFAULT = {
		low: 100000,
		medium: 300000,
		high: 1500000
	};
	
	var logger = new _Logger2.default('Producer');
	
	var Producer = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Producer, _EnhancedEventEmitter);
	
		/**
		* @private
		*
		* @emits {originator: String, [appData]: Any} pause
		* @emits {originator: String, [appData]: Any} resume
		* @emits {stats: Object} stats
		* @emits handled
		* @emits unhandled
		* @emits trackended
		* @emits {originator: String, [appData]: Any} close
		*
		* @emits {originator: String, [appData]: Any} @close
		*/
		function Producer(track, options, appData) {
			(0, _classCallCheck3.default)(this, Producer);
	
			// Id.
			// @type {Number}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Producer.__proto__ || (0, _getPrototypeOf2.default)(Producer)).call(this, logger));
	
			_this._id = utils.randomNumber();
	
			// Closed flag.
			// @type {Boolean}
			_this._closed = false;
	
			// Original track.
			// @type {MediaStreamTrack}
			_this._originalTrack = track;
	
			// Track cloned from the original one (if supported).
			// @type {MediaStreamTrack}
			try {
				_this._track = track.clone();
			} catch (error) {
				_this._track = track;
			}
	
			// App custom data.
			// @type {Any}
			_this._appData = appData;
	
			// Simulcast.
			// @type {Object|false}
			_this._simulcast = false;
	
			if ((0, _typeof3.default)(options.simulcast) === 'object') _this._simulcast = (0, _extends3.default)({}, SIMULCAST_DEFAULT, options.simulcast);else if (options.simulcast === true) _this._simulcast = (0, _extends3.default)({}, SIMULCAST_DEFAULT);
	
			// Associated Transport.
			// @type {Transport}
			_this._transport = null;
	
			// RTP parameters.
			// @type {RTCRtpParameters}
			_this._rtpParameters = null;
	
			// Locally paused flag.
			// @type {Boolean}
			_this._locallyPaused = !_this._track.enabled;
	
			// Remotely paused flag.
			// @type {Boolean}
			_this._remotelyPaused = false;
	
			// Periodic stats flag.
			// @type {Boolean}
			_this._statsEnabled = false;
	
			// Periodic stats gathering interval (milliseconds).
			// @type {Number}
			_this._statsInterval = DEFAULT_STATS_INTERVAL;
	
			// Handle the effective track.
			_this._handleTrack();
			return _this;
		}
	
		/**
		* Producer id.
		*
		* @return {Number}
		*/
	
	
		(0, _createClass3.default)(Producer, [{
			key: 'close',
	
	
			/**
		 * Closes the Producer.
		 *
		 * @param {Any} [appData] - App custom data.
		 */
			value: function close(appData) {
				logger.debug('close()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				if (this._statsEnabled) {
					this._statsEnabled = false;
	
					if (this.transport) {
						this.transport.disableProducerStats(this);
					}
				}
	
				if (this._transport) this._transport.removeProducer(this, 'local', appData);
	
				this._destroy();
	
				this.emit('@close', 'local', appData);
				this.safeEmit('close', 'local', appData);
			}
	
			/**
		 * My remote Producer was closed.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remoteClose',
			value: function remoteClose(appData) {
				logger.debug('remoteClose()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				if (this._transport) this._transport.removeProducer(this, 'remote', appData);
	
				this._destroy();
	
				this.emit('@close', 'remote', appData);
				this.safeEmit('close', 'remote', appData);
			}
		}, {
			key: '_destroy',
			value: function _destroy() {
				this._transport = false;
				this._rtpParameters = null;
	
				try {
					this._track.stop();
				} catch (error) {}
			}
	
			/**
		 * Sends RTP.
		 *
		 * @param {Transport} transport instance.
		 *
		 * @return {Promise}
		 */
	
		}, {
			key: 'send',
			value: function send(transport) {
				var _this2 = this;
	
				logger.debug('send() [transport:%o]', transport);
	
				if (this._closed) return _promise2.default.reject(new _errors.InvalidStateError('Producer closed'));else if (this._transport) return _promise2.default.reject(new Error('already handled by a Transport'));else if ((typeof transport === 'undefined' ? 'undefined' : (0, _typeof3.default)(transport)) !== 'object') return _promise2.default.reject(new TypeError('invalid Transport'));
	
				this._transport = transport;
	
				return transport.addProducer(this).then(function () {
					transport.once('@close', function () {
						if (_this2._closed || _this2._transport !== transport) return;
	
						_this2._transport.removeProducer(_this2, 'local');
	
						_this2._transport = null;
						_this2._rtpParameters = null;
	
						_this2.safeEmit('unhandled');
					});
	
					_this2.safeEmit('handled');
	
					if (_this2._statsEnabled) transport.enableProducerStats(_this2, _this2._statsInterval);
				}).catch(function (error) {
					_this2._transport = null;
	
					throw error;
				});
			}
	
			/**
		 * Pauses sending media.
		 *
		 * @param {Any} [appData] - App custom data.
		 *
		 * @return {Boolean} true if paused.
		 */
	
		}, {
			key: 'pause',
			value: function pause(appData) {
				logger.debug('pause()');
	
				if (this._closed) {
					logger.error('pause() | Producer closed');
	
					return false;
				} else if (this._locallyPaused) {
					return true;
				}
	
				this._locallyPaused = true;
				this._track.enabled = false;
	
				if (this._transport) this._transport.pauseProducer(this, appData);
	
				this.safeEmit('pause', 'local', appData);
	
				// Return true if really paused.
				return this.paused;
			}
	
			/**
		 * My remote Producer was paused.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remotePause',
			value: function remotePause(appData) {
				logger.debug('remotePause()');
	
				if (this._closed || this._remotelyPaused) return;
	
				this._remotelyPaused = true;
				this._track.enabled = false;
	
				this.safeEmit('pause', 'remote', appData);
			}
	
			/**
		 * Resumes sending media.
		 *
		 * @param {Any} [appData] - App custom data.
		 *
		 * @return {Boolean} true if not paused.
		 */
	
		}, {
			key: 'resume',
			value: function resume(appData) {
				logger.debug('resume()');
	
				if (this._closed) {
					logger.error('resume() | Producer closed');
	
					return false;
				} else if (!this._locallyPaused) {
					return true;
				}
	
				this._locallyPaused = false;
	
				if (!this._remotelyPaused) this._track.enabled = true;
	
				if (this._transport) this._transport.resumeProducer(this, appData);
	
				this.safeEmit('resume', 'local', appData);
	
				// Return true if not paused.
				return !this.paused;
			}
	
			/**
		 * My remote Producer was resumed.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remoteResume',
			value: function remoteResume(appData) {
				logger.debug('remoteResume()');
	
				if (this._closed || !this._remotelyPaused) return;
	
				this._remotelyPaused = false;
	
				if (!this._locallyPaused) this._track.enabled = true;
	
				this.safeEmit('resume', 'remote', appData);
			}
	
			/**
		 * Replaces the current track with a new one.
		 *
		 * @param {MediaStreamTrack} track - New track.
		 *
		 * @return {Promise} Resolves with the new track itself.
		 */
	
		}, {
			key: 'replaceTrack',
			value: function replaceTrack(track) {
				var _this3 = this;
	
				logger.debug('replaceTrack() [track:%o]', track);
	
				if (this._closed) return _promise2.default.reject(new _errors.InvalidStateError('Producer closed'));else if (!(track instanceof MediaStreamTrack)) return _promise2.default.reject(new TypeError('track is not a MediaStreamTrack'));else if (track.readyState === 'ended') return _promise2.default.reject(new Error('track.readyState is "ended"'));
	
				var clonedTrack = void 0;
	
				try {
					clonedTrack = track.clone();
				} catch (error) {
					clonedTrack = track;
				}
	
				return _promise2.default.resolve().then(function () {
					// If this Producer is handled by a Transport, we need to tell it about
					// the new track.
					if (_this3._transport) return _this3._transport.replaceProducerTrack(_this3, clonedTrack);
				}).then(function () {
					// Stop the previous track.
					try {
						_this3._track.onended = null;_this3._track.stop();
					} catch (error) {}
	
					// If this Producer was locally paused/resumed and the state of the new
					// track does not match, fix it.
					if (!_this3.paused) clonedTrack.enabled = true;else clonedTrack.enabled = false;
	
					// Set the new tracks.
					_this3._originalTrack = track;
					_this3._track = clonedTrack;
	
					// Handle the effective track.
					_this3._handleTrack();
	
					// Return the new track.
					return _this3._track;
				});
			}
	
			/**
		 * Set/update RTP parameters.
		 *
		 * @private
		 *
		 * @param {RTCRtpParameters} rtpParameters
		 */
	
		}, {
			key: 'setRtpParameters',
			value: function setRtpParameters(rtpParameters) {
				this._rtpParameters = rtpParameters;
			}
	
			/**
		 * Enables periodic stats retrieval.
		 */
	
		}, {
			key: 'enableStats',
			value: function enableStats() {
				var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_STATS_INTERVAL;
	
				logger.debug('enableStats() [interval:%s]', interval);
	
				if (this._closed) {
					logger.error('enableStats() | Producer closed');
	
					return;
				}
	
				if (this._statsEnabled) return;
	
				if (typeof interval !== 'number' || interval < 1000) this._statsInterval = DEFAULT_STATS_INTERVAL;else this._statsInterval = interval;
	
				this._statsEnabled = true;
	
				if (this._transport) this._transport.enableProducerStats(this, this._statsInterval);
			}
	
			/**
		 * Disables periodic stats retrieval.
		 */
	
		}, {
			key: 'disableStats',
			value: function disableStats() {
				logger.debug('disableStats()');
	
				if (this._closed) {
					logger.error('disableStats() | Producer closed');
	
					return;
				}
	
				if (!this._statsEnabled) return;
	
				this._statsEnabled = false;
	
				if (this._transport) this._transport.disableProducerStats(this);
			}
	
			/**
		 * Receive remote stats.
		 *
		 * @private
		 *
		 * @param {Object} stats
		 */
	
		}, {
			key: 'remoteStats',
			value: function remoteStats(stats) {
				this.safeEmit('stats', stats);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: '_handleTrack',
			value: function _handleTrack() {
				var _this4 = this;
	
				// If the cloned track is closed (for example if the desktop sharing is closed
				// via chrome UI) notify the app and let it decide wheter to close the Producer
				// or not.
				this._track.onended = function () {
					if (_this4._closed) return;
	
					logger.warn('track "ended" event');
	
					_this4.safeEmit('trackended');
				};
			}
		}, {
			key: 'id',
			get: function get() {
				return this._id;
			}
	
			/**
		 * Whether the Producer is closed.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'closed',
			get: function get() {
				return this._closed;
			}
	
			/**
		 * Media kind.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'kind',
			get: function get() {
				return this._track.kind;
			}
	
			/**
		 * The associated track.
		 *
		 * @return {MediaStreamTrack}
		 */
	
		}, {
			key: 'track',
			get: function get() {
				return this._track;
			}
	
			/**
		 * The associated original track.
		 *
		 * @return {MediaStreamTrack}
		 */
	
		}, {
			key: 'originalTrack',
			get: function get() {
				return this._originalTrack;
			}
	
			/**
		 * Simulcast settings.
		 *
		 * @return {Object|false}
		 */
	
		}, {
			key: 'simulcast',
			get: function get() {
				return this._simulcast;
			}
	
			/**
		 * App custom data.
		 *
		 * @return {Any}
		 */
	
		}, {
			key: 'appData',
			get: function get() {
				return this._appData;
			}
	
			/**
		 * Associated Transport.
		 *
		 * @return {Transport}
		 */
	
		}, {
			key: 'transport',
			get: function get() {
				return this._transport;
			}
	
			/**
		 * RTP parameters.
		 *
		 * @return {RTCRtpParameters}
		 */
	
		}, {
			key: 'rtpParameters',
			get: function get() {
				return this._rtpParameters;
			}
	
			/**
		 * Whether the Producer is locally paused.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'locallyPaused',
			get: function get() {
				return this._locallyPaused;
			}
	
			/**
		 * Whether the Producer is remotely paused.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'remotelyPaused',
			get: function get() {
				return this._remotelyPaused;
			}
	
			/**
		 * Whether the Producer is paused.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'paused',
			get: function get() {
				return this._locallyPaused || this._remotelyPaused;
			}
		}]);
		return Producer;
	}(_EnhancedEventEmitter3.default);
	
	exports.default = Producer;
	
	},{"./EnhancedEventEmitter":12,"./Logger":13,"./errors":18,"./utils":34,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/extends":53,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"babel-runtime/helpers/typeof":58}],16:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _extends2 = require('babel-runtime/helpers/extends');
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _typeof2 = require('babel-runtime/helpers/typeof');
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _errors = require('./errors');
	
	var _ortc = require('./ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _Device = require('./Device');
	
	var _Device2 = _interopRequireDefault(_Device);
	
	var _Transport = require('./Transport');
	
	var _Transport2 = _interopRequireDefault(_Transport);
	
	var _Producer = require('./Producer');
	
	var _Producer2 = _interopRequireDefault(_Producer);
	
	var _Peer = require('./Peer');
	
	var _Peer2 = _interopRequireDefault(_Peer);
	
	var _Consumer = require('./Consumer');
	
	var _Consumer2 = _interopRequireDefault(_Consumer);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Room');
	
	var RoomState = {
		new: 'new',
		joining: 'joining',
		joined: 'joined',
		closed: 'closed'
	};
	
	/**
	 * An instance of Room represents a remote multi conference and a local
	 * peer that joins it.
	 */
	
	var Room = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Room, _EnhancedEventEmitter);
	
		/**
		* Room class.
		*
		* @param {Object} [options]
		* @param {Object} [roomSettings] Remote room settings, including its RTP
		* capabilities, mandatory codecs, etc. If given, no 'queryRoom' request is sent
		* to the server to discover them.
		* @param {Number} [options.requestTimeout=10000] - Timeout for sent requests
		* (in milliseconds). Defaults to 10000 (10 seconds).
		* @param {Object} [options.transportOptions] - Options for Transport created in mediasoup.
		* @param {Array<RTCIceServer>} [options.turnServers] - Array of TURN servers.
		*
		* @throws {Error} if device is not supported.
		*
		* @emits {request: Object, callback: Function, errback: Function} request
		* @emits {notification: Object} notify
		* @emits {peer: Peer} newpeer
		* @emits {originator: String, [appData]: Any} close
		*/
		function Room(options) {
			(0, _classCallCheck3.default)(this, Room);
	
			var _this = (0, _possibleConstructorReturn3.default)(this, (Room.__proto__ || (0, _getPrototypeOf2.default)(Room)).call(this, logger));
	
			logger.debug('constructor() [options:%o]', options);
	
			if (!_Device2.default.isSupported()) throw new Error('current browser/device not supported');
	
			options = options || {};
	
			// Computed settings.
			// @type {Object}
			_this._settings = {
				roomSettings: options.roomSettings,
				requestTimeout: options.requestTimeout || 10000,
				transportOptions: options.transportOptions || {},
				turnServers: options.turnServers || []
			};
	
			// Room state.
			// @type {Boolean}
			_this._state = RoomState.new;
	
			// My mediasoup Peer name.
			// @type {String}
			_this._peerName = null;
	
			// Map of Transports indexed by id.
			// @type {map<Number, Transport>}
			_this._transports = new _map2.default();
	
			// Map of Producers indexed by id.
			// @type {map<Number, Producer>}
			_this._producers = new _map2.default();
	
			// Map of Peers indexed by name.
			// @type {map<String, Peer>}
			_this._peers = new _map2.default();
	
			// Extended RTP capabilities.
			// @type {Object}
			_this._extendedRtpCapabilities = null;
	
			// Whether we can send audio/video based on computed extended RTP
			// capabilities.
			// @type {Object}
			_this._canSendByKind = {
				audio: false,
				video: false
			};
	
			_this.peersConnectingQueue = new _set2.default();
			return _this;
		}
	
		/**
		* Whether the Room is joined.
		*
		* @return {Boolean}
		*/
	
	
		(0, _createClass3.default)(Room, [{
			key: 'getTransportById',
	
	
			/**
		 * Get the Transport with the given id.
		 *
		 * @param {Number} id
		 *
		 * @return {Transport}
		 */
			value: function getTransportById(id) {
				return this._transports.get(id);
			}
	
			/**
		 * Get the Producer with the given id.
		 *
		 * @param {Number} id
		 *
		 * @return {Producer}
		 */
	
		}, {
			key: 'getProducerById',
			value: function getProducerById(id) {
				return this._producers.get(id);
			}
	
			/**
		 * Get the Peer with the given name.
		 *
		 * @param {String} name
		 *
		 * @return {Peer}
		 */
	
		}, {
			key: 'getPeerByName',
			value: function getPeerByName(name) {
				return this._peers.get(name);
			}
	
			/**
		 * Start the procedures to join a remote room.
		 * @param {String} peerName - My mediasoup Peer name.
		 * @param {Any} [appData] - App custom data.
		 * @return {Promise}
		 */
	
		}, {
			key: 'join',
			value: function join(peerName, appData) {
				var _this2 = this;
	
				logger.debug('join() [peerName:"%s"]', peerName);
	
				if (typeof peerName !== 'string') return _promise2.default.reject(new TypeError('invalid peerName'));
	
				if (this._state !== RoomState.new && this._state !== RoomState.closed) {
					return _promise2.default.reject(new _errors.InvalidStateError('invalid state "' + this._state + '"'));
				}
	
				this._peerName = peerName;
				this._state = RoomState.joining;
	
				var roomSettings = void 0;
	
				return _promise2.default.resolve().then(function () {
					// If Room settings are provided don't query them.
					if (_this2._settings.roomSettings) {
						roomSettings = _this2._settings.roomSettings;
	
						return;
					} else {
						return _this2._sendRequest('queryRoom', { target: 'room' }).then(function (response) {
							roomSettings = response;
	
							logger.debug('join() | got Room settings:%o', roomSettings);
						});
					}
				}).then(function () {
					return _Device2.default.Handler.getNativeRtpCapabilities();
				}).then(function (nativeRtpCapabilities) {
					logger.debug('join() | native RTP capabilities:%o', nativeRtpCapabilities);
	
					// Get extended RTP capabilities.
					_this2._extendedRtpCapabilities = ortc.getExtendedRtpCapabilities(nativeRtpCapabilities, roomSettings.rtpCapabilities);
	
					logger.debug('join() | extended RTP capabilities:%o', _this2._extendedRtpCapabilities);
	
					// Check unsupported codecs.
					var unsupportedRoomCodecs = ortc.getUnsupportedCodecs(roomSettings.rtpCapabilities, roomSettings.mandatoryCodecPayloadTypes, _this2._extendedRtpCapabilities);
	
					if (unsupportedRoomCodecs.length > 0) {
						logger.error('%s mandatory room codecs not supported:%o', unsupportedRoomCodecs.length, unsupportedRoomCodecs);
	
						throw new _errors.UnsupportedError('mandatory room codecs not supported', unsupportedRoomCodecs);
					}
	
					// Check whether we can send audio/video.
					_this2._canSendByKind.audio = ortc.canSend('audio', _this2._extendedRtpCapabilities);
					_this2._canSendByKind.video = ortc.canSend('video', _this2._extendedRtpCapabilities);
	
					// Generate our effective RTP capabilities for receiving media.
					var effectiveLocalRtpCapabilities = ortc.getRtpCapabilities(_this2._extendedRtpCapabilities);
	
					logger.debug('join() | effective local RTP capabilities for receiving:%o', effectiveLocalRtpCapabilities);
	
					var data = {
						target: 'room',
						peerName: _this2._peerName,
						rtpCapabilities: effectiveLocalRtpCapabilities,
						appData: appData
					};
	
					return _this2._sendRequest('join', data).then(function (response) {
						return response.peers;
					});
				}).then(function (peers) {
					// Handle Peers already existing in the room.
					/* for (const peerData of peers || [])
			{
				try
				{
					this._handlePeerData(peerData);
				}
				catch (error)
				{
					logger.error('join() | error handling Peer:%o', error);
				}
			} */
	
					_this2._state = RoomState.joined;
	
					logger.debug('join() | joined the Room');
	
					// Return the list of already existing Peers.
					return _this2.peers;
				}).catch(function (error) {
					_this2._state = RoomState.new;
	
					throw error;
				});
			}
		}, {
			key: 'requestMediaPeer',
			value: function requestMediaPeer(peerName) {
				var _this3 = this;
	
				if (this._peers.has(peerName)) {
					return _promise2.default.resolve().then(function () {
						return { status: false };
					});
				}
	
				if (this.peersConnectingQueue.has(peerName)) {
					return _promise2.default.resolve().then(function () {
						return { status: false };
					});
				}
	
				this.peersConnectingQueue.add(peerName);
	
				logger.debug('requestMediaPeer() [peerName:"%s"]', peerName);
	
				return _promise2.default.resolve().then(function () {
					return _this3._sendRequest('requestMediaPeer', { peerName: peerName, myPeerName: _this3._peerName });
				}).then(function (response) {
	
					if (response.status) {
						_this3._handlePeerData(response.peer);
					}
	
					_this3.peersConnectingQueue.delete(peerName);
	
					logger.debug('requestMediaPeer():status [peerName:"%s", status:"%s"]', peerName, response.status);
	
					return response;
				}).catch(function (err) {
					_this3.peersConnectingQueue.delete(peerName);
					return err;
				});
			}
		}, {
			key: 'requestCloseMediaPeer',
			value: function requestCloseMediaPeer(peerName) {
				var _this4 = this;
	
				logger.debug('requestCloseMediaPeer() [peerName:"%s"]', peerName);
	
				return _promise2.default.resolve().then(function () {
					return _this4._sendRequest('requestCloseMediaPeer', { peerName: peerName, myPeerName: _this4._peerName });
				}).then(function (response) {
					logger.debug('requestCloseMediaPeer():status [peerName:"%s", status:"%s"]', peerName, response.status);
					return response;
				});
			}
	
			/**
		 * Leave the Room.
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'leave',
			value: function leave(appData) {
				logger.debug('leave()');
	
				if (this.closed) return;
	
				// Send a notification.
				this._sendNotification('leave', { appData: appData });
	
				// Set closed state after sending the notification (otherwise the
				// notification won't be sent).
				this._state = RoomState.closed;
	
				this.safeEmit('close', 'local', appData);
	
				// Close all the Transports.
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _getIterator3.default)(this._transports.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var transport = _step.value;
	
						transport.close();
					}
	
					// Close all the Producers.
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _getIterator3.default)(this._producers.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var producer = _step2.value;
	
						producer.close();
					}
	
					// Close all the Peers.
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
	
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;
	
				try {
					for (var _iterator3 = (0, _getIterator3.default)(this._peers.values()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var peer = _step3.value;
	
						peer.close();
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			}
	
			/**
		 * The remote Room was closed or our remote Peer has been closed.
		 * Invoked via remote notification or via API.
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remoteClose',
			value: function remoteClose(appData) {
				logger.debug('remoteClose()');
	
				if (this.closed) return;
	
				this._state = RoomState.closed;
	
				this.safeEmit('close', 'remote', appData);
	
				// Close all the Transports.
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;
	
				try {
					for (var _iterator4 = (0, _getIterator3.default)(this._transports.values()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var transport = _step4.value;
	
						transport.remoteClose();
					}
	
					// Close all the Producers.
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
	
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;
	
				try {
					for (var _iterator5 = (0, _getIterator3.default)(this._producers.values()), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var producer = _step5.value;
	
						producer.remoteClose();
					}
	
					// Close all the Peers.
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}
	
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;
	
				try {
					for (var _iterator6 = (0, _getIterator3.default)(this._peers.values()), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var peer = _step6.value;
	
						peer.remoteClose();
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}
			}
	
			/**
		 * Whether we can send audio/video.
		 *
		 * @param {String} kind - 'audio' or 'video'.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'canSend',
			value: function canSend(kind) {
				if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');else if (kind !== 'audio' && kind !== 'video') throw new TypeError('invalid kind "' + kind + '"');
	
				return this._canSendByKind[kind];
			}
	
			/**
		 * Creates a Transport.
		 *
		 * @param {String} direction - Must be 'send' or 'recv'.
		 * @param {Any} [appData] - App custom data.
		 *
		 * @return {Transport}
		 *
		 * @throws {InvalidStateError} if not joined.
		 * @throws {TypeError} if wrong arguments.
		 */
	
		}, {
			key: 'createTransport',
			value: function createTransport(direction, appData) {
				var _this5 = this;
	
				logger.debug('createTransport() [direction:%s]', direction);
	
				if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');else if (direction !== 'send' && direction !== 'recv') throw new TypeError('invalid direction "' + direction + '"');
	
				// Create a new Transport.
				var transport = new _Transport2.default(direction, this._extendedRtpCapabilities, this._settings, appData);
	
				// Store it.
				this._transports.set(transport.id, transport);
	
				transport.on('@request', function (method, data, callback, errback) {
					_this5._sendRequest(method, data).then(callback).catch(errback);
				});
	
				transport.on('@notify', function (method, data) {
					_this5._sendNotification(method, data);
				});
	
				transport.on('@close', function () {
					_this5._transports.delete(transport.id);
				});
	
				return transport;
			}
	
			/**
		 * Creates a Producer.
		 *
		 * @param {MediaStreamTrack} track
		 * @param {Object} [options]
		 * @param {Object} [options.simulcast]
		 * @param {Any} [appData] - App custom data.
		 *
		 * @return {Producer}
		 *
		 * @throws {InvalidStateError} if not joined.
		 * @throws {TypeError} if wrong arguments.
		 * @throws {Error} if cannot send the given kind.
		 */
	
		}, {
			key: 'createProducer',
			value: function createProducer(track, options, appData) {
				var _this6 = this;
	
				logger.debug('createProducer() [track:%o, options:%o]', track, options);
	
				if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');else if (!(track instanceof MediaStreamTrack)) throw new TypeError('track is not a MediaStreamTrack');else if (!this._canSendByKind[track.kind]) throw new Error('cannot send ' + track.kind);else if (track.readyState === 'ended') throw new Error('track.readyState is "ended"');
	
				options = options || {};
	
				// Create a new Producer.
				var producer = new _Producer2.default(track, options, appData);
	
				// Store it.
				this._producers.set(producer.id, producer);
	
				producer.on('@close', function () {
					_this6._producers.delete(producer.id);
				});
	
				return producer;
			}
	
			/**
		 * Produce a ICE restart in all the Transports.
		 */
	
		}, {
			key: 'restartIce',
			value: function restartIce() {
				if (!this.joined) throw new _errors.InvalidStateError('invalid state "' + this._state + '"');
	
				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;
	
				try {
					for (var _iterator7 = (0, _getIterator3.default)(this._transports.values()), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var transport = _step7.value;
	
						transport.restartIce();
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}
			}
	
			/**
		 * Provide the local Room with a notification generated by mediasoup server.
		 *
		 * @param {Object} notification
		 */
	
		}, {
			key: 'receiveNotification',
			value: function receiveNotification(notification) {
				var _this7 = this;
	
				if (this.closed) return _promise2.default.reject(new _errors.InvalidStateError('Room closed'));else if ((typeof notification === 'undefined' ? 'undefined' : (0, _typeof3.default)(notification)) !== 'object') return _promise2.default.reject(new TypeError('wrong notification Object'));else if (notification.notification !== true) return _promise2.default.reject(new TypeError('not a notification'));else if (typeof notification.method !== 'string') return _promise2.default.reject(new TypeError('wrong/missing notification method'));
	
				var method = notification.method;
	
	
				logger.debug('receiveNotification() [method:%s, notification:%o]', method, notification);
	
				return _promise2.default.resolve().then(function () {
					switch (method) {
						case 'closed':
							{
								var appData = notification.appData;
	
	
								_this7.remoteClose(appData);
	
								break;
							}
	
						case 'transportClosed':
							{
								var id = notification.id,
										_appData = notification.appData;
	
								var transport = _this7._transports.get(id);
	
								if (!transport) throw new Error('Transport not found [id:"' + id + '"]');
	
								transport.remoteClose(_appData);
	
								break;
							}
	
						case 'transportStats':
							{
								var _id = notification.id,
										stats = notification.stats;
	
								var _transport = _this7._transports.get(_id);
	
								if (!_transport) throw new Error('transport not found [id:' + _id + ']');
	
								_transport.remoteStats(stats);
	
								break;
							}
	
						case 'newPeer':
							{
								var name = notification.name;
	
	
								if (_this7._peers.has(name)) throw new Error('Peer already exists [name:"' + name + '"]');
	
								var peerData = notification;
	
								_this7._handlePeerData(peerData);
	
								break;
							}
	
						case 'peerClosed':
							{
	
								if (!_this7.closed) {
									var peerName = notification.name;
									var _appData2 = notification.appData;
	
									var peer = _this7._peers.get(peerName);
	
									if (!peer) return; // throw new Error(`no Peer found [name:"${peerName}"]`);
	
									peer.remoteClose(_appData2);
								}
	
								break;
							}
	
						case 'producerPaused':
							{
								var _id2 = notification.id,
										_appData3 = notification.appData;
	
								var producer = _this7._producers.get(_id2);
	
								if (!producer) throw new Error('Producer not found [id:' + _id2 + ']');
	
								producer.remotePause(_appData3);
	
								break;
							}
	
						case 'producerResumed':
							{
								var _id3 = notification.id,
										_appData4 = notification.appData;
	
								var _producer = _this7._producers.get(_id3);
	
								if (!_producer) throw new Error('Producer not found [id:' + _id3 + ']');
	
								_producer.remoteResume(_appData4);
	
								break;
							}
	
						case 'producerClosed':
							{
								var _id4 = notification.id,
										_appData5 = notification.appData;
	
								var _producer2 = _this7._producers.get(_id4);
	
								if (!_producer2) throw new Error('Producer not found [id:' + _id4 + ']');
	
								_producer2.remoteClose(_appData5);
	
								break;
							}
	
						case 'producerStats':
							{
								var _id5 = notification.id,
										_stats = notification.stats;
	
								var _producer3 = _this7._producers.get(_id5);
	
								if (!_producer3) throw new Error('Producer not found [id:' + _id5 + ']');
	
								_producer3.remoteStats(_stats);
	
								break;
							}
	
						case 'newConsumer':
							{
								var _peerName = notification.peerName;
	
								var _peer = _this7._peers.get(_peerName);
	
								if (!_peer) throw new Error('no Peer found [name:"' + _peerName + '"]');
	
								var consumerData = notification;
	
								_this7._handleConsumerData(consumerData, _peer);
	
								break;
							}
	
						case 'consumerClosed':
							{
								var _id6 = notification.id,
										_peerName2 = notification.peerName,
										_appData6 = notification.appData;
	
								var _peer2 = _this7._peers.get(_peerName2);
	
								if (!_peer2) throw new Error('no Peer found [name:"' + _peerName2 + '"]');
	
								var consumer = _peer2.getConsumerById(_id6);
	
								if (!consumer) throw new Error('Consumer not found [id:' + _id6 + ']');
	
								consumer.remoteClose(_appData6);
	
								break;
							}
	
						case 'consumerPaused':
							{
								var _id7 = notification.id,
										_peerName3 = notification.peerName,
										_appData7 = notification.appData;
	
								var _peer3 = _this7._peers.get(_peerName3);
	
								if (!_peer3) throw new Error('no Peer found [name:"' + _peerName3 + '"]');
	
								var _consumer = _peer3.getConsumerById(_id7);
	
								if (!_consumer) throw new Error('Consumer not found [id:' + _id7 + ']');
	
								_consumer.remotePause(_appData7);
	
								break;
							}
	
						case 'consumerResumed':
							{
								var _id8 = notification.id,
										_peerName4 = notification.peerName,
										_appData8 = notification.appData;
	
								var _peer4 = _this7._peers.get(_peerName4);
	
								if (!_peer4) throw new Error('no Peer found [name:"' + _peerName4 + '"]');
	
								var _consumer2 = _peer4.getConsumerById(_id8);
	
								if (!_consumer2) throw new Error('Consumer not found [id:' + _id8 + ']');
	
								_consumer2.remoteResume(_appData8);
	
								break;
							}
	
						case 'consumerPreferredProfileSet':
							{
								var _id9 = notification.id,
										_peerName5 = notification.peerName,
										profile = notification.profile;
	
								var _peer5 = _this7._peers.get(_peerName5);
	
								if (!_peer5) throw new Error('no Peer found [name:"' + _peerName5 + '"]');
	
								var _consumer3 = _peer5.getConsumerById(_id9);
	
								if (!_consumer3) throw new Error('Consumer not found [id:' + _id9 + ']');
	
								_consumer3.remoteSetPreferredProfile(profile);
	
								break;
							}
	
						case 'consumerEffectiveProfileChanged':
							{
								var _id10 = notification.id,
										_peerName6 = notification.peerName,
										_profile = notification.profile;
	
								var _peer6 = _this7._peers.get(_peerName6);
	
								if (!_peer6) throw new Error('no Peer found [name:"' + _peerName6 + '"]');
	
								var _consumer4 = _peer6.getConsumerById(_id10);
	
								if (!_consumer4) throw new Error('Consumer not found [id:' + _id10 + ']');
	
								_consumer4.remoteEffectiveProfileChanged(_profile);
	
								break;
							}
	
						case 'consumerStats':
							{
								var _id11 = notification.id,
										_peerName7 = notification.peerName,
										_stats2 = notification.stats;
	
								var _peer7 = _this7._peers.get(_peerName7);
	
								if (!_peer7) throw new Error('no Peer found [name:"' + _peerName7 + '"]');
	
								var _consumer5 = _peer7.getConsumerById(_id11);
	
								if (!_consumer5) throw new Error('Consumer not found [id:' + _id11 + ']');
	
								_consumer5.remoteStats(_stats2);
	
								break;
							}
	
						default:
							throw new Error('unknown notification method "' + method + '"');
					}
				}).catch(function (error) {
					logger.error('receiveNotification() failed [notification:%o]: %s', notification, error);
				});
			}
		}, {
			key: '_sendRequest',
			value: function _sendRequest(method, data) {
				var _this8 = this;
	
				var request = (0, _extends3.default)({ method: method, target: 'peer' }, data);
	
				// Should never happen.
				// Ignore if closed.
				if (this.closed) {
					logger.error('_sendRequest() | Room closed [method:%s, request:%o]', method, request);
	
					return _promise2.default.reject(new _errors.InvalidStateError('Room closed'));
				}
	
				logger.debug('_sendRequest() [method:%s, request:%o]', method, request);
	
				return new _promise2.default(function (resolve, reject) {
					var done = false;
	
					var timer = setTimeout(function () {
						logger.error('request failed [method:%s]: timeout', method);
	
						done = true;
						reject(new _errors.TimeoutError('timeout'));
					}, _this8._settings.requestTimeout);
	
					var callback = function callback(response) {
						if (done) return;
	
						done = true;
						clearTimeout(timer);
	
						if (_this8.closed) {
							logger.error('request failed [method:%s]: Room closed', method);
	
							reject(new Error('Room closed'));
	
							return;
						}
	
						logger.debug('request succeeded [method:%s, response:%o]', method, response);
	
						resolve(response);
					};
	
					var errback = function errback(error) {
						if (done) return;
	
						done = true;
						clearTimeout(timer);
	
						if (_this8.closed) {
							logger.error('request failed [method:%s]: Room closed', method);
	
							reject(new Error('Room closed'));
	
							return;
						}
	
						// Make sure message is an Error.
						if (!(error instanceof Error)) error = new Error(String(error));
	
						logger.error('request failed [method:%s]:%o', method, error);
	
						reject(error);
					};
	
					_this8.safeEmit('request', request, callback, errback);
				});
			}
		}, {
			key: '_sendNotification',
			value: function _sendNotification(method, data) {
				// Ignore if closed.
				if (this.closed) return;
	
				var notification = (0, _extends3.default)({ method: method, target: 'peer', notification: true }, data);
	
				logger.debug('_sendNotification() [method:%s, notification:%o]', method, notification);
	
				this.safeEmit('notify', notification);
			}
		}, {
			key: '_handlePeerData',
			value: function _handlePeerData(peerData) {
				var _this9 = this;
	
				var name = peerData.name,
						consumers = peerData.consumers,
						appData = peerData.appData;
	
				var peer = new _Peer2.default(name, appData);
	
				// Store it.
				this._peers.set(peer.name, peer);
	
				peer.on('@close', function () {
					_this9._peers.delete(peer.name);
				});
	
				// Add consumers.
	
				if ((typeof consumers === 'undefined' ? 'undefined' : (0, _typeof3.default)(consumers)) === 'object') {
					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;
	
					try {
						for (var _iterator8 = (0, _getIterator3.default)(consumers), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var consumerData = _step8.value;
	
							try {
								this._handleConsumerData(consumerData, peer);
							} catch (error) {
								logger.error('error handling existing Consumer in Peer:%o', error);
							}
						}
					} catch (err) {
						_didIteratorError8 = true;
						_iteratorError8 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion8 && _iterator8.return) {
								_iterator8.return();
							}
						} finally {
							if (_didIteratorError8) {
								throw _iteratorError8;
							}
						}
					}
				}
	
				// If already joined emit event.
				if (this.joined) this.safeEmit('newpeer', peer);
			}
		}, {
			key: '_handleConsumerData',
			value: function _handleConsumerData(producerData, peer) {
				var id = producerData.id,
						kind = producerData.kind,
						rtpParameters = producerData.rtpParameters,
						paused = producerData.paused,
						appData = producerData.appData;
	
				var consumer = new _Consumer2.default(id, kind, rtpParameters, peer, appData);
				var supported = ortc.canReceive(consumer.rtpParameters, this._extendedRtpCapabilities);
	
				if (supported) consumer.setSupported(true);
	
				if (paused) consumer.remotePause();
	
				peer.addConsumer(consumer);
			}
		}, {
			key: 'joined',
			get: function get() {
				return this._state === RoomState.joined;
			}
	
			/**
		 * Whether the Room is closed.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'closed',
			get: function get() {
				return this._state === RoomState.closed;
			}
	
			/**
		 * My mediasoup Peer name.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'peerName',
			get: function get() {
				return this._peerName;
			}
	
			/**
		 * The list of Transports.
		 *
		 * @return {Array<Transport>}
		 */
	
		}, {
			key: 'transports',
			get: function get() {
				return (0, _from2.default)(this._transports.values());
			}
	
			/**
		 * The list of Producers.
		 *
		 * @return {Array<Producer>}
		 */
	
		}, {
			key: 'producers',
			get: function get() {
				return (0, _from2.default)(this._producers.values());
			}
	
			/**
		 * The list of Peers.
		 *
		 * @return {Array<Peer>}
		 */
	
		}, {
			key: 'peers',
			get: function get() {
				return (0, _from2.default)(this._peers.values());
			}
		}]);
		return Room;
	}(_EnhancedEventEmitter3.default);
	
	exports.default = Room;
	
	},{"./Consumer":10,"./Device":11,"./EnhancedEventEmitter":12,"./Logger":13,"./Peer":14,"./Producer":15,"./Transport":17,"./errors":18,"./ortc":33,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/core-js/set":48,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/extends":53,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"babel-runtime/helpers/typeof":58}],17:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _Logger = require('./Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('./EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _errors = require('./errors');
	
	var _utils = require('./utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _Device = require('./Device');
	
	var _Device2 = _interopRequireDefault(_Device);
	
	var _CommandQueue = require('./CommandQueue');
	
	var _CommandQueue2 = _interopRequireDefault(_CommandQueue);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DEFAULT_STATS_INTERVAL = 1000;
	
	var logger = new _Logger2.default('Transport');
	
	var Transport = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Transport, _EnhancedEventEmitter);
	
		/**
		* @private
		*
		* @emits {state: String} connectionstatechange
		* @emits {stats: Object} stats
		* @emits {originator: String, [appData]: Any} close
		*
		* @emits {method: String, [data]: Object, callback: Function, errback: Function} @request
		* @emits {method: String, [data]: Object} @notify
		* @emits @close
		*/
		function Transport(direction, extendedRtpCapabilities, settings, appData) {
			(0, _classCallCheck3.default)(this, Transport);
	
			var _this = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this, logger));
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			// Id.
			// @type {Number}
			_this._id = utils.randomNumber();
	
			// Closed flag.
			// @type {Boolean}
			_this._closed = false;
	
			// Direction.
			// @type {String}
			_this._direction = direction;
	
			// Room settings.
			// @type {Object}
			_this._settings = settings;
	
			// App custom data.
			// @type {Any}
			_this._appData = appData;
	
			// Periodic stats flag.
			// @type {Boolean}
			_this._statsEnabled = false;
	
			// Commands handler.
			// @type {CommandQueue}
			_this._commandQueue = new _CommandQueue2.default();
	
			// Device specific handler.
			_this._handler = new _Device2.default.Handler(direction, extendedRtpCapabilities, settings);
	
			// Transport state. Values can be:
			// 'new'/'connecting'/'connected'/'failed'/'disconnected'/'closed'
			// @type {String}
			_this._connectionState = 'new';
	
			_this._commandQueue.on('exec', _this._execCommand.bind(_this));
	
			_this._handleHandler();
			return _this;
		}
	
		/**
		* Transport id.
		*
		* @return {Number}
		*/
	
	
		(0, _createClass3.default)(Transport, [{
			key: 'close',
	
	
			/**
		 * Close the Transport.
		 *
		 * @param {Any} [appData] - App custom data.
		 */
			value: function close(appData) {
				logger.debug('close()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				if (this._statsEnabled) {
					this._statsEnabled = false;
					this.disableStats();
				}
	
				this.safeEmit('@notify', 'closeTransport', { id: this._id, appData: appData });
	
				this.emit('@close');
				this.safeEmit('close', 'local', appData);
	
				this._destroy();
			}
	
			/**
		 * My remote Transport was closed.
		 * Invoked via remote notification.
		 *
		 * @private
		 *
		 * @param {Any} [appData] - App custom data.
		 */
	
		}, {
			key: 'remoteClose',
			value: function remoteClose(appData) {
				logger.debug('remoteClose()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				this.emit('@close');
				this.safeEmit('close', 'remote', appData);
	
				this._destroy();
			}
		}, {
			key: '_destroy',
			value: function _destroy() {
				// Close the CommandQueue.
				this._commandQueue.close();
	
				// Close the handler.
				this._handler.close();
			}
		}, {
			key: 'restartIce',
			value: function restartIce() {
				var _this2 = this;
	
				logger.debug('restartIce()');
	
				if (this._closed) return;else if (this._connectionState === 'new') return;
	
				_promise2.default.resolve().then(function () {
					var data = {
						id: _this2._id
					};
	
					return _this2.safeEmitAsPromise('@request', 'restartTransport', data);
				}).then(function (response) {
					var remoteIceParameters = response.iceParameters;
	
					// Enqueue command.
					return _this2._commandQueue.push('restartIce', { remoteIceParameters: remoteIceParameters });
				}).catch(function (error) {
					logger.error('restartIce() | failed: %o', error);
				});
			}
		}, {
			key: 'enableStats',
			value: function enableStats() {
				var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_STATS_INTERVAL;
	
				logger.debug('enableStats() [interval:%s]', interval);
	
				if (typeof interval !== 'number' || interval < 1000) interval = DEFAULT_STATS_INTERVAL;
	
				this._statsEnabled = true;
	
				var data = {
					id: this._id,
					interval: interval
				};
	
				this.safeEmit('@notify', 'enableTransportStats', data);
			}
		}, {
			key: 'disableStats',
			value: function disableStats() {
				logger.debug('disableStats()');
	
				this._statsEnabled = false;
	
				var data = {
					id: this._id
				};
	
				this.safeEmit('@notify', 'disableTransportStats', data);
			}
		}, {
			key: '_handleHandler',
			value: function _handleHandler() {
				var _this3 = this;
	
				var handler = this._handler;
	
				handler.on('@connectionstatechange', function (state) {
					if (_this3._connectionState === state) return;
	
					logger.debug('Transport connection state changed to %s', state);
	
					_this3._connectionState = state;
	
					if (!_this3._closed) _this3.safeEmit('connectionstatechange', state);
				});
	
				handler.on('@needcreatetransport', function (transportLocalParameters, callback, errback) {
					var data = {
						id: _this3._id,
						direction: _this3._direction,
						options: _this3._settings.transportOptions,
						appData: _this3._appData
					};
	
					if (transportLocalParameters) data.dtlsParameters = transportLocalParameters.dtlsParameters;
	
					_this3.safeEmit('@request', 'createTransport', data, callback, errback);
				});
	
				handler.on('@needupdatetransport', function (transportLocalParameters) {
					var data = {
						id: _this3._id,
						dtlsParameters: transportLocalParameters.dtlsParameters
					};
	
					_this3.safeEmit('@notify', 'updateTransport', data);
				});
	
				handler.on('@needupdateproducer', function (producer, rtpParameters) {
					var data = {
						id: producer.id,
						rtpParameters: rtpParameters
					};
	
					// Update Producer RTP parameters.
					producer.setRtpParameters(rtpParameters);
	
					// Notify the server.
					_this3.safeEmit('@notify', 'updateProducer', data);
				});
			}
	
			/**
		 * Send the given Producer over this Transport.
		 *
		 * @private
		 *
		 * @param {Producer} producer
		 *
		 * @return {Promise}
		 */
	
		}, {
			key: 'addProducer',
			value: function addProducer(producer) {
				logger.debug('addProducer() [producer:%o]', producer);
	
				if (this._closed) return _promise2.default.reject(new _errors.InvalidStateError('Transport closed'));
				if (this._direction !== 'send') return _promise2.default.reject(new Error('not a sending Transport'));
	
				// Enqueue command.
				return this._commandQueue.push('addProducer', { producer: producer });
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer, originator, appData) {
				logger.debug('removeProducer() [producer:%o]', producer);
	
				// Enqueue command.
				if (!this._closed) {
					this._commandQueue.push('removeProducer', { producer: producer }).catch(function () {});
				}
	
				if (originator === 'local') this.safeEmit('@notify', 'closeProducer', { id: producer.id, appData: appData });
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'pauseProducer',
			value: function pauseProducer(producer, appData) {
				logger.debug('pauseProducer() [producer:%o]', producer);
	
				var data = {
					id: producer.id,
					appData: appData
				};
	
				this.safeEmit('@notify', 'pauseProducer', data);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'resumeProducer',
			value: function resumeProducer(producer, appData) {
				logger.debug('resumeProducer() [producer:%o]', producer);
	
				var data = {
					id: producer.id,
					appData: appData
				};
	
				this.safeEmit('@notify', 'resumeProducer', data);
			}
	
			/**
		 * @private
		 *
		 * @return {Promise}
		 */
	
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				logger.debug('replaceProducerTrack() [producer:%o]', producer);
	
				return this._commandQueue.push('replaceProducerTrack', { producer: producer, track: track });
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'enableProducerStats',
			value: function enableProducerStats(producer, interval) {
				logger.debug('enableProducerStats() [producer:%o]', producer);
	
				var data = {
					id: producer.id,
					interval: interval
				};
	
				this.safeEmit('@notify', 'enableProducerStats', data);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'disableProducerStats',
			value: function disableProducerStats(producer) {
				logger.debug('disableProducerStats() [producer:%o]', producer);
	
				var data = {
					id: producer.id
				};
	
				this.safeEmit('@notify', 'disableProducerStats', data);
			}
	
			/**
		 * Receive the given Consumer over this Transport.
		 *
		 * @private
		 *
		 * @param {Consumer} consumer
		 *
		 * @return {Promise} Resolves to a remote MediaStreamTrack.
		 */
	
		}, {
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				logger.debug('addConsumer() [consumer:%o]', consumer);
	
				if (this._closed) return _promise2.default.reject(new _errors.InvalidStateError('Transport closed'));
				if (this._direction !== 'recv') return _promise2.default.reject(new Error('not a receiving Transport'));
	
				// Enqueue command.
				return this._commandQueue.push('addConsumer', { consumer: consumer });
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				logger.debug('removeConsumer() [consumer:%o]', consumer);
	
				// Enqueue command.
				this._commandQueue.push('removeConsumer', { consumer: consumer }).catch(function () {});
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'pauseConsumer',
			value: function pauseConsumer(consumer, appData) {
				logger.debug('pauseConsumer() [consumer:%o]', consumer);
	
				var data = {
					id: consumer.id,
					appData: appData
				};
	
				this.safeEmit('@notify', 'pauseConsumer', data);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'resumeConsumer',
			value: function resumeConsumer(consumer, appData) {
				logger.debug('resumeConsumer() [consumer:%o]', consumer);
	
				var data = {
					id: consumer.id,
					appData: appData
				};
	
				this.safeEmit('@notify', 'resumeConsumer', data);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'setConsumerPreferredProfile',
			value: function setConsumerPreferredProfile(consumer, profile) {
				logger.debug('setConsumerPreferredProfile() [consumer:%o]', consumer);
	
				var data = {
					id: consumer.id,
					profile: profile
				};
	
				this.safeEmit('@notify', 'setConsumerPreferredProfile', data);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'enableConsumerStats',
			value: function enableConsumerStats(consumer, interval) {
				logger.debug('enableConsumerStats() [consumer:%o]', consumer);
	
				var data = {
					id: consumer.id,
					interval: interval
				};
	
				this.safeEmit('@notify', 'enableConsumerStats', data);
			}
	
			/**
		 * @private
		 */
	
		}, {
			key: 'disableConsumerStats',
			value: function disableConsumerStats(consumer) {
				logger.debug('disableConsumerStats() [consumer:%o]', consumer);
	
				var data = {
					id: consumer.id
				};
	
				this.safeEmit('@notify', 'disableConsumerStats', data);
			}
	
			/**
		 * Receive remote stats.
		 *
		 * @private
		 *
		 * @param {Object} stats
		 */
	
		}, {
			key: 'remoteStats',
			value: function remoteStats(stats) {
				this.safeEmit('stats', stats);
			}
		}, {
			key: '_execCommand',
			value: function _execCommand(command, promiseHolder) {
				var promise = void 0;
	
				try {
					switch (command.method) {
						case 'addProducer':
							{
								var producer = command.producer;
	
	
								promise = this._execAddProducer(producer);
								break;
							}
	
						case 'removeProducer':
							{
								var _producer = command.producer;
	
	
								promise = this._execRemoveProducer(_producer);
								break;
							}
	
						case 'replaceProducerTrack':
							{
								var _producer2 = command.producer,
										track = command.track;
	
	
								promise = this._execReplaceProducerTrack(_producer2, track);
								break;
							}
	
						case 'addConsumer':
							{
								var consumer = command.consumer;
	
	
								promise = this._execAddConsumer(consumer);
								break;
							}
	
						case 'removeConsumer':
							{
								var _consumer = command.consumer;
	
	
								promise = this._execRemoveConsumer(_consumer);
								break;
							}
	
						case 'restartIce':
							{
								var remoteIceParameters = command.remoteIceParameters;
	
	
								promise = this._execRestartIce(remoteIceParameters);
								break;
							}
	
						default:
							{
								promise = _promise2.default.reject(new Error('unknown command method "' + command.method + '"'));
							}
					}
				} catch (error) {
					promise = _promise2.default.reject(error);
				}
	
				// Fill the given Promise holder.
				promiseHolder.promise = promise;
			}
		}, {
			key: '_execAddProducer',
			value: function _execAddProducer(producer) {
				var _this4 = this;
	
				logger.debug('_execAddProducer()');
	
				var producerRtpParameters = void 0;
	
				// Call the handler.
				return _promise2.default.resolve().then(function () {
					return _this4._handler.addProducer(producer);
				}).then(function (rtpParameters) {
					producerRtpParameters = rtpParameters;
	
					var data = {
						id: producer.id,
						kind: producer.kind,
						transportId: _this4._id,
						rtpParameters: rtpParameters,
						paused: producer.locallyPaused,
						appData: producer.appData
					};
	
					return _this4.safeEmitAsPromise('@request', 'createProducer', data);
				}).then(function () {
					producer.setRtpParameters(producerRtpParameters);
				});
			}
		}, {
			key: '_execRemoveProducer',
			value: function _execRemoveProducer(producer) {
				logger.debug('_execRemoveProducer()');
	
				// Call the handler.
				return this._handler.removeProducer(producer);
			}
		}, {
			key: '_execReplaceProducerTrack',
			value: function _execReplaceProducerTrack(producer, track) {
				logger.debug('_execReplaceProducerTrack()');
	
				// Call the handler.
				return this._handler.replaceProducerTrack(producer, track);
			}
		}, {
			key: '_execAddConsumer',
			value: function _execAddConsumer(consumer) {
				var _this5 = this;
	
				logger.debug('_execAddConsumer()');
	
				var consumerTrack = void 0;
	
				// Call the handler.
				return _promise2.default.resolve().then(function () {
					return _this5._handler.addConsumer(consumer);
				}).then(function (track) {
					consumerTrack = track;
	
					var data = {
						id: consumer.id,
						transportId: _this5.id,
						paused: consumer.locallyPaused,
						preferredProfile: consumer.preferredProfile
					};
	
					return _this5.safeEmitAsPromise('@request', 'enableConsumer', data);
				}).then(function (response) {
					var paused = response.paused,
							preferredProfile = response.preferredProfile,
							effectiveProfile = response.effectiveProfile;
	
	
					if (paused) consumer.remotePause();
	
					if (preferredProfile) consumer.remoteSetPreferredProfile(preferredProfile);
	
					if (effectiveProfile) consumer.remoteEffectiveProfileChanged(effectiveProfile);
	
					return consumerTrack;
				});
			}
		}, {
			key: '_execRemoveConsumer',
			value: function _execRemoveConsumer(consumer) {
				logger.debug('_execRemoveConsumer()');
	
				// Call the handler.
				return this._handler.removeConsumer(consumer);
			}
		}, {
			key: '_execRestartIce',
			value: function _execRestartIce(remoteIceParameters) {
				logger.debug('_execRestartIce()');
	
				// Call the handler.
				return this._handler.restartIce(remoteIceParameters);
			}
		}, {
			key: 'id',
			get: function get() {
				return this._id;
			}
	
			/**
		 * Whether the Transport is closed.
		 *
		 * @return {Boolean}
		 */
	
		}, {
			key: 'closed',
			get: function get() {
				return this._closed;
			}
	
			/**
		 * Transport direction.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'direction',
			get: function get() {
				return this._direction;
			}
	
			/**
		 * App custom data.
		 *
		 * @return {Any}
		 */
	
		}, {
			key: 'appData',
			get: function get() {
				return this._appData;
			}
	
			/**
		 * Connection state.
		 *
		 * @return {String}
		 */
	
		}, {
			key: 'connectionState',
			get: function get() {
				return this._connectionState;
			}
		}]);
		return Transport;
	}(_EnhancedEventEmitter3.default);
	
	exports.default = Transport;
	
	},{"./CommandQueue":9,"./Device":11,"./EnhancedEventEmitter":12,"./Logger":13,"./errors":18,"./utils":34,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55}],18:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.UnsupportedError = exports.TimeoutError = exports.InvalidStateError = undefined;
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Error produced when calling a method in an invalid state.
	 */
	var InvalidStateError = exports.InvalidStateError = function (_Error) {
		(0, _inherits3.default)(InvalidStateError, _Error);
	
		function InvalidStateError(message) {
			(0, _classCallCheck3.default)(this, InvalidStateError);
	
			var _this = (0, _possibleConstructorReturn3.default)(this, (InvalidStateError.__proto__ || (0, _getPrototypeOf2.default)(InvalidStateError)).call(this, message));
	
			_this.name = 'InvalidStateError';
	
			if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
				Error.captureStackTrace(_this, InvalidStateError);else _this.stack = new Error(message).stack;
			return _this;
		}
	
		return InvalidStateError;
	}(Error);
	
	/**
	 * Error produced when a Promise is rejected due to a timeout.
	 */
	
	
	var TimeoutError = exports.TimeoutError = function (_Error2) {
		(0, _inherits3.default)(TimeoutError, _Error2);
	
		function TimeoutError(message) {
			(0, _classCallCheck3.default)(this, TimeoutError);
	
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (TimeoutError.__proto__ || (0, _getPrototypeOf2.default)(TimeoutError)).call(this, message));
	
			_this2.name = 'TimeoutError';
	
			if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
				Error.captureStackTrace(_this2, InvalidStateError);else _this2.stack = new Error(message).stack;
			return _this2;
		}
	
		return TimeoutError;
	}(Error);
	
	/**
	 * Error indicating not support for something.
	 */
	
	
	var UnsupportedError = exports.UnsupportedError = function (_Error3) {
		(0, _inherits3.default)(UnsupportedError, _Error3);
	
		function UnsupportedError(message, data) {
			(0, _classCallCheck3.default)(this, UnsupportedError);
	
			var _this3 = (0, _possibleConstructorReturn3.default)(this, (UnsupportedError.__proto__ || (0, _getPrototypeOf2.default)(UnsupportedError)).call(this, message));
	
			_this3.name = 'UnsupportedError';
	
			if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
				Error.captureStackTrace(_this3, InvalidStateError);else _this3.stack = new Error(message).stack;
	
			_this3.data = data;
			return _this3;
		}
	
		return UnsupportedError;
	}(Error);
	
	},{"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55}],19:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _commonUtils = require('./sdp/commonUtils');
	
	var sdpCommonUtils = _interopRequireWildcard(_commonUtils);
	
	var _planBUtils = require('./sdp/planBUtils');
	
	var sdpPlanBUtils = _interopRequireWildcard(_planBUtils);
	
	var _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');
	
	var _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Chrome55');
	
	var Handler = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Handler, _EnhancedEventEmitter);
	
		function Handler(direction, rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, Handler);
	
			// RTCPeerConnection instance.
			// @type {RTCPeerConnection}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this, logger));
	
			_this._pc = new RTCPeerConnection({
				iceServers: settings.turnServers || [],
				iceTransportPolicy: 'all',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = rtpParametersByKind;
	
			// Remote SDP handler.
			// @type {RemotePlanBSdp}
			_this._remoteSdp = new _RemotePlanBSdp2.default(direction, rtpParametersByKind);
	
			// Handle RTCPeerConnection connection status.
			_this._pc.addEventListener('iceconnectionstatechange', function () {
				switch (_this._pc.iceConnectionState) {
					case 'checking':
						_this.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this.emit('@connectionstatechange', 'closed');
						break;
				}
			});
			return _this;
		}
	
		(0, _createClass3.default)(Handler, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close RTCPeerConnection.
				try {
					this._pc.close();
				} catch (error) {}
			}
		}]);
		return Handler;
	}(_EnhancedEventEmitter3.default);
	
	var SendHandler = function (_Handler) {
		(0, _inherits3.default)(SendHandler, _Handler);
	
		function SendHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, SendHandler);
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));
	
			_this2._transportReady = false;
	
			// Local stream.
			// @type {MediaStream}
			_this2._stream = new MediaStream();
			return _this2;
		}
	
		(0, _createClass3.default)(SendHandler, [{
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._stream.getTrackById(track.id)) return _promise2.default.reject(new Error('track already added'));
	
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					// Add the track to the local stream.
					_this3._stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					_this3._pc.addStream(_this3._stream);
	
					return _this3._pc.createOffer();
				}).then(function (offer) {
					// If simulcast is set, mangle the offer.
					if (producer.simulcast) {
						logger.debug('addProducer() | enabling simulcast');
	
						var sdpObject = _sdpTransform2.default.parse(offer.sdp);
	
						sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);
	
						var offerSdp = _sdpTransform2.default.write(sdpObject);
	
						offer = { type: 'offer', sdp: offerSdp };
					}
	
					logger.debug('addProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this3._pc.setLocalDescription(offer);
				}).then(function () {
					if (!_this3._transportReady) return _this3._setupTransport();
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);
	
					var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('addProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this3._pc.setRemoteDescription(answer);
				}).then(function () {
					var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for this track.
					sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					return rtpParameters;
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					_this3._stream.removeTrack(track);
					_this3._pc.addStream(_this3._stream);
	
					throw error;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this4 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					// Remove the track from the local stream.
					_this4._stream.removeTrack(track);
	
					// Add the stream to the PeerConnection.
					_this4._pc.addStream(_this4._stream);
	
					return _this4._pc.createOffer();
				}).then(function (offer) {
					logger.debug('removeProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this4._pc.setLocalDescription(offer);
				}).catch(function (error) {
					// NOTE: If there are no sending tracks, setLocalDescription() will fail with
					// "Failed to create channels". If so, ignore it.
					if (_this4._stream.getTracks().length === 0) {
						logger.warn('removeProducer() | ignoring expected error due no sending tracks: %s', error.toString());
	
						return;
					}
	
					throw error;
				}).then(function () {
					if (_this4._pc.signalingState === 'stable') return;
	
					var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
					var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('removeProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this4._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this5 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				var oldTrack = producer.track;
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					// Remove the old track from the local stream.
					_this5._stream.removeTrack(oldTrack);
	
					// Add the new track to the local stream.
					_this5._stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					_this5._pc.addStream(_this5._stream);
	
					return _this5._pc.createOffer();
				}).then(function (offer) {
					// If simulcast is set, mangle the offer.
					if (producer.simulcast) {
						logger.debug('addProducer() | enabling simulcast');
	
						var sdpObject = _sdpTransform2.default.parse(offer.sdp);
	
						sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);
	
						var offerSdp = _sdpTransform2.default.write(sdpObject);
	
						offer = { type: 'offer', sdp: offerSdp };
					}
	
					logger.debug('replaceProducerTrack() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this5._pc.setLocalDescription(offer);
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this5._pc.localDescription.sdp);
	
					var remoteSdp = _this5._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('replaceProducerTrack() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this5._pc.setRemoteDescription(answer);
				}).then(function () {
					var rtpParameters = utils.clone(_this5._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for the new track.
					sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					// We need to provide new RTP parameters.
					_this5.safeEmit('@needupdateproducer', producer, rtpParameters);
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					_this5._stream.removeTrack(track);
					_this5._stream.addTrack(oldTrack);
					_this5._pc.addStream(_this5._stream);
	
					throw error;
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this6 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					return _this6._pc.createOffer({ iceRestart: true });
				}).then(function (offer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this6._pc.setLocalDescription(offer);
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this6._pc.localDescription.sdp);
					var remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this6._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this7 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var sdp = _this7._pc.localDescription.sdp;
					var sdpObj = _sdpTransform2.default.parse(sdp);
					var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// Provide the remote SDP handler with transport local parameters.
					_this7._remoteSdp.setTransportLocalParameters(transportLocalParameters);
	
					// We need transport remote parameters.
					return _this7.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this7._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this7._transportReady = true;
				});
			}
		}]);
		return SendHandler;
	}(Handler);
	
	var RecvHandler = function (_Handler2) {
		(0, _inherits3.default)(RecvHandler, _Handler2);
	
		function RecvHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, RecvHandler);
	
			// Got transport remote parameters.
			// @type {Boolean}
			var _this8 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));
	
			_this8._transportCreated = false;
	
			// Got transport local parameters.
			// @type {Boolean}
			_this8._transportUpdated = false;
	
			// Seen media kinds.
			// @type {Set<String>}
			_this8._kinds = new _set2.default();
	
			// Map of Consumers information indexed by consumer.id.
			// - kind {String}
			// - trackId {String}
			// - ssrc {Number}
			// - rtxSsrc {Number}
			// - cname {String}
			// @type {Map<Number, Object>}
			_this8._consumerInfos = new _map2.default();
			return _this8;
		}
	
		(0, _createClass3.default)(RecvHandler, [{
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this9 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				var encoding = consumer.rtpParameters.encodings[0];
				var cname = consumer.rtpParameters.rtcp.cname;
				var consumerInfo = {
					kind: consumer.kind,
					streamId: 'recv-stream-' + consumer.id,
					trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
					ssrc: encoding.ssrc,
					cname: cname
				};
	
				if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;
	
				this._consumerInfos.set(consumer.id, consumerInfo);
				this._kinds.add(consumer.kind);
	
				return _promise2.default.resolve().then(function () {
					if (!_this9._transportCreated) return _this9._setupTransport();
				}).then(function () {
					var remoteSdp = _this9._remoteSdp.createOfferSdp((0, _from2.default)(_this9._kinds), (0, _from2.default)(_this9._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('addConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this9._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this9._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('addConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this9._pc.setLocalDescription(answer);
				}).then(function () {
					if (!_this9._transportUpdated) return _this9._updateTransport();
				}).then(function () {
					var stream = _this9._pc.getRemoteStreams().find(function (s) {
						return s.id === consumerInfo.streamId;
					});
					var track = stream.getTrackById(consumerInfo.trackId);
	
					if (!track) throw new Error('remote track not found');
	
					return track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this10 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (!this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer not found'));
	
				this._consumerInfos.delete(consumer.id);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this10._remoteSdp.createOfferSdp((0, _from2.default)(_this10._kinds), (0, _from2.default)(_this10._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('removeConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this10._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this10._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('removeConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this10._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this11 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this11._remoteSdp.createOfferSdp((0, _from2.default)(_this11._kinds), (0, _from2.default)(_this11._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this11._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this11._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this11._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this12 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// We need transport remote parameters.
					return _this12.safeEmitAsPromise('@needcreatetransport', null);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this12._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this12._transportCreated = true;
				});
			}
		}, {
			key: '_updateTransport',
			value: function _updateTransport() {
				logger.debug('_updateTransport()');
	
				// Get our local DTLS parameters.
				// const transportLocalParameters = {};
				var sdp = this._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
				var transportLocalParameters = { dtlsParameters: dtlsParameters };
	
				// We need to provide transport local parameters.
				this.safeEmit('@needupdatetransport', transportLocalParameters);
	
				this._transportUpdated = true;
			}
		}]);
		return RecvHandler;
	}(Handler);
	
	var Chrome55 = function () {
		(0, _createClass3.default)(Chrome55, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				var pc = new RTCPeerConnection({
					iceServers: [],
					iceTransportPolicy: 'all',
					bundlePolicy: 'max-bundle',
					rtcpMuxPolicy: 'require'
				});
	
				return pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true
				}).then(function (offer) {
					try {
						pc.close();
					} catch (error) {}
	
					var sdpObj = _sdpTransform2.default.parse(offer.sdp);
					var nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);
	
					return nativeRtpCapabilities;
				}).catch(function (error) {
					try {
						pc.close();
					} catch (error2) {}
	
					throw error;
				});
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'Chrome55';
			}
		}]);
	
		function Chrome55(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, Chrome55);
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			var rtpParametersByKind = void 0;
	
			switch (direction) {
				case 'send':
					{
						rtpParametersByKind = {
							audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new SendHandler(rtpParametersByKind, settings);
					}
				case 'recv':
					{
						rtpParametersByKind = {
							audio: ortc.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new RecvHandler(rtpParametersByKind, settings);
					}
			}
		}
	
		return Chrome55;
	}();
	
	exports.default = Chrome55;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./sdp/RemotePlanBSdp":27,"./sdp/commonUtils":29,"./sdp/planBUtils":30,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/core-js/set":48,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],20:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _commonUtils = require('./sdp/commonUtils');
	
	var sdpCommonUtils = _interopRequireWildcard(_commonUtils);
	
	var _planBUtils = require('./sdp/planBUtils');
	
	var sdpPlanBUtils = _interopRequireWildcard(_planBUtils);
	
	var _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');
	
	var _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Chrome67');
	
	var Handler = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Handler, _EnhancedEventEmitter);
	
		function Handler(direction, rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, Handler);
	
			// RTCPeerConnection instance.
			// @type {RTCPeerConnection}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this, logger));
	
			_this._pc = new RTCPeerConnection({
				iceServers: settings.turnServers || [],
				iceTransportPolicy: 'all',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = rtpParametersByKind;
	
			// Remote SDP handler.
			// @type {RemotePlanBSdp}
			_this._remoteSdp = new _RemotePlanBSdp2.default(direction, rtpParametersByKind);
	
			// Handle RTCPeerConnection connection status.
			_this._pc.addEventListener('iceconnectionstatechange', function () {
				switch (_this._pc.iceConnectionState) {
					case 'checking':
						_this.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this.emit('@connectionstatechange', 'closed');
						break;
				}
			});
			return _this;
		}
	
		(0, _createClass3.default)(Handler, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close RTCPeerConnection.
				try {
					this._pc.close();
				} catch (error) {}
			}
		}]);
		return Handler;
	}(_EnhancedEventEmitter3.default);
	
	var SendHandler = function (_Handler) {
		(0, _inherits3.default)(SendHandler, _Handler);
	
		function SendHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, SendHandler);
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));
	
			_this2._transportReady = false;
	
			// Local stream.
			// @type {MediaStream}
			_this2._stream = new MediaStream();
			return _this2;
		}
	
		(0, _createClass3.default)(SendHandler, [{
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._stream.getTrackById(track.id)) return _promise2.default.reject(new Error('track already added'));
	
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					// Add the track to the local stream.
					_this3._stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					_this3._pc.addStream(_this3._stream);
	
					return _this3._pc.createOffer();
				}).then(function (offer) {
					// If simulcast is set, mangle the offer.
					if (producer.simulcast) {
						logger.debug('addProducer() | enabling simulcast');
	
						var sdpObject = _sdpTransform2.default.parse(offer.sdp);
	
						sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);
	
						var offerSdp = _sdpTransform2.default.write(sdpObject);
	
						offer = { type: 'offer', sdp: offerSdp };
					}
	
					logger.debug('addProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this3._pc.setLocalDescription(offer);
				}).then(function () {
					if (!_this3._transportReady) return _this3._setupTransport();
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);
	
					var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('addProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this3._pc.setRemoteDescription(answer);
				}).then(function () {
					var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for this track.
					sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					return rtpParameters;
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					_this3._stream.removeTrack(track);
					_this3._pc.addStream(_this3._stream);
	
					throw error;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this4 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					// Remove the track from the local stream.
					_this4._stream.removeTrack(track);
	
					// Add the stream to the PeerConnection.
					_this4._pc.addStream(_this4._stream);
	
					return _this4._pc.createOffer();
				}).then(function (offer) {
					logger.debug('removeProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this4._pc.setLocalDescription(offer);
				}).catch(function (error) {
					// NOTE: If there are no sending tracks, setLocalDescription() will fail with
					// "Failed to create channels". If so, ignore it.
					if (_this4._stream.getTracks().length === 0) {
						logger.warn('removeProducer() | ignoring expected error due no sending tracks: %s', error.toString());
	
						return;
					}
	
					throw error;
				}).then(function () {
					if (_this4._pc.signalingState === 'stable') return;
	
					var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
					var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('removeProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this4._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this5 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				var oldTrack = producer.track;
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this5._pc.getSenders().find(function (s) {
						return s.track === oldTrack;
					});
	
					if (!rtpSender) throw new Error('local track not found');
	
					return rtpSender.replaceTrack(track);
				}).then(function () {
					// Remove the old track from the local stream.
					_this5._stream.removeTrack(oldTrack);
	
					// Add the new track to the local stream.
					_this5._stream.addTrack(track);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this6 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					return _this6._pc.createOffer({ iceRestart: true });
				}).then(function (offer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this6._pc.setLocalDescription(offer);
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this6._pc.localDescription.sdp);
					var remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this6._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this7 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var sdp = _this7._pc.localDescription.sdp;
					var sdpObj = _sdpTransform2.default.parse(sdp);
					var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// Provide the remote SDP handler with transport local parameters.
					_this7._remoteSdp.setTransportLocalParameters(transportLocalParameters);
	
					// We need transport remote parameters.
					return _this7.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this7._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this7._transportReady = true;
				});
			}
		}]);
		return SendHandler;
	}(Handler);
	
	var RecvHandler = function (_Handler2) {
		(0, _inherits3.default)(RecvHandler, _Handler2);
	
		function RecvHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, RecvHandler);
	
			// Got transport remote parameters.
			// @type {Boolean}
			var _this8 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));
	
			_this8._transportCreated = false;
	
			// Got transport local parameters.
			// @type {Boolean}
			_this8._transportUpdated = false;
	
			// Seen media kinds.
			// @type {Set<String>}
			_this8._kinds = new _set2.default();
	
			// Map of Consumers information indexed by consumer.id.
			// - kind {String}
			// - trackId {String}
			// - ssrc {Number}
			// - rtxSsrc {Number}
			// - cname {String}
			// @type {Map<Number, Object>}
			_this8._consumerInfos = new _map2.default();
			return _this8;
		}
	
		(0, _createClass3.default)(RecvHandler, [{
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this9 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				var encoding = consumer.rtpParameters.encodings[0];
				var cname = consumer.rtpParameters.rtcp.cname;
				var consumerInfo = {
					kind: consumer.kind,
					streamId: 'recv-stream-' + consumer.id,
					trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
					ssrc: encoding.ssrc,
					cname: cname
				};
	
				if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;
	
				this._consumerInfos.set(consumer.id, consumerInfo);
				this._kinds.add(consumer.kind);
	
				return _promise2.default.resolve().then(function () {
					if (!_this9._transportCreated) return _this9._setupTransport();
				}).then(function () {
					var remoteSdp = _this9._remoteSdp.createOfferSdp((0, _from2.default)(_this9._kinds), (0, _from2.default)(_this9._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('addConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this9._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this9._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('addConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this9._pc.setLocalDescription(answer);
				}).then(function () {
					if (!_this9._transportUpdated) return _this9._updateTransport();
				}).then(function () {
					var stream = _this9._pc.getRemoteStreams().find(function (s) {
						return s.id === consumerInfo.streamId;
					});
					var track = stream.getTrackById(consumerInfo.trackId);
	
					if (!track) throw new Error('remote track not found');
	
					return track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this10 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (!this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer not found'));
	
				this._consumerInfos.delete(consumer.id);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this10._remoteSdp.createOfferSdp((0, _from2.default)(_this10._kinds), (0, _from2.default)(_this10._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('removeConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this10._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this10._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('removeConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this10._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this11 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this11._remoteSdp.createOfferSdp((0, _from2.default)(_this11._kinds), (0, _from2.default)(_this11._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this11._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this11._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this11._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this12 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// We need transport remote parameters.
					return _this12.safeEmitAsPromise('@needcreatetransport', null);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this12._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this12._transportCreated = true;
				});
			}
		}, {
			key: '_updateTransport',
			value: function _updateTransport() {
				logger.debug('_updateTransport()');
	
				// Get our local DTLS parameters.
				// const transportLocalParameters = {};
				var sdp = this._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
				var transportLocalParameters = { dtlsParameters: dtlsParameters };
	
				// We need to provide transport local parameters.
				this.safeEmit('@needupdatetransport', transportLocalParameters);
	
				this._transportUpdated = true;
			}
		}]);
		return RecvHandler;
	}(Handler);
	
	var Chrome67 = function () {
		(0, _createClass3.default)(Chrome67, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				var pc = new RTCPeerConnection({
					iceServers: [],
					iceTransportPolicy: 'all',
					bundlePolicy: 'max-bundle',
					rtcpMuxPolicy: 'require'
				});
	
				return pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true
				}).then(function (offer) {
					try {
						pc.close();
					} catch (error) {}
	
					var sdpObj = _sdpTransform2.default.parse(offer.sdp);
					var nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);
	
					return nativeRtpCapabilities;
				}).catch(function (error) {
					try {
						pc.close();
					} catch (error2) {}
	
					throw error;
				});
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'Chrome67';
			}
		}]);
	
		function Chrome67(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, Chrome67);
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			var rtpParametersByKind = void 0;
	
			switch (direction) {
				case 'send':
					{
						rtpParametersByKind = {
							audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new SendHandler(rtpParametersByKind, settings);
					}
				case 'recv':
					{
						rtpParametersByKind = {
							audio: ortc.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new RecvHandler(rtpParametersByKind, settings);
					}
			}
		}
	
		return Chrome67;
	}();
	
	exports.default = Chrome67;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./sdp/RemotePlanBSdp":27,"./sdp/commonUtils":29,"./sdp/planBUtils":30,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/core-js/set":48,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],21:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _edgeUtils = require('./ortc/edgeUtils');
	
	var edgeUtils = _interopRequireWildcard(_edgeUtils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var CNAME = 'CNAME-EDGE-' + utils.randomNumber(); /* global RTCIceGatherer, RTCIceTransport, RTCDtlsTransport, RTCRtpReceiver, RTCRtpSender */
	
	var logger = new _Logger2.default('Edge11');
	
	var Edge11 = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Edge11, _EnhancedEventEmitter);
		(0, _createClass3.default)(Edge11, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				return edgeUtils.getCapabilities();
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'Edge11';
			}
		}]);
	
		function Edge11(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, Edge11);
	
			var _this = (0, _possibleConstructorReturn3.default)(this, (Edge11.__proto__ || (0, _getPrototypeOf2.default)(Edge11)).call(this, logger));
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = {
				audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
				video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
			};
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			_this._transportReady = false;
	
			// ICE gatherer.
			_this._iceGatherer = null;
	
			// ICE transport.
			_this._iceTransport = null;
	
			// DTLS transport.
			// @type {RTCDtlsTransport}
			_this._dtlsTransport = null;
	
			// Map of RTCRtpSenders indexed by Producer.id.
			// @type {Map<Number, RTCRtpSender}
			_this._rtpSenders = new _map2.default();
	
			// Map of RTCRtpReceivers indexed by Consumer.id.
			// @type {Map<Number, RTCRtpReceiver}
			_this._rtpReceivers = new _map2.default();
	
			// Remote Transport parameters.
			// @type {Object}
			_this._transportRemoteParameters = null;
	
			_this._setIceGatherer(settings);
			_this._setIceTransport();
			_this._setDtlsTransport();
			return _this;
		}
	
		(0, _createClass3.default)(Edge11, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close the ICE gatherer.
				// NOTE: Not yet implemented by Edge.
				try {
					this._iceGatherer.close();
				} catch (error) {}
	
				// Close the ICE transport.
				try {
					this._iceTransport.stop();
				} catch (error) {}
	
				// Close the DTLS transport.
				try {
					this._dtlsTransport.stop();
				} catch (error) {}
	
				// Close RTCRtpSenders.
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _getIterator3.default)(this._rtpSenders.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var rtpSender = _step.value;
	
						try {
							rtpSender.stop();
						} catch (error) {}
					}
	
					// Close RTCRtpReceivers.
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _getIterator3.default)(this._rtpReceivers.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var rtpReceiver = _step2.value;
	
						try {
							rtpReceiver.stop();
						} catch (error) {}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}
		}, {
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this2 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._rtpSenders.has(producer.id)) return _promise2.default.reject(new Error('Producer already added'));
	
				return _promise2.default.resolve().then(function () {
					if (!_this2._transportReady) return _this2._setupTransport();
				}).then(function () {
					logger.debug('addProducer() | calling new RTCRtpSender()');
	
					var rtpSender = new RTCRtpSender(track, _this2._dtlsTransport);
					var rtpParameters = utils.clone(_this2._rtpParametersByKind[producer.kind]);
	
					// Fill RTCRtpParameters.encodings.
					var encoding = {
						ssrc: utils.randomNumber()
					};
	
					if (rtpParameters.codecs.some(function (codec) {
						return codec.name === 'rtx';
					})) {
						encoding.rtx = {
							ssrc: utils.randomNumber()
						};
					}
	
					rtpParameters.encodings.push(encoding);
	
					// Fill RTCRtpParameters.rtcp.
					rtpParameters.rtcp = {
						cname: CNAME,
						reducedSize: true,
						mux: true
					};
	
					// NOTE: Convert our standard RTCRtpParameters into those that Edge
					// expects.
					var edgeRtpParameters = edgeUtils.mangleRtpParameters(rtpParameters);
	
					logger.debug('addProducer() | calling rtpSender.send() [params:%o]', edgeRtpParameters);
	
					rtpSender.send(edgeRtpParameters);
	
					// Store it.
					_this2._rtpSenders.set(producer.id, rtpSender);
	
					return rtpParameters;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					var rtpSender = _this3._rtpSenders.get(producer.id);
	
					if (!rtpSender) throw new Error('RTCRtpSender not found');
	
					_this3._rtpSenders.delete(producer.id);
	
					try {
						logger.debug('removeProducer() | calling rtpSender.stop()');
	
						rtpSender.stop();
					} catch (error) {
						logger.warn('rtpSender.stop() failed:%o', error);
					}
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this4 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					var rtpSender = _this4._rtpSenders.get(producer.id);
	
					if (!rtpSender) throw new Error('RTCRtpSender not found');
	
					rtpSender.setTrack(track);
				});
			}
		}, {
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this5 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._rtpReceivers.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				return _promise2.default.resolve().then(function () {
					if (!_this5._transportReady) return _this5._setupTransport();
				}).then(function () {
					logger.debug('addProducer() | calling new RTCRtpReceiver()');
	
					var rtpReceiver = new RTCRtpReceiver(_this5._dtlsTransport, consumer.kind);
	
					rtpReceiver.addEventListener('error', function (event) {
						logger.error('iceGatherer "error" event [event:%o]', event);
					});
	
					// NOTE: Convert our standard RTCRtpParameters into those that Edge
					// expects.
					var edgeRtpParameters = edgeUtils.mangleRtpParameters(consumer.rtpParameters);
	
					logger.debug('addProducer() | calling rtpReceiver.receive() [params:%o]', edgeRtpParameters);
	
					rtpReceiver.receive(edgeRtpParameters);
	
					// Store it.
					_this5._rtpReceivers.set(consumer.id, rtpReceiver);
	
					return rtpReceiver.track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this6 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				return _promise2.default.resolve().then(function () {
					var rtpReceiver = _this6._rtpReceivers.get(consumer.id);
	
					if (!rtpReceiver) throw new Error('RTCRtpReceiver not found');
	
					_this6._rtpReceivers.delete(consumer.id);
	
					try {
						logger.debug('removeConsumer() | calling rtpReceiver.stop()');
	
						rtpReceiver.stop();
					} catch (error) {
						logger.warn('rtpReceiver.stop() failed:%o', error);
					}
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this7 = this;
	
				logger.debug('restartIce()');
	
				_promise2.default.resolve().then(function () {
					_this7._transportRemoteParameters.iceParameters = remoteIceParameters;
	
					var remoteIceCandidates = _this7._transportRemoteParameters.iceCandidates;
	
					logger.debug('restartIce() | calling iceTransport.start()');
	
					_this7._iceTransport.start(_this7._iceGatherer, remoteIceParameters, 'controlling');
	
					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;
	
					try {
						for (var _iterator3 = (0, _getIterator3.default)(remoteIceCandidates), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var candidate = _step3.value;
	
							_this7._iceTransport.addRemoteCandidate(candidate);
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}
	
					_this7._iceTransport.addRemoteCandidate({});
				});
			}
		}, {
			key: '_setIceGatherer',
			value: function _setIceGatherer(settings) {
				var iceGatherer = new RTCIceGatherer({
					iceServers: settings.turnServers || [],
					gatherPolicy: 'all'
				});
	
				iceGatherer.addEventListener('error', function (event) {
					logger.error('iceGatherer "error" event [event:%o]', event);
				});
	
				// NOTE: Not yet implemented by Edge, which starts gathering automatically.
				try {
					iceGatherer.gather();
				} catch (error) {
					logger.debug('iceGatherer.gather() failed: %s', error.toString());
				}
	
				this._iceGatherer = iceGatherer;
			}
		}, {
			key: '_setIceTransport',
			value: function _setIceTransport() {
				var _this8 = this;
	
				var iceTransport = new RTCIceTransport(this._iceGatherer);
	
				// NOTE: Not yet implemented by Edge.
				iceTransport.addEventListener('statechange', function () {
					switch (iceTransport.state) {
						case 'checking':
							_this8.emit('@connectionstatechange', 'connecting');
							break;
						case 'connected':
						case 'completed':
							_this8.emit('@connectionstatechange', 'connected');
							break;
						case 'failed':
							_this8.emit('@connectionstatechange', 'failed');
							break;
						case 'disconnected':
							_this8.emit('@connectionstatechange', 'disconnected');
							break;
						case 'closed':
							_this8.emit('@connectionstatechange', 'closed');
							break;
					}
				});
	
				// NOTE: Not standard, but implemented by Edge.
				iceTransport.addEventListener('icestatechange', function () {
					switch (iceTransport.state) {
						case 'checking':
							_this8.emit('@connectionstatechange', 'connecting');
							break;
						case 'connected':
						case 'completed':
							_this8.emit('@connectionstatechange', 'connected');
							break;
						case 'failed':
							_this8.emit('@connectionstatechange', 'failed');
							break;
						case 'disconnected':
							_this8.emit('@connectionstatechange', 'disconnected');
							break;
						case 'closed':
							_this8.emit('@connectionstatechange', 'closed');
							break;
					}
				});
	
				iceTransport.addEventListener('candidatepairchange', function (event) {
					logger.debug('iceTransport "candidatepairchange" event [pair:%o]', event.pair);
				});
	
				this._iceTransport = iceTransport;
			}
		}, {
			key: '_setDtlsTransport',
			value: function _setDtlsTransport() {
				var dtlsTransport = new RTCDtlsTransport(this._iceTransport);
	
				// NOTE: Not yet implemented by Edge.
				dtlsTransport.addEventListener('statechange', function () {
					logger.debug('dtlsTransport "statechange" event [state:%s]', dtlsTransport.state);
				});
	
				// NOTE: Not standard, but implemented by Edge.
				dtlsTransport.addEventListener('dtlsstatechange', function () {
					logger.debug('dtlsTransport "dtlsstatechange" event [state:%s]', dtlsTransport.state);
				});
	
				dtlsTransport.addEventListener('error', function (event) {
					logger.error('dtlsTransport "error" event [event:%o]', event);
				});
	
				this._dtlsTransport = dtlsTransport;
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this9 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var dtlsParameters = _this9._dtlsTransport.getLocalParameters();
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// We need transport remote parameters.
					return _this9.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					_this9._transportRemoteParameters = transportRemoteParameters;
	
					var remoteIceParameters = transportRemoteParameters.iceParameters;
					var remoteIceCandidates = transportRemoteParameters.iceCandidates;
					var remoteDtlsParameters = transportRemoteParameters.dtlsParameters;
	
					// Start the RTCIceTransport.
					_this9._iceTransport.start(_this9._iceGatherer, remoteIceParameters, 'controlling');
	
					// Add remote ICE candidates.
					var _iteratorNormalCompletion4 = true;
					var _didIteratorError4 = false;
					var _iteratorError4 = undefined;
	
					try {
						for (var _iterator4 = (0, _getIterator3.default)(remoteIceCandidates), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
							var candidate = _step4.value;
	
							_this9._iceTransport.addRemoteCandidate(candidate);
						}
	
						// Also signal a 'complete' candidate as per spec.
						// NOTE: It should be {complete: true} but Edge prefers {}.
						// NOTE: If we don't signal end of candidates, the Edge RTCIceTransport
						// won't enter the 'completed' state.
					} catch (err) {
						_didIteratorError4 = true;
						_iteratorError4 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion4 && _iterator4.return) {
								_iterator4.return();
							}
						} finally {
							if (_didIteratorError4) {
								throw _iteratorError4;
							}
						}
					}
	
					_this9._iceTransport.addRemoteCandidate({});
	
					// NOTE: Edge does not like SHA less than 256.
					remoteDtlsParameters.fingerprints = remoteDtlsParameters.fingerprints.filter(function (fingerprint) {
						return fingerprint.algorithm === 'sha-256' || fingerprint.algorithm === 'sha-384' || fingerprint.algorithm === 'sha-512';
					});
	
					// Start the RTCDtlsTransport.
					_this9._dtlsTransport.start(remoteDtlsParameters);
	
					_this9._transportReady = true;
				});
			}
		}]);
		return Edge11;
	}(_EnhancedEventEmitter3.default);
	
	exports.default = Edge11;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./ortc/edgeUtils":26,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55}],22:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _commonUtils = require('./sdp/commonUtils');
	
	var sdpCommonUtils = _interopRequireWildcard(_commonUtils);
	
	var _unifiedPlanUtils = require('./sdp/unifiedPlanUtils');
	
	var sdpUnifiedPlanUtils = _interopRequireWildcard(_unifiedPlanUtils);
	
	var _RemoteUnifiedPlanSdp = require('./sdp/RemoteUnifiedPlanSdp');
	
	var _RemoteUnifiedPlanSdp2 = _interopRequireDefault(_RemoteUnifiedPlanSdp);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Firefox50');
	
	var Handler = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Handler, _EnhancedEventEmitter);
	
		function Handler(direction, rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, Handler);
	
			// RTCPeerConnection instance.
			// @type {RTCPeerConnection}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this, logger));
	
			_this._pc = new RTCPeerConnection({
				iceServers: settings.turnServers || [],
				iceTransportPolicy: 'all',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = rtpParametersByKind;
	
			// Remote SDP handler.
			// @type {RemoteUnifiedPlanSdp}
			_this._remoteSdp = new _RemoteUnifiedPlanSdp2.default(direction, rtpParametersByKind);
	
			// Handle RTCPeerConnection connection status.
			_this._pc.addEventListener('iceconnectionstatechange', function () {
				switch (_this._pc.iceConnectionState) {
					case 'checking':
						_this.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this.emit('@connectionstatechange', 'closed');
						break;
				}
			});
			return _this;
		}
	
		(0, _createClass3.default)(Handler, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close RTCPeerConnection.
				try {
					this._pc.close();
				} catch (error) {}
			}
		}]);
		return Handler;
	}(_EnhancedEventEmitter3.default);
	
	var SendHandler = function (_Handler) {
		(0, _inherits3.default)(SendHandler, _Handler);
	
		function SendHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, SendHandler);
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));
	
			_this2._transportReady = false;
	
			// Local stream.
			// @type {MediaStream}
			_this2._stream = new MediaStream();
	
			// RID value counter for simulcast (so they never match).
			// @type {Number}
			_this2._nextRid = 1;
			return _this2;
		}
	
		(0, _createClass3.default)(SendHandler, [{
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._stream.getTrackById(track.id)) return _promise2.default.reject(new Error('track already added'));
	
				var rtpSender = void 0;
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					_this3._stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					rtpSender = _this3._pc.addTrack(track, _this3._stream);
				}).then(function () {
					// If simulcast is not enabled, do nothing.
					if (!producer.simulcast) return;
	
					logger.debug('addProducer() | enabling simulcast');
	
					var encodings = [];
	
					if (producer.simulcast.high) {
						encodings.push({
							rid: 'high' + _this3._nextRid,
							active: true,
							priority: 'high',
							maxBitrate: producer.simulcast.high
						});
					}
	
					if (producer.simulcast.medium) {
						encodings.push({
							rid: 'medium' + _this3._nextRid,
							active: true,
							priority: 'medium',
							maxBitrate: producer.simulcast.medium
						});
					}
	
					if (producer.simulcast.low) {
						encodings.push({
							rid: 'low' + _this3._nextRid,
							active: true,
							priority: 'low',
							maxBitrate: producer.simulcast.low
						});
					}
	
					// Update RID counter for future ones.
					_this3._nextRid++;
	
					return rtpSender.setParameters({ encodings: encodings });
				}).then(function () {
					return _this3._pc.createOffer();
				}).then(function (offer) {
					logger.debug('addProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this3._pc.setLocalDescription(offer);
				}).then(function () {
					if (!_this3._transportReady) return _this3._setupTransport();
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);
	
					var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('addProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this3._pc.setRemoteDescription(answer);
				}).then(function () {
					var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for this track.
					sdpUnifiedPlanUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					return rtpParameters;
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					try {
						_this3._pc.removeTrack(rtpSender);
					} catch (error2) {}
	
					_this3._stream.removeTrack(track);
	
					throw error;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this4 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this4._pc.getSenders().find(function (s) {
						return s.track === track;
					});
	
					if (!rtpSender) throw new Error('RTCRtpSender found');
	
					// Remove the associated RtpSender.
					_this4._pc.removeTrack(rtpSender);
	
					// Remove the track from the local stream.
					_this4._stream.removeTrack(track);
	
					return _promise2.default.resolve().then(function () {
						return _this4._pc.createOffer();
					}).then(function (offer) {
						logger.debug('removeProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
						return _this4._pc.setLocalDescription(offer);
					});
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
					var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('removeProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this4._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this5 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				var oldTrack = producer.track;
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this5._pc.getSenders().find(function (s) {
						return s.track === oldTrack;
					});
	
					if (!rtpSender) throw new Error('local track not found');
	
					return rtpSender.replaceTrack(track);
				}).then(function () {
					// Remove the old track from the local stream.
					_this5._stream.removeTrack(oldTrack);
	
					// Add the new track to the local stream.
					_this5._stream.addTrack(track);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this6 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					return _this6._pc.createOffer({ iceRestart: true });
				}).then(function (offer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this6._pc.setLocalDescription(offer);
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this6._pc.localDescription.sdp);
					var remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this6._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this7 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var sdp = _this7._pc.localDescription.sdp;
					var sdpObj = _sdpTransform2.default.parse(sdp);
					var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// Provide the remote SDP handler with transport local parameters.
					_this7._remoteSdp.setTransportLocalParameters(transportLocalParameters);
	
					// We need transport remote parameters.
					return _this7.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this7._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this7._transportReady = true;
				});
			}
		}]);
		return SendHandler;
	}(Handler);
	
	var RecvHandler = function (_Handler2) {
		(0, _inherits3.default)(RecvHandler, _Handler2);
	
		function RecvHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, RecvHandler);
	
			// Got transport remote parameters.
			// @type {Boolean}
			var _this8 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));
	
			_this8._transportCreated = false;
	
			// Got transport local parameters.
			// @type {Boolean}
			_this8._transportUpdated = false;
	
			// Map of Consumers information indexed by consumer.id.
			// - mid {String}
			// - kind {String}
			// - closed {Boolean}
			// - trackId {String}
			// - ssrc {Number}
			// - rtxSsrc {Number}
			// - cname {String}
			// @type {Map<Number, Object>}
			_this8._consumerInfos = new _map2.default();
	
			// Add an entry into consumers info to hold a fake DataChannel, so
			// the first m= section of the remote SDP is always "active" and Firefox
			// does not close the transport when there is no remote audio/video Consumers.
			//
			// ISSUE: https://github.com/versatica/mediasoup-client/issues/2
			var fakeDataChannelConsumerInfo = {
				mid: 'fake-dc',
				kind: 'application',
				closed: false,
				cname: null
			};
	
			_this8._consumerInfos.set(555, fakeDataChannelConsumerInfo);
			return _this8;
		}
	
		(0, _createClass3.default)(RecvHandler, [{
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this9 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				var encoding = consumer.rtpParameters.encodings[0];
				var cname = consumer.rtpParameters.rtcp.cname;
				var consumerInfo = {
					mid: '' + consumer.kind[0] + consumer.id,
					kind: consumer.kind,
					closed: consumer.closed,
					streamId: 'recv-stream-' + consumer.id,
					trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
					ssrc: encoding.ssrc,
					cname: cname
				};
	
				if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;
	
				this._consumerInfos.set(consumer.id, consumerInfo);
	
				return _promise2.default.resolve().then(function () {
					if (!_this9._transportCreated) return _this9._setupTransport();
				}).then(function () {
					var remoteSdp = _this9._remoteSdp.createOfferSdp((0, _from2.default)(_this9._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('addConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this9._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this9._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('addConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this9._pc.setLocalDescription(answer);
				}).then(function () {
					if (!_this9._transportUpdated) return _this9._updateTransport();
				}).then(function () {
					var newRtpReceiver = _this9._pc.getReceivers().find(function (rtpReceiver) {
						var track = rtpReceiver.track;
	
	
						if (!track) return false;
	
						return track.id === consumerInfo.trackId;
					});
	
					if (!newRtpReceiver) throw new Error('remote track not found');
	
					return newRtpReceiver.track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this10 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				var consumerInfo = this._consumerInfos.get(consumer.id);
	
				if (!consumerInfo) return _promise2.default.reject(new Error('Consumer not found'));
	
				consumerInfo.closed = true;
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this10._remoteSdp.createOfferSdp((0, _from2.default)(_this10._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('removeConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this10._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this10._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('removeConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this10._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this11 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this11._remoteSdp.createOfferSdp((0, _from2.default)(_this11._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this11._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this11._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this11._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this12 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// We need transport remote parameters.
					return _this12.safeEmitAsPromise('@needcreatetransport', null);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this12._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this12._transportCreated = true;
				});
			}
		}, {
			key: '_updateTransport',
			value: function _updateTransport() {
				logger.debug('_updateTransport()');
	
				// Get our local DTLS parameters.
				// const transportLocalParameters = {};
				var sdp = this._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
				var transportLocalParameters = { dtlsParameters: dtlsParameters };
	
				// We need to provide transport local parameters.
				this.safeEmit('@needupdatetransport', transportLocalParameters);
	
				this._transportUpdated = true;
			}
		}]);
		return RecvHandler;
	}(Handler);
	
	var Firefox50 = function () {
		(0, _createClass3.default)(Firefox50, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				var pc = new RTCPeerConnection({
					iceServers: [],
					iceTransportPolicy: 'all',
					bundlePolicy: 'max-bundle',
					rtcpMuxPolicy: 'require'
				});
	
				// NOTE: We need to add a real video track to get the RID extension mapping.
				var canvas = document.createElement('canvas');
	
				// NOTE: Otherwise Firefox fails in next line.
				canvas.getContext('2d');
	
				var fakeStream = canvas.captureStream();
				var fakeVideoTrack = fakeStream.getVideoTracks()[0];
				var rtpSender = pc.addTrack(fakeVideoTrack, fakeStream);
	
				rtpSender.setParameters({
					encodings: [{ rid: 'RID1', maxBitrate: 40000 }, { rid: 'RID2', maxBitrate: 10000 }]
				});
	
				return pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true
				}).then(function (offer) {
					try {
						canvas.remove();
					} catch (error) {}
	
					try {
						pc.close();
					} catch (error) {}
	
					var sdpObj = _sdpTransform2.default.parse(offer.sdp);
					var nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);
	
					return nativeRtpCapabilities;
				}).catch(function (error) {
					try {
						canvas.remove();
					} catch (error2) {}
	
					try {
						pc.close();
					} catch (error2) {}
	
					throw error;
				});
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'Firefox50';
			}
		}]);
	
		function Firefox50(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, Firefox50);
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			var rtpParametersByKind = void 0;
	
			switch (direction) {
				case 'send':
					{
						rtpParametersByKind = {
							audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new SendHandler(rtpParametersByKind, settings);
					}
				case 'recv':
					{
						rtpParametersByKind = {
							audio: ortc.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new RecvHandler(rtpParametersByKind, settings);
					}
			}
		}
	
		return Firefox50;
	}();
	
	exports.default = Firefox50;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./sdp/RemoteUnifiedPlanSdp":28,"./sdp/commonUtils":29,"./sdp/unifiedPlanUtils":31,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],23:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _commonUtils = require('./sdp/commonUtils');
	
	var sdpCommonUtils = _interopRequireWildcard(_commonUtils);
	
	var _unifiedPlanUtils = require('./sdp/unifiedPlanUtils');
	
	var sdpUnifiedPlanUtils = _interopRequireWildcard(_unifiedPlanUtils);
	
	var _RemoteUnifiedPlanSdp = require('./sdp/RemoteUnifiedPlanSdp');
	
	var _RemoteUnifiedPlanSdp2 = _interopRequireDefault(_RemoteUnifiedPlanSdp);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Firefox59');
	
	var Handler = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Handler, _EnhancedEventEmitter);
	
		function Handler(direction, rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, Handler);
	
			// RTCPeerConnection instance.
			// @type {RTCPeerConnection}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this, logger));
	
			_this._pc = new RTCPeerConnection({
				iceServers: settings.turnServers || [],
				iceTransportPolicy: 'all',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = rtpParametersByKind;
	
			// Remote SDP handler.
			// @type {RemoteUnifiedPlanSdp}
			_this._remoteSdp = new _RemoteUnifiedPlanSdp2.default(direction, rtpParametersByKind);
	
			// Handle RTCPeerConnection connection status.
			_this._pc.addEventListener('iceconnectionstatechange', function () {
				switch (_this._pc.iceConnectionState) {
					case 'checking':
						_this.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this.emit('@connectionstatechange', 'closed');
						break;
				}
			});
			return _this;
		}
	
		(0, _createClass3.default)(Handler, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close RTCPeerConnection.
				try {
					this._pc.close();
				} catch (error) {}
			}
		}]);
		return Handler;
	}(_EnhancedEventEmitter3.default);
	
	var SendHandler = function (_Handler) {
		(0, _inherits3.default)(SendHandler, _Handler);
	
		function SendHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, SendHandler);
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));
	
			_this2._transportReady = false;
	
			// Local stream.
			// @type {MediaStream}
			_this2._stream = new MediaStream();
	
			// RID value counter for simulcast (so they never match).
			// @type {Number}
			_this2._nextRid = 1;
			return _this2;
		}
	
		(0, _createClass3.default)(SendHandler, [{
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._stream.getTrackById(track.id)) return _promise2.default.reject(new Error('track already added'));
	
				var rtpSender = void 0;
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					_this3._stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					rtpSender = _this3._pc.addTrack(track, _this3._stream);
				}).then(function () {
					// If simulcast is not enabled, do nothing.
					if (!producer.simulcast) return;
	
					logger.debug('addProducer() | enabling simulcast');
	
					var encodings = [];
	
					if (producer.simulcast.high) {
						encodings.push({
							rid: 'high' + _this3._nextRid,
							active: true,
							priority: 'high',
							maxBitrate: producer.simulcast.high
						});
					}
	
					if (producer.simulcast.medium) {
						encodings.push({
							rid: 'medium' + _this3._nextRid,
							active: true,
							priority: 'medium',
							maxBitrate: producer.simulcast.medium
						});
					}
	
					if (producer.simulcast.low) {
						encodings.push({
							rid: 'low' + _this3._nextRid,
							active: true,
							priority: 'low',
							maxBitrate: producer.simulcast.low
						});
					}
	
					// Update RID counter for future ones.
					_this3._nextRid++;
	
					return rtpSender.setParameters({ encodings: encodings });
				}).then(function () {
					return _this3._pc.createOffer();
				}).then(function (offer) {
					logger.debug('addProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this3._pc.setLocalDescription(offer);
				}).then(function () {
					if (!_this3._transportReady) return _this3._setupTransport();
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);
	
					var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('addProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this3._pc.setRemoteDescription(answer);
				}).then(function () {
					var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for this track.
					sdpUnifiedPlanUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					return rtpParameters;
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					try {
						_this3._pc.removeTrack(rtpSender);
					} catch (error2) {}
	
					_this3._stream.removeTrack(track);
	
					throw error;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this4 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this4._pc.getSenders().find(function (s) {
						return s.track === track;
					});
	
					if (!rtpSender) throw new Error('RTCRtpSender found');
	
					// Remove the associated RtpSender.
					_this4._pc.removeTrack(rtpSender);
	
					// Remove the track from the local stream.
					_this4._stream.removeTrack(track);
	
					return _promise2.default.resolve().then(function () {
						return _this4._pc.createOffer();
					}).then(function (offer) {
						logger.debug('removeProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
						return _this4._pc.setLocalDescription(offer);
					});
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
					var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('removeProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this4._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this5 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				var oldTrack = producer.track;
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this5._pc.getSenders().find(function (s) {
						return s.track === oldTrack;
					});
	
					if (!rtpSender) throw new Error('local track not found');
	
					return rtpSender.replaceTrack(track);
				}).then(function () {
					// Remove the old track from the local stream.
					_this5._stream.removeTrack(oldTrack);
	
					// Add the new track to the local stream.
					_this5._stream.addTrack(track);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this6 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					return _this6._pc.createOffer({ iceRestart: true });
				}).then(function (offer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this6._pc.setLocalDescription(offer);
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this6._pc.localDescription.sdp);
					var remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this6._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this7 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var sdp = _this7._pc.localDescription.sdp;
					var sdpObj = _sdpTransform2.default.parse(sdp);
					var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// Provide the remote SDP handler with transport local parameters.
					_this7._remoteSdp.setTransportLocalParameters(transportLocalParameters);
	
					// We need transport remote parameters.
					return _this7.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this7._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this7._transportReady = true;
				});
			}
		}]);
		return SendHandler;
	}(Handler);
	
	var RecvHandler = function (_Handler2) {
		(0, _inherits3.default)(RecvHandler, _Handler2);
	
		function RecvHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, RecvHandler);
	
			// Got transport remote parameters.
			// @type {Boolean}
			var _this8 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));
	
			_this8._transportCreated = false;
	
			// Got transport local parameters.
			// @type {Boolean}
			_this8._transportUpdated = false;
	
			// Map of Consumers information indexed by consumer.id.
			// - mid {String}
			// - kind {String}
			// - closed {Boolean}
			// - trackId {String}
			// - ssrc {Number}
			// - rtxSsrc {Number}
			// - cname {String}
			// @type {Map<Number, Object>}
			_this8._consumerInfos = new _map2.default();
			return _this8;
		}
	
		(0, _createClass3.default)(RecvHandler, [{
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this9 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				var encoding = consumer.rtpParameters.encodings[0];
				var cname = consumer.rtpParameters.rtcp.cname;
				var consumerInfo = {
					mid: '' + consumer.kind[0] + consumer.id,
					kind: consumer.kind,
					closed: consumer.closed,
					streamId: 'recv-stream-' + consumer.id,
					trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
					ssrc: encoding.ssrc,
					cname: cname
				};
	
				if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;
	
				this._consumerInfos.set(consumer.id, consumerInfo);
	
				return _promise2.default.resolve().then(function () {
					if (!_this9._transportCreated) return _this9._setupTransport();
				}).then(function () {
					var remoteSdp = _this9._remoteSdp.createOfferSdp((0, _from2.default)(_this9._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('addConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this9._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this9._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('addConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this9._pc.setLocalDescription(answer);
				}).then(function () {
					if (!_this9._transportUpdated) return _this9._updateTransport();
				}).then(function () {
					var newTransceiver = _this9._pc.getTransceivers().find(function (transceiver) {
						var receiver = transceiver.receiver;
	
	
						if (!receiver) return false;
	
						var track = receiver.track;
	
	
						if (!track) return false;
	
						return transceiver.mid === consumerInfo.mid;
					});
	
					if (!newTransceiver) throw new Error('remote track not found');
	
					return newTransceiver.receiver.track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this10 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				var consumerInfo = this._consumerInfos.get(consumer.id);
	
				if (!consumerInfo) return _promise2.default.reject(new Error('Consumer not found'));
	
				consumerInfo.closed = true;
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this10._remoteSdp.createOfferSdp((0, _from2.default)(_this10._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('removeConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this10._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this10._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('removeConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this10._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this11 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this11._remoteSdp.createOfferSdp((0, _from2.default)(_this11._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this11._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this11._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this11._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this12 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// We need transport remote parameters.
					return _this12.safeEmitAsPromise('@needcreatetransport', null);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this12._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this12._transportCreated = true;
				});
			}
		}, {
			key: '_updateTransport',
			value: function _updateTransport() {
				logger.debug('_updateTransport()');
	
				// Get our local DTLS parameters.
				// const transportLocalParameters = {};
				var sdp = this._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
				var transportLocalParameters = { dtlsParameters: dtlsParameters };
	
				// We need to provide transport local parameters.
				this.safeEmit('@needupdatetransport', transportLocalParameters);
	
				this._transportUpdated = true;
			}
		}]);
		return RecvHandler;
	}(Handler);
	
	var Firefox59 = function () {
		(0, _createClass3.default)(Firefox59, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				var pc = new RTCPeerConnection({
					iceServers: [],
					iceTransportPolicy: 'all',
					bundlePolicy: 'max-bundle',
					rtcpMuxPolicy: 'require'
				});
	
				// NOTE: We need to add a real video track to get the RID extension mapping.
				var canvas = document.createElement('canvas');
	
				// NOTE: Otherwise Firefox fails in next line.
				canvas.getContext('2d');
	
				var fakeStream = canvas.captureStream();
				var fakeVideoTrack = fakeStream.getVideoTracks()[0];
				var rtpSender = pc.addTrack(fakeVideoTrack, fakeStream);
	
				rtpSender.setParameters({
					encodings: [{ rid: 'RID1', maxBitrate: 40000 }, { rid: 'RID2', maxBitrate: 10000 }]
				});
	
				return pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true
				}).then(function (offer) {
					try {
						canvas.remove();
					} catch (error) {}
	
					try {
						pc.close();
					} catch (error) {}
	
					var sdpObj = _sdpTransform2.default.parse(offer.sdp);
					var nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);
	
					return nativeRtpCapabilities;
				}).catch(function (error) {
					try {
						canvas.remove();
					} catch (error2) {}
	
					try {
						pc.close();
					} catch (error2) {}
	
					throw error;
				});
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'Firefox59';
			}
		}]);
	
		function Firefox59(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, Firefox59);
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			var rtpParametersByKind = void 0;
	
			switch (direction) {
				case 'send':
					{
						rtpParametersByKind = {
							audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new SendHandler(rtpParametersByKind, settings);
					}
				case 'recv':
					{
						rtpParametersByKind = {
							audio: ortc.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new RecvHandler(rtpParametersByKind, settings);
					}
			}
		}
	
		return Firefox59;
	}();
	
	exports.default = Firefox59;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./sdp/RemoteUnifiedPlanSdp":28,"./sdp/commonUtils":29,"./sdp/unifiedPlanUtils":31,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],24:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _commonUtils = require('./sdp/commonUtils');
	
	var sdpCommonUtils = _interopRequireWildcard(_commonUtils);
	
	var _planBUtils = require('./sdp/planBUtils');
	
	var sdpPlanBUtils = _interopRequireWildcard(_planBUtils);
	
	var _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');
	
	var _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('ReactNative');
	
	var Handler = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Handler, _EnhancedEventEmitter);
	
		function Handler(direction, rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, Handler);
	
			// RTCPeerConnection instance.
			// @type {RTCPeerConnection}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this, logger));
	
			_this._pc = new RTCPeerConnection({
				iceServers: settings.turnServers || [],
				iceTransportPolicy: 'all',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = rtpParametersByKind;
	
			// Remote SDP handler.
			// @type {RemotePlanBSdp}
			_this._remoteSdp = new _RemotePlanBSdp2.default(direction, rtpParametersByKind);
	
			// Handle RTCPeerConnection connection status.
			_this._pc.addEventListener('iceconnectionstatechange', function () {
				switch (_this._pc.iceConnectionState) {
					case 'checking':
						_this.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this.emit('@connectionstatechange', 'closed');
						break;
				}
			});
			return _this;
		}
	
		(0, _createClass3.default)(Handler, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close RTCPeerConnection.
				try {
					this._pc.close();
				} catch (error) {}
			}
		}]);
		return Handler;
	}(_EnhancedEventEmitter3.default);
	
	var SendHandler = function (_Handler) {
		(0, _inherits3.default)(SendHandler, _Handler);
	
		function SendHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, SendHandler);
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));
	
			_this2._transportReady = false;
	
			// Handled tracks.
			// @type {Set<MediaStreamTrack>}
			_this2._tracks = new _set2.default();
			return _this2;
		}
	
		(0, _createClass3.default)(SendHandler, [{
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._tracks.has(track)) return _promise2.default.reject(new Error('track already added'));
	
				if (!track.streamReactTag) return _promise2.default.reject(new Error('no track.streamReactTag property'));
	
				var stream = void 0;
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					// Add the track to the Set.
					_this3._tracks.add(track);
	
					// Hack: Create a new stream with track.streamReactTag as id.
					stream = new MediaStream(track.streamReactTag);
	
					// Add the track to the stream.
					stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					_this3._pc.addStream(stream);
	
					return _this3._pc.createOffer();
				}).then(function (offer) {
					// If simulcast is set, mangle the offer.
					if (producer.simulcast) {
						logger.debug('addProducer() | enabling simulcast');
	
						var sdpObject = _sdpTransform2.default.parse(offer.sdp);
	
						sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);
	
						var offerSdp = _sdpTransform2.default.write(sdpObject);
	
						offer = { type: 'offer', sdp: offerSdp };
					}
	
					logger.debug('addProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					var offerDesc = new RTCSessionDescription(offer);
	
					return _this3._pc.setLocalDescription(offerDesc);
				}).then(function () {
					if (!_this3._transportReady) return _this3._setupTransport();
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);
	
					var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('addProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					var answerDesc = new RTCSessionDescription(answer);
	
					return _this3._pc.setRemoteDescription(answerDesc);
				}).then(function () {
					var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for this track.
					sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					return rtpParameters;
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					_this3._tracks.delete(track);
					stream.removeTrack(track);
					_this3._pc.addStream(stream);
	
					throw error;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this4 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (!track.streamReactTag) return _promise2.default.reject(new Error('no track.streamReactTag property'));
	
				return _promise2.default.resolve().then(function () {
					// Remove the track from the Set.
					_this4._tracks.delete(track);
	
					// Hack: Create a new stream with track.streamReactTag as id.
					var stream = new MediaStream(track.streamReactTag);
	
					// Add the track to the stream.
					stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					_this4._pc.addStream(stream);
	
					return _this4._pc.createOffer();
				}).then(function (offer) {
					logger.debug('removeProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this4._pc.setLocalDescription(offer);
				}).catch(function (error) {
					// NOTE: If there are no sending tracks, setLocalDescription() will fail with
					// "Failed to create channels". If so, ignore it.
					if (_this4._tracks.size === 0) {
						logger.warn('removeProducer() | ignoring expected error due no sending tracks: %s', error.toString());
	
						return;
					}
	
					throw error;
				}).then(function () {
					if (_this4._pc.signalingState === 'stable') return;
	
					var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
					var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('removeProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					var answerDesc = new RTCSessionDescription(answer);
	
					return _this4._pc.setRemoteDescription(answerDesc);
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this5 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (!track.streamReactTag) return _promise2.default.reject(new Error('no track.streamReactTag property'));
	
				var oldTrack = producer.track;
				var stream = void 0;
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					// Add the new Track to the Set and remove the old one.
					_this5._tracks.add(track);
					_this5._tracks.delete(oldTrack);
	
					// Hack: Create a new stream with track.streamReactTag as id.
					stream = new MediaStream(track.streamReactTag);
	
					// Add the track to the stream and remove the old one.
					stream.addTrack(track);
					stream.removeTrack(oldTrack);
	
					// Add the stream to the PeerConnection.
					_this5._pc.addStream(stream);
	
					return _this5._pc.createOffer();
				}).then(function (offer) {
					// If simulcast is set, mangle the offer.
					if (producer.simulcast) {
						logger.debug('addProducer() | enabling simulcast');
	
						var sdpObject = _sdpTransform2.default.parse(offer.sdp);
	
						sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);
	
						var offerSdp = _sdpTransform2.default.write(sdpObject);
	
						offer = { type: 'offer', sdp: offerSdp };
					}
	
					logger.debug('replaceProducerTrack() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					var offerDesc = new RTCSessionDescription(offer);
	
					return _this5._pc.setLocalDescription(offerDesc);
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this5._pc.localDescription.sdp);
	
					var remoteSdp = _this5._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('replaceProducerTrack() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					var answerDesc = new RTCSessionDescription(answer);
	
					return _this5._pc.setRemoteDescription(answerDesc);
				}).then(function () {
					var rtpParameters = utils.clone(_this5._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for the new track.
					sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					// We need to provide new RTP parameters.
					_this5.safeEmit('@needupdateproducer', producer, rtpParameters);
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					_this5._tracks.delete(track);
					stream.removeTrack(track);
					_this5._pc.addStream(stream);
	
					throw error;
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this6 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					return _this6._pc.createOffer({ iceRestart: true });
				}).then(function (offer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this6._pc.setLocalDescription(offer);
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this6._pc.localDescription.sdp);
					var remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					var answerDesc = new RTCSessionDescription(answer);
	
					return _this6._pc.setRemoteDescription(answerDesc);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this7 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var sdp = _this7._pc.localDescription.sdp;
					var sdpObj = _sdpTransform2.default.parse(sdp);
					var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// Provide the remote SDP handler with transport local parameters.
					_this7._remoteSdp.setTransportLocalParameters(transportLocalParameters);
	
					// We need transport remote parameters.
					return _this7.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this7._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this7._transportReady = true;
				});
			}
		}]);
		return SendHandler;
	}(Handler);
	
	var RecvHandler = function (_Handler2) {
		(0, _inherits3.default)(RecvHandler, _Handler2);
	
		function RecvHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, RecvHandler);
	
			// Got transport remote parameters.
			// @type {Boolean}
			var _this8 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));
	
			_this8._transportCreated = false;
	
			// Got transport local parameters.
			// @type {Boolean}
			_this8._transportUpdated = false;
	
			// Seen media kinds.
			// @type {Set<String>}
			_this8._kinds = new _set2.default();
	
			// Map of Consumers information indexed by consumer.id.
			// - kind {String}
			// - trackId {String}
			// - ssrc {Number}
			// - rtxSsrc {Number}
			// - cname {String}
			// @type {Map<Number, Object>}
			_this8._consumerInfos = new _map2.default();
			return _this8;
		}
	
		(0, _createClass3.default)(RecvHandler, [{
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this9 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				var encoding = consumer.rtpParameters.encodings[0];
				var cname = consumer.rtpParameters.rtcp.cname;
				var consumerInfo = {
					kind: consumer.kind,
					streamId: 'recv-stream-' + consumer.id,
					trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
					ssrc: encoding.ssrc,
					cname: cname
				};
	
				if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;
	
				this._consumerInfos.set(consumer.id, consumerInfo);
				this._kinds.add(consumer.kind);
	
				return _promise2.default.resolve().then(function () {
					if (!_this9._transportCreated) return _this9._setupTransport();
				}).then(function () {
					var remoteSdp = _this9._remoteSdp.createOfferSdp((0, _from2.default)(_this9._kinds), (0, _from2.default)(_this9._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('addConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					var offerDesc = new RTCSessionDescription(offer);
	
					return _this9._pc.setRemoteDescription(offerDesc);
				}).then(function () {
					return _this9._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('addConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this9._pc.setLocalDescription(answer);
				}).then(function () {
					if (!_this9._transportUpdated) return _this9._updateTransport();
				}).then(function () {
					var stream = _this9._pc.getRemoteStreams().find(function (s) {
						return s.id === consumerInfo.streamId;
					});
					var track = stream.getTrackById(consumerInfo.trackId);
	
					// Hack: Add a streamReactTag property with the reactTag of the MediaStream
					// generated by react-native-webrtc (this is needed because react-native-webrtc
					// assumes that we're gonna use the streams generated by it).
					track.streamReactTag = stream.reactTag;
	
					if (!track) throw new Error('remote track not found');
	
					return track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this10 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (!this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer not found'));
	
				this._consumerInfos.delete(consumer.id);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this10._remoteSdp.createOfferSdp((0, _from2.default)(_this10._kinds), (0, _from2.default)(_this10._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('removeConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					var offerDesc = new RTCSessionDescription(offer);
	
					return _this10._pc.setRemoteDescription(offerDesc);
				}).then(function () {
					return _this10._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('removeConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this10._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this11 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this11._remoteSdp.createOfferSdp((0, _from2.default)(_this11._kinds), (0, _from2.default)(_this11._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					var offerDesc = new RTCSessionDescription(offer);
	
					return _this11._pc.setRemoteDescription(offerDesc);
				}).then(function () {
					return _this11._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this11._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this12 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// We need transport remote parameters.
					return _this12.safeEmitAsPromise('@needcreatetransport', null);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this12._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this12._transportCreated = true;
				});
			}
		}, {
			key: '_updateTransport',
			value: function _updateTransport() {
				logger.debug('_updateTransport()');
	
				// Get our local DTLS parameters.
				// const transportLocalParameters = {};
				var sdp = this._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
				var transportLocalParameters = { dtlsParameters: dtlsParameters };
	
				// We need to provide transport local parameters.
				this.safeEmit('@needupdatetransport', transportLocalParameters);
	
				this._transportUpdated = true;
			}
		}]);
		return RecvHandler;
	}(Handler);
	
	var ReactNative = function () {
		(0, _createClass3.default)(ReactNative, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				var pc = new RTCPeerConnection({
					iceServers: [],
					iceTransportPolicy: 'all',
					bundlePolicy: 'max-bundle',
					rtcpMuxPolicy: 'require'
				});
	
				return pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true
				}).then(function (offer) {
					try {
						pc.close();
					} catch (error) {}
	
					var sdpObj = _sdpTransform2.default.parse(offer.sdp);
					var nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);
	
					return nativeRtpCapabilities;
				}).catch(function (error) {
					try {
						pc.close();
					} catch (error2) {}
	
					throw error;
				});
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'ReactNative';
			}
		}]);
	
		function ReactNative(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, ReactNative);
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			var rtpParametersByKind = void 0;
	
			switch (direction) {
				case 'send':
					{
						rtpParametersByKind = {
							audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new SendHandler(rtpParametersByKind, settings);
					}
				case 'recv':
					{
						rtpParametersByKind = {
							audio: ortc.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new RecvHandler(rtpParametersByKind, settings);
					}
			}
		}
	
		return ReactNative;
	}();
	
	exports.default = ReactNative;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./sdp/RemotePlanBSdp":27,"./sdp/commonUtils":29,"./sdp/planBUtils":30,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/core-js/set":48,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],25:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');
	
	var _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _ortc = require('../ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _commonUtils = require('./sdp/commonUtils');
	
	var sdpCommonUtils = _interopRequireWildcard(_commonUtils);
	
	var _planBUtils = require('./sdp/planBUtils');
	
	var sdpPlanBUtils = _interopRequireWildcard(_planBUtils);
	
	var _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');
	
	var _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('Safari11');
	
	var Handler = function (_EnhancedEventEmitter) {
		(0, _inherits3.default)(Handler, _EnhancedEventEmitter);
	
		function Handler(direction, rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, Handler);
	
			// RTCPeerConnection instance.
			// @type {RTCPeerConnection}
			var _this = (0, _possibleConstructorReturn3.default)(this, (Handler.__proto__ || (0, _getPrototypeOf2.default)(Handler)).call(this, logger));
	
			_this._pc = new RTCPeerConnection({
				iceServers: settings.turnServers || [],
				iceTransportPolicy: 'all',
				bundlePolicy: 'max-bundle',
				rtcpMuxPolicy: 'require'
			});
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			_this._rtpParametersByKind = rtpParametersByKind;
	
			// Remote SDP handler.
			// @type {RemotePlanBSdp}
			_this._remoteSdp = new _RemotePlanBSdp2.default(direction, rtpParametersByKind);
	
			// Handle RTCPeerConnection connection status.
			_this._pc.addEventListener('iceconnectionstatechange', function () {
				switch (_this._pc.iceConnectionState) {
					case 'checking':
						_this.emit('@connectionstatechange', 'connecting');
						break;
					case 'connected':
					case 'completed':
						_this.emit('@connectionstatechange', 'connected');
						break;
					case 'failed':
						_this.emit('@connectionstatechange', 'failed');
						break;
					case 'disconnected':
						_this.emit('@connectionstatechange', 'disconnected');
						break;
					case 'closed':
						_this.emit('@connectionstatechange', 'closed');
						break;
				}
			});
			return _this;
		}
	
		(0, _createClass3.default)(Handler, [{
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				// Close RTCPeerConnection.
				try {
					this._pc.close();
				} catch (error) {}
			}
		}]);
		return Handler;
	}(_EnhancedEventEmitter3.default);
	
	var SendHandler = function (_Handler) {
		(0, _inherits3.default)(SendHandler, _Handler);
	
		function SendHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, SendHandler);
	
			// Got transport local and remote parameters.
			// @type {Boolean}
			var _this2 = (0, _possibleConstructorReturn3.default)(this, (SendHandler.__proto__ || (0, _getPrototypeOf2.default)(SendHandler)).call(this, 'send', rtpParametersByKind, settings));
	
			_this2._transportReady = false;
	
			// Local stream.
			// @type {MediaStream}
			_this2._stream = new MediaStream();
			return _this2;
		}
	
		(0, _createClass3.default)(SendHandler, [{
			key: 'addProducer',
			value: function addProducer(producer) {
				var _this3 = this;
	
				var track = producer.track;
	
	
				logger.debug('addProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				if (this._stream.getTrackById(track.id)) return _promise2.default.reject(new Error('track already added'));
	
				var rtpSender = void 0;
				var localSdpObj = void 0;
	
				return _promise2.default.resolve().then(function () {
					_this3._stream.addTrack(track);
	
					// Add the stream to the PeerConnection.
					rtpSender = _this3._pc.addTrack(track, _this3._stream);
	
					return _this3._pc.createOffer();
				}).then(function (offer) {
					logger.debug('addProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this3._pc.setLocalDescription(offer);
				}).then(function () {
					if (!_this3._transportReady) return _this3._setupTransport();
				}).then(function () {
					localSdpObj = _sdpTransform2.default.parse(_this3._pc.localDescription.sdp);
	
					var remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('addProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this3._pc.setRemoteDescription(answer);
				}).then(function () {
					var rtpParameters = utils.clone(_this3._rtpParametersByKind[producer.kind]);
	
					// Fill the RTP parameters for this track.
					sdpPlanBUtils.fillRtpParametersForTrack(rtpParameters, localSdpObj, track);
	
					return rtpParameters;
				}).catch(function (error) {
					// Panic here. Try to undo things.
	
					try {
						_this3._pc.removeTrack(rtpSender);
					} catch (error2) {}
	
					_this3._stream.removeTrack(track);
	
					throw error;
				});
			}
		}, {
			key: 'removeProducer',
			value: function removeProducer(producer) {
				var _this4 = this;
	
				var track = producer.track;
	
	
				logger.debug('removeProducer() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this4._pc.getSenders().find(function (s) {
						return s.track === track;
					});
	
					if (!rtpSender) throw new Error('RTCRtpSender found');
	
					// Remove the associated RtpSender.
					_this4._pc.removeTrack(rtpSender);
	
					// Remove the track from the local stream.
					_this4._stream.removeTrack(track);
	
					return _this4._pc.createOffer();
				}).then(function (offer) {
					logger.debug('removeProducer() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this4._pc.setLocalDescription(offer);
				}).catch(function (error) {
					// NOTE: If there are no sending tracks, setLocalDescription() will fail with
					// "Failed to create channels". If so, ignore it.
					if (_this4._stream.getTracks().length === 0) {
						logger.warn('removeLocalTrack() | ignoring expected error due no sending tracks: %s', error.toString());
	
						return;
					}
	
					throw error;
				}).then(function () {
					if (_this4._pc.signalingState === 'stable') return;
	
					var localSdpObj = _sdpTransform2.default.parse(_this4._pc.localDescription.sdp);
					var remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('removeProducer() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this4._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: 'replaceProducerTrack',
			value: function replaceProducerTrack(producer, track) {
				var _this5 = this;
	
				logger.debug('replaceProducerTrack() [id:%s, kind:%s, trackId:%s]', producer.id, producer.kind, track.id);
	
				var oldTrack = producer.track;
	
				return _promise2.default.resolve().then(function () {
					// Get the associated RTCRtpSender.
					var rtpSender = _this5._pc.getSenders().find(function (s) {
						return s.track === oldTrack;
					});
	
					if (!rtpSender) throw new Error('local track not found');
	
					return rtpSender.replaceTrack(track);
				}).then(function () {
					// Remove the old track from the local stream.
					_this5._stream.removeTrack(oldTrack);
	
					// Add the new track to the local stream.
					_this5._stream.addTrack(track);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this6 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					return _this6._pc.createOffer({ iceRestart: true });
				}).then(function (offer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [offer:%o]', offer);
	
					return _this6._pc.setLocalDescription(offer);
				}).then(function () {
					var localSdpObj = _sdpTransform2.default.parse(_this6._pc.localDescription.sdp);
					var remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
					var answer = { type: 'answer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [answer:%o]', answer);
	
					return _this6._pc.setRemoteDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this7 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// Get our local DTLS parameters.
					var transportLocalParameters = {};
					var sdp = _this7._pc.localDescription.sdp;
					var sdpObj = _sdpTransform2.default.parse(sdp);
					var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
	
					// Let's decide that we'll be DTLS server (because we can).
					dtlsParameters.role = 'server';
	
					transportLocalParameters.dtlsParameters = dtlsParameters;
	
					// Provide the remote SDP handler with transport local parameters.
					_this7._remoteSdp.setTransportLocalParameters(transportLocalParameters);
	
					// We need transport remote parameters.
					return _this7.safeEmitAsPromise('@needcreatetransport', transportLocalParameters);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this7._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this7._transportReady = true;
				});
			}
		}]);
		return SendHandler;
	}(Handler);
	
	var RecvHandler = function (_Handler2) {
		(0, _inherits3.default)(RecvHandler, _Handler2);
	
		function RecvHandler(rtpParametersByKind, settings) {
			(0, _classCallCheck3.default)(this, RecvHandler);
	
			// Got transport remote parameters.
			// @type {Boolean}
			var _this8 = (0, _possibleConstructorReturn3.default)(this, (RecvHandler.__proto__ || (0, _getPrototypeOf2.default)(RecvHandler)).call(this, 'recv', rtpParametersByKind, settings));
	
			_this8._transportCreated = false;
	
			// Got transport local parameters.
			// @type {Boolean}
			_this8._transportUpdated = false;
	
			// Seen media kinds.
			// @type {Set<String>}
			_this8._kinds = new _set2.default();
	
			// Map of Consumers information indexed by consumer.id.
			// - kind {String}
			// - trackId {String}
			// - ssrc {Number}
			// - rtxSsrc {Number}
			// - cname {String}
			// @type {Map<Number, Object>}
			_this8._consumerInfos = new _map2.default();
			return _this8;
		}
	
		(0, _createClass3.default)(RecvHandler, [{
			key: 'addConsumer',
			value: function addConsumer(consumer) {
				var _this9 = this;
	
				logger.debug('addConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer already added'));
	
				var encoding = consumer.rtpParameters.encodings[0];
				var cname = consumer.rtpParameters.rtcp.cname;
				var consumerInfo = {
					kind: consumer.kind,
					streamId: 'recv-stream-' + consumer.id,
					trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
					ssrc: encoding.ssrc,
					cname: cname
				};
	
				if (encoding.rtx && encoding.rtx.ssrc) consumerInfo.rtxSsrc = encoding.rtx.ssrc;
	
				this._consumerInfos.set(consumer.id, consumerInfo);
				this._kinds.add(consumer.kind);
	
				return _promise2.default.resolve().then(function () {
					if (!_this9._transportCreated) return _this9._setupTransport();
				}).then(function () {
					var remoteSdp = _this9._remoteSdp.createOfferSdp((0, _from2.default)(_this9._kinds), (0, _from2.default)(_this9._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('addConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this9._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this9._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('addConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this9._pc.setLocalDescription(answer);
				}).then(function () {
					if (!_this9._transportUpdated) return _this9._updateTransport();
				}).then(function () {
					var newRtpReceiver = _this9._pc.getReceivers().find(function (rtpReceiver) {
						var track = rtpReceiver.track;
	
	
						if (!track) return false;
	
						return track.id === consumerInfo.trackId;
					});
	
					if (!newRtpReceiver) throw new Error('remote track not found');
	
					return newRtpReceiver.track;
				});
			}
		}, {
			key: 'removeConsumer',
			value: function removeConsumer(consumer) {
				var _this10 = this;
	
				logger.debug('removeConsumer() [id:%s, kind:%s]', consumer.id, consumer.kind);
	
				if (!this._consumerInfos.has(consumer.id)) return _promise2.default.reject(new Error('Consumer not found'));
	
				this._consumerInfos.delete(consumer.id);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this10._remoteSdp.createOfferSdp((0, _from2.default)(_this10._kinds), (0, _from2.default)(_this10._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('removeConsumer() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this10._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this10._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('removeConsumer() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this10._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: 'restartIce',
			value: function restartIce(remoteIceParameters) {
				var _this11 = this;
	
				logger.debug('restartIce()');
	
				// Provide the remote SDP handler with new remote ICE parameters.
				this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);
	
				return _promise2.default.resolve().then(function () {
					var remoteSdp = _this11._remoteSdp.createOfferSdp((0, _from2.default)(_this11._kinds), (0, _from2.default)(_this11._consumerInfos.values()));
					var offer = { type: 'offer', sdp: remoteSdp };
	
					logger.debug('restartIce() | calling pc.setRemoteDescription() [offer:%o]', offer);
	
					return _this11._pc.setRemoteDescription(offer);
				}).then(function () {
					return _this11._pc.createAnswer();
				}).then(function (answer) {
					logger.debug('restartIce() | calling pc.setLocalDescription() [answer:%o]', answer);
	
					return _this11._pc.setLocalDescription(answer);
				});
			}
		}, {
			key: '_setupTransport',
			value: function _setupTransport() {
				var _this12 = this;
	
				logger.debug('_setupTransport()');
	
				return _promise2.default.resolve().then(function () {
					// We need transport remote parameters.
					return _this12.safeEmitAsPromise('@needcreatetransport', null);
				}).then(function (transportRemoteParameters) {
					// Provide the remote SDP handler with transport remote parameters.
					_this12._remoteSdp.setTransportRemoteParameters(transportRemoteParameters);
	
					_this12._transportCreated = true;
				});
			}
		}, {
			key: '_updateTransport',
			value: function _updateTransport() {
				logger.debug('_updateTransport()');
	
				// Get our local DTLS parameters.
				// const transportLocalParameters = {};
				var sdp = this._pc.localDescription.sdp;
				var sdpObj = _sdpTransform2.default.parse(sdp);
				var dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
				var transportLocalParameters = { dtlsParameters: dtlsParameters };
	
				// We need to provide transport local parameters.
				this.safeEmit('@needupdatetransport', transportLocalParameters);
	
				this._transportUpdated = true;
			}
		}]);
		return RecvHandler;
	}(Handler);
	
	var Safari11 = function () {
		(0, _createClass3.default)(Safari11, null, [{
			key: 'getNativeRtpCapabilities',
			value: function getNativeRtpCapabilities() {
				logger.debug('getNativeRtpCapabilities()');
	
				var pc = new RTCPeerConnection({
					iceServers: [],
					iceTransportPolicy: 'all',
					bundlePolicy: 'max-bundle',
					rtcpMuxPolicy: 'require'
				});
	
				pc.addTransceiver('audio');
				pc.addTransceiver('video');
	
				return pc.createOffer().then(function (offer) {
					try {
						pc.close();
					} catch (error) {}
	
					var sdpObj = _sdpTransform2.default.parse(offer.sdp);
					var nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(sdpObj);
	
					return nativeRtpCapabilities;
				}).catch(function (error) {
					try {
						pc.close();
					} catch (error2) {}
	
					throw error;
				});
			}
		}, {
			key: 'tag',
			get: function get() {
				return 'Safari11';
			}
		}]);
	
		function Safari11(direction, extendedRtpCapabilities, settings) {
			(0, _classCallCheck3.default)(this, Safari11);
	
			logger.debug('constructor() [direction:%s, extendedRtpCapabilities:%o]', direction, extendedRtpCapabilities);
	
			var rtpParametersByKind = void 0;
	
			switch (direction) {
				case 'send':
					{
						rtpParametersByKind = {
							audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new SendHandler(rtpParametersByKind, settings);
					}
				case 'recv':
					{
						rtpParametersByKind = {
							audio: ortc.getReceivingFullRtpParameters('audio', extendedRtpCapabilities),
							video: ortc.getReceivingFullRtpParameters('video', extendedRtpCapabilities)
						};
	
						return new RecvHandler(rtpParametersByKind, settings);
					}
			}
		}
	
		return Safari11;
	}();
	
	exports.default = Safari11;
	
	},{"../EnhancedEventEmitter":12,"../Logger":13,"../ortc":33,"../utils":34,"./sdp/RemotePlanBSdp":27,"./sdp/commonUtils":29,"./sdp/planBUtils":30,"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/map":39,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/promise":47,"babel-runtime/core-js/set":48,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],26:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	exports.getCapabilities = getCapabilities;
	exports.mangleRtpParameters = mangleRtpParameters;
	
	var _utils = require('../../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Normalize Edge's RTCRtpReceiver.getCapabilities() to produce a full
	 * compliant ORTC RTCRtpCapabilities.
	 *
	 * @return {RTCRtpCapabilities}
	 */
	function getCapabilities() {
		var nativeCaps = RTCRtpReceiver.getCapabilities();
		var caps = utils.clone(nativeCaps);
	
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _getIterator3.default)(caps.codecs), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var codec = _step.value;
	
				// Rename numChannels to channels.
				codec.channels = codec.numChannels;
				delete codec.numChannels;
	
				// Normalize channels.
				if (codec.kind !== 'audio') delete codec.channels;else if (!codec.channels) codec.channels = 1;
	
				// Add mimeType.
				codec.mimeType = codec.kind + '/' + codec.name;
	
				// NOTE: Edge sets some numeric parameters as String rather than Number. Fix them.
				if (codec.parameters) {
					var parameters = codec.parameters;
	
					if (parameters.apt) parameters.apt = Number(parameters.apt);
	
					if (parameters['packetization-mode']) parameters['packetization-mode'] = Number(parameters['packetization-mode']);
				}
	
				// Delete emty parameter String in rtcpFeedback.
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _getIterator3.default)(codec.rtcpFeedback || []), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var feedback = _step2.value;
	
						if (!feedback.parameter) delete feedback.parameter;
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		return caps;
	}
	
	/**
	 * Generate RTCRtpParameters as Edge like them.
	 *
	 * @param  {RTCRtpParameters} rtpParameters
	 * @return {RTCRtpParameters}
	 */
	/* global RTCRtpReceiver */
	
	function mangleRtpParameters(rtpParameters) {
		var params = utils.clone(rtpParameters);
	
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;
	
		try {
			for (var _iterator3 = (0, _getIterator3.default)(params.codecs), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var codec = _step3.value;
	
				// Rename channels to numChannels.
				if (codec.channels) {
					codec.numChannels = codec.channels;
					delete codec.channels;
				}
	
				// Remove mimeType.
				delete codec.mimeType;
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}
	
		return params;
	}
	
	},{"../../utils":34,"babel-runtime/core-js/get-iterator":36}],27:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _keys = require('babel-runtime/core-js/object/keys');
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _utils = require('../../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('RemotePlanBSdp');
	
	var RemoteSdp = function () {
		function RemoteSdp(rtpParametersByKind) {
			(0, _classCallCheck3.default)(this, RemoteSdp);
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			this._rtpParametersByKind = rtpParametersByKind;
	
			// Transport local parameters, including DTLS parameteres.
			// @type {Object}
			this._transportLocalParameters = null;
	
			// Transport remote parameters, including ICE parameters, ICE candidates
			// and DTLS parameteres.
			// @type {Object}
			this._transportRemoteParameters = null;
	
			// SDP global fields.
			// @type {Object}
			this._sdpGlobalFields = {
				id: utils.randomNumber(),
				version: 0
			};
		}
	
		(0, _createClass3.default)(RemoteSdp, [{
			key: 'setTransportLocalParameters',
			value: function setTransportLocalParameters(transportLocalParameters) {
				logger.debug('setTransportLocalParameters() [transportLocalParameters:%o]', transportLocalParameters);
	
				this._transportLocalParameters = transportLocalParameters;
			}
		}, {
			key: 'setTransportRemoteParameters',
			value: function setTransportRemoteParameters(transportRemoteParameters) {
				logger.debug('setTransportRemoteParameters() [transportRemoteParameters:%o]', transportRemoteParameters);
	
				this._transportRemoteParameters = transportRemoteParameters;
			}
		}, {
			key: 'updateTransportRemoteIceParameters',
			value: function updateTransportRemoteIceParameters(remoteIceParameters) {
				logger.debug('updateTransportRemoteIceParameters() [remoteIceParameters:%o]', remoteIceParameters);
	
				this._transportRemoteParameters.iceParameters = remoteIceParameters;
			}
		}]);
		return RemoteSdp;
	}();
	
	var SendRemoteSdp = function (_RemoteSdp) {
		(0, _inherits3.default)(SendRemoteSdp, _RemoteSdp);
	
		function SendRemoteSdp(rtpParametersByKind) {
			(0, _classCallCheck3.default)(this, SendRemoteSdp);
			return (0, _possibleConstructorReturn3.default)(this, (SendRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(SendRemoteSdp)).call(this, rtpParametersByKind));
		}
	
		(0, _createClass3.default)(SendRemoteSdp, [{
			key: 'createAnswerSdp',
			value: function createAnswerSdp(localSdpObj) {
				logger.debug('createAnswerSdp()');
	
				if (!this._transportLocalParameters) throw new Error('no transport local parameters');else if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');
	
				var remoteIceParameters = this._transportRemoteParameters.iceParameters;
				var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
				var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
				var sdpObj = {};
				var mids = (localSdpObj.media || []).map(function (m) {
					return m.mid;
				});
	
				// Increase our SDP version.
				this._sdpGlobalFields.version++;
	
				sdpObj.version = 0;
				sdpObj.origin = {
					address: '0.0.0.0',
					ipVer: 4,
					netType: 'IN',
					sessionId: this._sdpGlobalFields.id,
					sessionVersion: this._sdpGlobalFields.version,
					username: 'mediasoup-client'
				};
				sdpObj.name = '-';
				sdpObj.timing = { start: 0, stop: 0 };
				sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
				sdpObj.msidSemantic = {
					semantic: 'WMS',
					token: '*'
				};
				sdpObj.groups = [{
					type: 'BUNDLE',
					mids: mids.join(' ')
				}];
				sdpObj.media = [];
	
				// NOTE: We take the latest fingerprint.
				var numFingerprints = remoteDtlsParameters.fingerprints.length;
	
				sdpObj.fingerprint = {
					type: remoteDtlsParameters.fingerprints[numFingerprints - 1].algorithm,
					hash: remoteDtlsParameters.fingerprints[numFingerprints - 1].value
				};
	
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _getIterator3.default)(localSdpObj.media || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var localMediaObj = _step.value;
	
						var kind = localMediaObj.type;
						var codecs = this._rtpParametersByKind[kind].codecs;
						var headerExtensions = this._rtpParametersByKind[kind].headerExtensions;
						var remoteMediaObj = {};
	
						remoteMediaObj.type = localMediaObj.type;
						remoteMediaObj.port = 7;
						remoteMediaObj.protocol = 'RTP/SAVPF';
						remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
						remoteMediaObj.mid = localMediaObj.mid;
	
						remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
						remoteMediaObj.icePwd = remoteIceParameters.password;
						remoteMediaObj.candidates = [];
	
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;
	
						try {
							for (var _iterator2 = (0, _getIterator3.default)(remoteIceCandidates), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var candidate = _step2.value;
	
								var candidateObj = {};
	
								// mediasoup does not support non rtcp-mux so candidates component is
								// always RTP (1).
								candidateObj.component = 1;
								candidateObj.foundation = candidate.foundation;
								candidateObj.ip = candidate.ip;
								candidateObj.port = candidate.port;
								candidateObj.priority = candidate.priority;
								candidateObj.transport = candidate.protocol;
								candidateObj.type = candidate.type;
								if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;
	
								remoteMediaObj.candidates.push(candidateObj);
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}
	
						remoteMediaObj.endOfCandidates = 'end-of-candidates';
	
						// Announce support for ICE renomination.
						// https://tools.ietf.org/html/draft-thatcher-ice-renomination
						remoteMediaObj.iceOptions = 'renomination';
	
						switch (remoteDtlsParameters.role) {
							case 'client':
								remoteMediaObj.setup = 'active';
								break;
							case 'server':
								remoteMediaObj.setup = 'passive';
								break;
						}
	
						switch (localMediaObj.direction) {
							case 'sendrecv':
							case 'sendonly':
								remoteMediaObj.direction = 'recvonly';
								break;
							case 'recvonly':
							case 'inactive':
								remoteMediaObj.direction = 'inactive';
								break;
						}
	
						// If video, be ready for simulcast.
						if (kind === 'video') remoteMediaObj.xGoogleFlag = 'conference';
	
						remoteMediaObj.rtp = [];
						remoteMediaObj.rtcpFb = [];
						remoteMediaObj.fmtp = [];
	
						var _iteratorNormalCompletion3 = true;
						var _didIteratorError3 = false;
						var _iteratorError3 = undefined;
	
						try {
							for (var _iterator3 = (0, _getIterator3.default)(codecs), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
								var codec = _step3.value;
	
								var rtp = {
									payload: codec.payloadType,
									codec: codec.name,
									rate: codec.clockRate
								};
	
								if (codec.channels > 1) rtp.encoding = codec.channels;
	
								remoteMediaObj.rtp.push(rtp);
	
								if (codec.parameters) {
									var paramFmtp = {
										payload: codec.payloadType,
										config: ''
									};
	
									var _iteratorNormalCompletion5 = true;
									var _didIteratorError5 = false;
									var _iteratorError5 = undefined;
	
									try {
										for (var _iterator5 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
											var key = _step5.value;
	
											if (paramFmtp.config) paramFmtp.config += ';';
	
											paramFmtp.config += key + '=' + codec.parameters[key];
										}
									} catch (err) {
										_didIteratorError5 = true;
										_iteratorError5 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion5 && _iterator5.return) {
												_iterator5.return();
											}
										} finally {
											if (_didIteratorError5) {
												throw _iteratorError5;
											}
										}
									}
	
									if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
								}
	
								if (codec.rtcpFeedback) {
									var _iteratorNormalCompletion6 = true;
									var _didIteratorError6 = false;
									var _iteratorError6 = undefined;
	
									try {
										for (var _iterator6 = (0, _getIterator3.default)(codec.rtcpFeedback), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
											var fb = _step6.value;
	
											remoteMediaObj.rtcpFb.push({
												payload: codec.payloadType,
												type: fb.type,
												subtype: fb.parameter || ''
											});
										}
									} catch (err) {
										_didIteratorError6 = true;
										_iteratorError6 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion6 && _iterator6.return) {
												_iterator6.return();
											}
										} finally {
											if (_didIteratorError6) {
												throw _iteratorError6;
											}
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError3 = true;
							_iteratorError3 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion3 && _iterator3.return) {
									_iterator3.return();
								}
							} finally {
								if (_didIteratorError3) {
									throw _iteratorError3;
								}
							}
						}
	
						remoteMediaObj.payloads = codecs.map(function (codec) {
							return codec.payloadType;
						}).join(' ');
	
						remoteMediaObj.ext = [];
	
						var _iteratorNormalCompletion4 = true;
						var _didIteratorError4 = false;
						var _iteratorError4 = undefined;
	
						try {
							var _loop = function _loop() {
								var ext = _step4.value;
	
								// Don't add a header extension if not present in the offer.
								var matchedLocalExt = (localMediaObj.ext || []).find(function (localExt) {
									return localExt.uri === ext.uri;
								});
	
								if (!matchedLocalExt) return 'continue';
	
								remoteMediaObj.ext.push({
									uri: ext.uri,
									value: ext.id
								});
							};
	
							for (var _iterator4 = (0, _getIterator3.default)(headerExtensions), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
								var _ret = _loop();
	
								if (_ret === 'continue') continue;
							}
						} catch (err) {
							_didIteratorError4 = true;
							_iteratorError4 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion4 && _iterator4.return) {
									_iterator4.return();
								}
							} finally {
								if (_didIteratorError4) {
									throw _iteratorError4;
								}
							}
						}
	
						remoteMediaObj.rtcpMux = 'rtcp-mux';
						remoteMediaObj.rtcpRsize = 'rtcp-rsize';
	
						// Push it.
						sdpObj.media.push(remoteMediaObj);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				var sdp = _sdpTransform2.default.write(sdpObj);
	
				return sdp;
			}
		}]);
		return SendRemoteSdp;
	}(RemoteSdp);
	
	var RecvRemoteSdp = function (_RemoteSdp2) {
		(0, _inherits3.default)(RecvRemoteSdp, _RemoteSdp2);
	
		function RecvRemoteSdp(rtpParametersByKind) {
			(0, _classCallCheck3.default)(this, RecvRemoteSdp);
			return (0, _possibleConstructorReturn3.default)(this, (RecvRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(RecvRemoteSdp)).call(this, rtpParametersByKind));
		}
	
		/**
		* @param {Array<String>} kinds - Media kinds.
		* @param {Array<Object>} consumerInfos - Consumer informations.
		* @return {String}
		*/
	
	
		(0, _createClass3.default)(RecvRemoteSdp, [{
			key: 'createOfferSdp',
			value: function createOfferSdp(kinds, consumerInfos) {
				var _this3 = this;
	
				logger.debug('createOfferSdp()');
	
				if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');
	
				var remoteIceParameters = this._transportRemoteParameters.iceParameters;
				var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
				var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
				var sdpObj = {};
				var mids = kinds;
	
				// Increase our SDP version.
				this._sdpGlobalFields.version++;
	
				sdpObj.version = 0;
				sdpObj.origin = {
					address: '0.0.0.0',
					ipVer: 4,
					netType: 'IN',
					sessionId: this._sdpGlobalFields.id,
					sessionVersion: this._sdpGlobalFields.version,
					username: 'mediasoup-client'
				};
				sdpObj.name = '-';
				sdpObj.timing = { start: 0, stop: 0 };
				sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
				sdpObj.msidSemantic = {
					semantic: 'WMS',
					token: '*'
				};
				sdpObj.groups = [{
					type: 'BUNDLE',
					mids: mids.join(' ')
				}];
				sdpObj.media = [];
	
				// NOTE: We take the latest fingerprint.
				var numFingerprints = remoteDtlsParameters.fingerprints.length;
	
				sdpObj.fingerprint = {
					type: remoteDtlsParameters.fingerprints[numFingerprints - 1].algorithm,
					hash: remoteDtlsParameters.fingerprints[numFingerprints - 1].value
				};
	
				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;
	
				try {
					var _loop2 = function _loop2() {
						var kind = _step7.value;
	
						var codecs = _this3._rtpParametersByKind[kind].codecs;
						var headerExtensions = _this3._rtpParametersByKind[kind].headerExtensions;
						var remoteMediaObj = {};
	
						remoteMediaObj.type = kind;
						remoteMediaObj.port = 7;
						remoteMediaObj.protocol = 'RTP/SAVPF';
						remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
						remoteMediaObj.mid = kind;
	
						remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
						remoteMediaObj.icePwd = remoteIceParameters.password;
						remoteMediaObj.candidates = [];
	
						var _iteratorNormalCompletion8 = true;
						var _didIteratorError8 = false;
						var _iteratorError8 = undefined;
	
						try {
							for (var _iterator8 = (0, _getIterator3.default)(remoteIceCandidates), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
								var candidate = _step8.value;
	
								var candidateObj = {};
	
								// mediasoup does not support non rtcp-mux so candidates component is
								// always RTP (1).
								candidateObj.component = 1;
								candidateObj.foundation = candidate.foundation;
								candidateObj.ip = candidate.ip;
								candidateObj.port = candidate.port;
								candidateObj.priority = candidate.priority;
								candidateObj.transport = candidate.protocol;
								candidateObj.type = candidate.type;
								if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;
	
								remoteMediaObj.candidates.push(candidateObj);
							}
						} catch (err) {
							_didIteratorError8 = true;
							_iteratorError8 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion8 && _iterator8.return) {
									_iterator8.return();
								}
							} finally {
								if (_didIteratorError8) {
									throw _iteratorError8;
								}
							}
						}
	
						remoteMediaObj.endOfCandidates = 'end-of-candidates';
	
						// Announce support for ICE renomination.
						// https://tools.ietf.org/html/draft-thatcher-ice-renomination
						remoteMediaObj.iceOptions = 'renomination';
	
						remoteMediaObj.setup = 'actpass';
	
						if (consumerInfos.some(function (info) {
							return info.kind === kind;
						})) remoteMediaObj.direction = 'sendonly';else remoteMediaObj.direction = 'inactive';
	
						remoteMediaObj.rtp = [];
						remoteMediaObj.rtcpFb = [];
						remoteMediaObj.fmtp = [];
	
						var _iteratorNormalCompletion9 = true;
						var _didIteratorError9 = false;
						var _iteratorError9 = undefined;
	
						try {
							for (var _iterator9 = (0, _getIterator3.default)(codecs), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
								var codec = _step9.value;
	
								var rtp = {
									payload: codec.payloadType,
									codec: codec.name,
									rate: codec.clockRate
								};
	
								if (codec.channels > 1) rtp.encoding = codec.channels;
	
								remoteMediaObj.rtp.push(rtp);
	
								if (codec.parameters) {
									var paramFmtp = {
										payload: codec.payloadType,
										config: ''
									};
	
									var _iteratorNormalCompletion12 = true;
									var _didIteratorError12 = false;
									var _iteratorError12 = undefined;
	
									try {
										for (var _iterator12 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
											var key = _step12.value;
	
											if (paramFmtp.config) paramFmtp.config += ';';
	
											paramFmtp.config += key + '=' + codec.parameters[key];
										}
									} catch (err) {
										_didIteratorError12 = true;
										_iteratorError12 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion12 && _iterator12.return) {
												_iterator12.return();
											}
										} finally {
											if (_didIteratorError12) {
												throw _iteratorError12;
											}
										}
									}
	
									if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
								}
	
								if (codec.rtcpFeedback) {
									var _iteratorNormalCompletion13 = true;
									var _didIteratorError13 = false;
									var _iteratorError13 = undefined;
	
									try {
										for (var _iterator13 = (0, _getIterator3.default)(codec.rtcpFeedback), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
											var fb = _step13.value;
	
											remoteMediaObj.rtcpFb.push({
												payload: codec.payloadType,
												type: fb.type,
												subtype: fb.parameter || ''
											});
										}
									} catch (err) {
										_didIteratorError13 = true;
										_iteratorError13 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion13 && _iterator13.return) {
												_iterator13.return();
											}
										} finally {
											if (_didIteratorError13) {
												throw _iteratorError13;
											}
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError9 = true;
							_iteratorError9 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion9 && _iterator9.return) {
									_iterator9.return();
								}
							} finally {
								if (_didIteratorError9) {
									throw _iteratorError9;
								}
							}
						}
	
						remoteMediaObj.payloads = codecs.map(function (codec) {
							return codec.payloadType;
						}).join(' ');
	
						remoteMediaObj.ext = [];
	
						var _iteratorNormalCompletion10 = true;
						var _didIteratorError10 = false;
						var _iteratorError10 = undefined;
	
						try {
							for (var _iterator10 = (0, _getIterator3.default)(headerExtensions), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
								var _ext = _step10.value;
	
								remoteMediaObj.ext.push({
									uri: _ext.uri,
									value: _ext.id
								});
							}
						} catch (err) {
							_didIteratorError10 = true;
							_iteratorError10 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion10 && _iterator10.return) {
									_iterator10.return();
								}
							} finally {
								if (_didIteratorError10) {
									throw _iteratorError10;
								}
							}
						}
	
						remoteMediaObj.rtcpMux = 'rtcp-mux';
						remoteMediaObj.rtcpRsize = 'rtcp-rsize';
	
						remoteMediaObj.ssrcs = [];
						remoteMediaObj.ssrcGroups = [];
	
						var _iteratorNormalCompletion11 = true;
						var _didIteratorError11 = false;
						var _iteratorError11 = undefined;
	
						try {
							for (var _iterator11 = (0, _getIterator3.default)(consumerInfos), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
								var info = _step11.value;
	
								if (info.kind !== kind) continue;
	
								remoteMediaObj.ssrcs.push({
									id: info.ssrc,
									attribute: 'msid',
									value: info.streamId + ' ' + info.trackId
								});
	
								remoteMediaObj.ssrcs.push({
									id: info.ssrc,
									attribute: 'mslabel',
									value: info.streamId
								});
	
								remoteMediaObj.ssrcs.push({
									id: info.ssrc,
									attribute: 'label',
									value: info.trackId
								});
	
								remoteMediaObj.ssrcs.push({
									id: info.ssrc,
									attribute: 'cname',
									value: info.cname
								});
	
								if (info.rtxSsrc) {
									remoteMediaObj.ssrcs.push({
										id: info.rtxSsrc,
										attribute: 'msid',
										value: info.streamId + ' ' + info.trackId
									});
	
									remoteMediaObj.ssrcs.push({
										id: info.rtxSsrc,
										attribute: 'mslabel',
										value: info.streamId
									});
	
									remoteMediaObj.ssrcs.push({
										id: info.rtxSsrc,
										attribute: 'label',
										value: info.trackId
									});
	
									remoteMediaObj.ssrcs.push({
										id: info.rtxSsrc,
										attribute: 'cname',
										value: info.cname
									});
	
									// Associate original and retransmission SSRC.
									remoteMediaObj.ssrcGroups.push({
										semantics: 'FID',
										ssrcs: info.ssrc + ' ' + info.rtxSsrc
									});
								}
							}
	
							// Push it.
						} catch (err) {
							_didIteratorError11 = true;
							_iteratorError11 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion11 && _iterator11.return) {
									_iterator11.return();
								}
							} finally {
								if (_didIteratorError11) {
									throw _iteratorError11;
								}
							}
						}
	
						sdpObj.media.push(remoteMediaObj);
					};
	
					for (var _iterator7 = (0, _getIterator3.default)(kinds), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						_loop2();
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}
	
				var sdp = _sdpTransform2.default.write(sdpObj);
	
				return sdp;
			}
		}]);
		return RecvRemoteSdp;
	}(RemoteSdp);
	
	var RemotePlanBSdp = function RemotePlanBSdp(direction, rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, RemotePlanBSdp);
	
		logger.debug('constructor() [direction:%s, rtpParametersByKind:%o]', direction, rtpParametersByKind);
	
		switch (direction) {
			case 'send':
				return new SendRemoteSdp(rtpParametersByKind);
			case 'recv':
				return new RecvRemoteSdp(rtpParametersByKind);
		}
	};
	
	exports.default = RemotePlanBSdp;
	
	},{"../../Logger":13,"../../utils":34,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/object/keys":44,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],28:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _keys = require('babel-runtime/core-js/object/keys');
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = require('babel-runtime/helpers/inherits');
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = require('babel-runtime/helpers/createClass');
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	var _Logger = require('../../Logger');
	
	var _Logger2 = _interopRequireDefault(_Logger);
	
	var _utils = require('../../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var logger = new _Logger2.default('RemoteUnifiedPlanSdp');
	
	var RemoteSdp = function () {
		function RemoteSdp(rtpParametersByKind) {
			(0, _classCallCheck3.default)(this, RemoteSdp);
	
			// Generic sending RTP parameters for audio and video.
			// @type {Object}
			this._rtpParametersByKind = rtpParametersByKind;
	
			// Transport local parameters, including DTLS parameteres.
			// @type {Object}
			this._transportLocalParameters = null;
	
			// Transport remote parameters, including ICE parameters, ICE candidates
			// and DTLS parameteres.
			// @type {Object}
			this._transportRemoteParameters = null;
	
			// SDP global fields.
			// @type {Object}
			this._sdpGlobalFields = {
				id: utils.randomNumber(),
				version: 0
			};
		}
	
		(0, _createClass3.default)(RemoteSdp, [{
			key: 'setTransportLocalParameters',
			value: function setTransportLocalParameters(transportLocalParameters) {
				logger.debug('setTransportLocalParameters() [transportLocalParameters:%o]', transportLocalParameters);
	
				this._transportLocalParameters = transportLocalParameters;
			}
		}, {
			key: 'setTransportRemoteParameters',
			value: function setTransportRemoteParameters(transportRemoteParameters) {
				logger.debug('setTransportRemoteParameters() [transportRemoteParameters:%o]', transportRemoteParameters);
	
				this._transportRemoteParameters = transportRemoteParameters;
			}
		}, {
			key: 'updateTransportRemoteIceParameters',
			value: function updateTransportRemoteIceParameters(remoteIceParameters) {
				logger.debug('updateTransportRemoteIceParameters() [remoteIceParameters:%o]', remoteIceParameters);
	
				this._transportRemoteParameters.iceParameters = remoteIceParameters;
			}
		}]);
		return RemoteSdp;
	}();
	
	var SendRemoteSdp = function (_RemoteSdp) {
		(0, _inherits3.default)(SendRemoteSdp, _RemoteSdp);
	
		function SendRemoteSdp(rtpParametersByKind) {
			(0, _classCallCheck3.default)(this, SendRemoteSdp);
			return (0, _possibleConstructorReturn3.default)(this, (SendRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(SendRemoteSdp)).call(this, rtpParametersByKind));
		}
	
		(0, _createClass3.default)(SendRemoteSdp, [{
			key: 'createAnswerSdp',
			value: function createAnswerSdp(localSdpObj) {
				logger.debug('createAnswerSdp()');
	
				if (!this._transportLocalParameters) throw new Error('no transport local parameters');else if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');
	
				var remoteIceParameters = this._transportRemoteParameters.iceParameters;
				var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
				var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
				var sdpObj = {};
				var mids = (localSdpObj.media || []).filter(function (m) {
					return m.mid;
				}).map(function (m) {
					return m.mid;
				});
	
				// Increase our SDP version.
				this._sdpGlobalFields.version++;
	
				sdpObj.version = 0;
				sdpObj.origin = {
					address: '0.0.0.0',
					ipVer: 4,
					netType: 'IN',
					sessionId: this._sdpGlobalFields.id,
					sessionVersion: this._sdpGlobalFields.version,
					username: 'mediasoup-client'
				};
				sdpObj.name = '-';
				sdpObj.timing = { start: 0, stop: 0 };
				sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
				sdpObj.msidSemantic = {
					semantic: 'WMS',
					token: '*'
				};
	
				if (mids.length > 0) {
					sdpObj.groups = [{
						type: 'BUNDLE',
						mids: mids.join(' ')
					}];
				}
	
				sdpObj.media = [];
	
				// NOTE: We take the latest fingerprint.
				var numFingerprints = remoteDtlsParameters.fingerprints.length;
	
				sdpObj.fingerprint = {
					type: remoteDtlsParameters.fingerprints[numFingerprints - 1].algorithm,
					hash: remoteDtlsParameters.fingerprints[numFingerprints - 1].value
				};
	
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _getIterator3.default)(localSdpObj.media || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var localMediaObj = _step.value;
	
						var closed = localMediaObj.direction === 'inactive';
						var kind = localMediaObj.type;
						var codecs = this._rtpParametersByKind[kind].codecs;
						var headerExtensions = this._rtpParametersByKind[kind].headerExtensions;
						var remoteMediaObj = {};
	
						remoteMediaObj.type = localMediaObj.type;
						remoteMediaObj.port = 7;
						remoteMediaObj.protocol = 'RTP/SAVPF';
						remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
						remoteMediaObj.mid = localMediaObj.mid;
	
						remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
						remoteMediaObj.icePwd = remoteIceParameters.password;
						remoteMediaObj.candidates = [];
	
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;
	
						try {
							for (var _iterator2 = (0, _getIterator3.default)(remoteIceCandidates), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var candidate = _step2.value;
	
								var candidateObj = {};
	
								// mediasoup does not support non rtcp-mux so candidates component is
								// always RTP (1).
								candidateObj.component = 1;
								candidateObj.foundation = candidate.foundation;
								candidateObj.ip = candidate.ip;
								candidateObj.port = candidate.port;
								candidateObj.priority = candidate.priority;
								candidateObj.transport = candidate.protocol;
								candidateObj.type = candidate.type;
								if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;
	
								remoteMediaObj.candidates.push(candidateObj);
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}
	
						remoteMediaObj.endOfCandidates = 'end-of-candidates';
	
						// Announce support for ICE renomination.
						// https://tools.ietf.org/html/draft-thatcher-ice-renomination
						remoteMediaObj.iceOptions = 'renomination';
	
						switch (remoteDtlsParameters.role) {
							case 'client':
								remoteMediaObj.setup = 'active';
								break;
							case 'server':
								remoteMediaObj.setup = 'passive';
								break;
						}
	
						switch (localMediaObj.direction) {
							case 'sendrecv':
							case 'sendonly':
								remoteMediaObj.direction = 'recvonly';
								break;
							case 'recvonly':
							case 'inactive':
								remoteMediaObj.direction = 'inactive';
								break;
						}
	
						remoteMediaObj.rtp = [];
						remoteMediaObj.rtcpFb = [];
						remoteMediaObj.fmtp = [];
	
						var _iteratorNormalCompletion3 = true;
						var _didIteratorError3 = false;
						var _iteratorError3 = undefined;
	
						try {
							for (var _iterator3 = (0, _getIterator3.default)(codecs), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
								var codec = _step3.value;
	
								var rtp = {
									payload: codec.payloadType,
									codec: codec.name,
									rate: codec.clockRate
								};
	
								if (codec.channels > 1) rtp.encoding = codec.channels;
	
								remoteMediaObj.rtp.push(rtp);
	
								if (codec.parameters) {
									var paramFmtp = {
										payload: codec.payloadType,
										config: ''
									};
	
									var _iteratorNormalCompletion6 = true;
									var _didIteratorError6 = false;
									var _iteratorError6 = undefined;
	
									try {
										for (var _iterator6 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
											var key = _step6.value;
	
											if (paramFmtp.config) paramFmtp.config += ';';
	
											paramFmtp.config += key + '=' + codec.parameters[key];
										}
									} catch (err) {
										_didIteratorError6 = true;
										_iteratorError6 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion6 && _iterator6.return) {
												_iterator6.return();
											}
										} finally {
											if (_didIteratorError6) {
												throw _iteratorError6;
											}
										}
									}
	
									if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
								}
	
								if (codec.rtcpFeedback) {
									var _iteratorNormalCompletion7 = true;
									var _didIteratorError7 = false;
									var _iteratorError7 = undefined;
	
									try {
										for (var _iterator7 = (0, _getIterator3.default)(codec.rtcpFeedback), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
											var fb = _step7.value;
	
											remoteMediaObj.rtcpFb.push({
												payload: codec.payloadType,
												type: fb.type,
												subtype: fb.parameter || ''
											});
										}
									} catch (err) {
										_didIteratorError7 = true;
										_iteratorError7 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion7 && _iterator7.return) {
												_iterator7.return();
											}
										} finally {
											if (_didIteratorError7) {
												throw _iteratorError7;
											}
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError3 = true;
							_iteratorError3 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion3 && _iterator3.return) {
									_iterator3.return();
								}
							} finally {
								if (_didIteratorError3) {
									throw _iteratorError3;
								}
							}
						}
	
						remoteMediaObj.payloads = codecs.map(function (codec) {
							return codec.payloadType;
						}).join(' ');
	
						// NOTE: Firefox does not like a=extmap lines if a=inactive.
						if (!closed) {
							remoteMediaObj.ext = [];
	
							var _iteratorNormalCompletion4 = true;
							var _didIteratorError4 = false;
							var _iteratorError4 = undefined;
	
							try {
								var _loop = function _loop() {
									var ext = _step4.value;
	
									// Don't add a header extension if not present in the offer.
									var matchedLocalExt = (localMediaObj.ext || []).find(function (localExt) {
										return localExt.uri === ext.uri;
									});
	
									if (!matchedLocalExt) return 'continue';
	
									remoteMediaObj.ext.push({
										uri: ext.uri,
										value: ext.id
									});
								};
	
								for (var _iterator4 = (0, _getIterator3.default)(headerExtensions), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
									var _ret = _loop();
	
									if (_ret === 'continue') continue;
								}
							} catch (err) {
								_didIteratorError4 = true;
								_iteratorError4 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion4 && _iterator4.return) {
										_iterator4.return();
									}
								} finally {
									if (_didIteratorError4) {
										throw _iteratorError4;
									}
								}
							}
						}
	
						// Simulcast.
						if (localMediaObj.simulcast_03) {
							// eslint-disable-next-line camelcase
							remoteMediaObj.simulcast_03 = {
								value: localMediaObj.simulcast_03.value.replace(/send/g, 'recv')
							};
	
							remoteMediaObj.rids = [];
	
							var _iteratorNormalCompletion5 = true;
							var _didIteratorError5 = false;
							var _iteratorError5 = undefined;
	
							try {
								for (var _iterator5 = (0, _getIterator3.default)(localMediaObj.rids || []), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
									var rid = _step5.value;
	
									if (rid.direction !== 'send') continue;
	
									remoteMediaObj.rids.push({
										id: rid.id,
										direction: 'recv'
									});
								}
							} catch (err) {
								_didIteratorError5 = true;
								_iteratorError5 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion5 && _iterator5.return) {
										_iterator5.return();
									}
								} finally {
									if (_didIteratorError5) {
										throw _iteratorError5;
									}
								}
							}
						}
	
						remoteMediaObj.rtcpMux = 'rtcp-mux';
						remoteMediaObj.rtcpRsize = 'rtcp-rsize';
	
						// Push it.
						sdpObj.media.push(remoteMediaObj);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				var sdp = _sdpTransform2.default.write(sdpObj);
	
				return sdp;
			}
		}]);
		return SendRemoteSdp;
	}(RemoteSdp);
	
	var RecvRemoteSdp = function (_RemoteSdp2) {
		(0, _inherits3.default)(RecvRemoteSdp, _RemoteSdp2);
	
		function RecvRemoteSdp(rtpParametersByKind) {
			(0, _classCallCheck3.default)(this, RecvRemoteSdp);
			return (0, _possibleConstructorReturn3.default)(this, (RecvRemoteSdp.__proto__ || (0, _getPrototypeOf2.default)(RecvRemoteSdp)).call(this, rtpParametersByKind));
		}
	
		/**
		* @param {Array<Object>} consumerInfos - Consumer informations.
		* @return {String}
		*/
	
	
		(0, _createClass3.default)(RecvRemoteSdp, [{
			key: 'createOfferSdp',
			value: function createOfferSdp(consumerInfos) {
				logger.debug('createOfferSdp()');
	
				if (!this._transportRemoteParameters) throw new Error('no transport remote parameters');
	
				var remoteIceParameters = this._transportRemoteParameters.iceParameters;
				var remoteIceCandidates = this._transportRemoteParameters.iceCandidates;
				var remoteDtlsParameters = this._transportRemoteParameters.dtlsParameters;
				var sdpObj = {};
				var mids = consumerInfos.map(function (info) {
					return info.mid;
				});
	
				// Increase our SDP version.
				this._sdpGlobalFields.version++;
	
				sdpObj.version = 0;
				sdpObj.origin = {
					address: '0.0.0.0',
					ipVer: 4,
					netType: 'IN',
					sessionId: this._sdpGlobalFields.id,
					sessionVersion: this._sdpGlobalFields.version,
					username: 'mediasoup-client'
				};
				sdpObj.name = '-';
				sdpObj.timing = { start: 0, stop: 0 };
				sdpObj.icelite = remoteIceParameters.iceLite ? 'ice-lite' : null;
				sdpObj.msidSemantic = {
					semantic: 'WMS',
					token: '*'
				};
	
				if (mids.length > 0) {
					sdpObj.groups = [{
						type: 'BUNDLE',
						mids: mids.join(' ')
					}];
				}
	
				sdpObj.media = [];
	
				// NOTE: We take the latest fingerprint.
				var numFingerprints = remoteDtlsParameters.fingerprints.length;
	
				sdpObj.fingerprint = {
					type: remoteDtlsParameters.fingerprints[numFingerprints - 1].algorithm,
					hash: remoteDtlsParameters.fingerprints[numFingerprints - 1].value
				};
	
				var _iteratorNormalCompletion8 = true;
				var _didIteratorError8 = false;
				var _iteratorError8 = undefined;
	
				try {
					for (var _iterator8 = (0, _getIterator3.default)(consumerInfos), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
						var info = _step8.value;
	
						var closed = info.closed;
						var kind = info.kind;
						var codecs = void 0;
						var headerExtensions = void 0;
	
						if (info.kind !== 'application') {
							codecs = this._rtpParametersByKind[kind].codecs;
							headerExtensions = this._rtpParametersByKind[kind].headerExtensions;
						}
	
						var remoteMediaObj = {};
	
						if (info.kind !== 'application') {
							remoteMediaObj.type = kind;
							remoteMediaObj.port = 7;
							remoteMediaObj.protocol = 'RTP/SAVPF';
							remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
							remoteMediaObj.mid = info.mid;
							remoteMediaObj.msid = info.streamId + ' ' + info.trackId;
						} else {
							remoteMediaObj.type = kind;
							remoteMediaObj.port = 9;
							remoteMediaObj.protocol = 'DTLS/SCTP';
							remoteMediaObj.connection = { ip: '127.0.0.1', version: 4 };
							remoteMediaObj.mid = info.mid;
						}
	
						remoteMediaObj.iceUfrag = remoteIceParameters.usernameFragment;
						remoteMediaObj.icePwd = remoteIceParameters.password;
						remoteMediaObj.candidates = [];
	
						var _iteratorNormalCompletion9 = true;
						var _didIteratorError9 = false;
						var _iteratorError9 = undefined;
	
						try {
							for (var _iterator9 = (0, _getIterator3.default)(remoteIceCandidates), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
								var candidate = _step9.value;
	
								var candidateObj = {};
	
								// mediasoup does not support non rtcp-mux so candidates component is
								// always RTP (1).
								candidateObj.component = 1;
								candidateObj.foundation = candidate.foundation;
								candidateObj.ip = candidate.ip;
								candidateObj.port = candidate.port;
								candidateObj.priority = candidate.priority;
								candidateObj.transport = candidate.protocol;
								candidateObj.type = candidate.type;
								if (candidate.tcpType) candidateObj.tcptype = candidate.tcpType;
	
								remoteMediaObj.candidates.push(candidateObj);
							}
						} catch (err) {
							_didIteratorError9 = true;
							_iteratorError9 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion9 && _iterator9.return) {
									_iterator9.return();
								}
							} finally {
								if (_didIteratorError9) {
									throw _iteratorError9;
								}
							}
						}
	
						remoteMediaObj.endOfCandidates = 'end-of-candidates';
	
						// Announce support for ICE renomination.
						// https://tools.ietf.org/html/draft-thatcher-ice-renomination
						remoteMediaObj.iceOptions = 'renomination';
	
						remoteMediaObj.setup = 'actpass';
	
						if (info.kind !== 'application') {
							if (!closed) remoteMediaObj.direction = 'sendonly';else remoteMediaObj.direction = 'inactive';
	
							remoteMediaObj.rtp = [];
							remoteMediaObj.rtcpFb = [];
							remoteMediaObj.fmtp = [];
	
							var _iteratorNormalCompletion10 = true;
							var _didIteratorError10 = false;
							var _iteratorError10 = undefined;
	
							try {
								for (var _iterator10 = (0, _getIterator3.default)(codecs), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
									var codec = _step10.value;
	
									var rtp = {
										payload: codec.payloadType,
										codec: codec.name,
										rate: codec.clockRate
									};
	
									if (codec.channels > 1) rtp.encoding = codec.channels;
	
									remoteMediaObj.rtp.push(rtp);
	
									if (codec.parameters) {
										var paramFmtp = {
											payload: codec.payloadType,
											config: ''
										};
	
										var _iteratorNormalCompletion12 = true;
										var _didIteratorError12 = false;
										var _iteratorError12 = undefined;
	
										try {
											for (var _iterator12 = (0, _getIterator3.default)((0, _keys2.default)(codec.parameters)), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
												var key = _step12.value;
	
												if (paramFmtp.config) paramFmtp.config += ';';
	
												paramFmtp.config += key + '=' + codec.parameters[key];
											}
										} catch (err) {
											_didIteratorError12 = true;
											_iteratorError12 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion12 && _iterator12.return) {
													_iterator12.return();
												}
											} finally {
												if (_didIteratorError12) {
													throw _iteratorError12;
												}
											}
										}
	
										if (paramFmtp.config) remoteMediaObj.fmtp.push(paramFmtp);
									}
	
									if (codec.rtcpFeedback) {
										var _iteratorNormalCompletion13 = true;
										var _didIteratorError13 = false;
										var _iteratorError13 = undefined;
	
										try {
											for (var _iterator13 = (0, _getIterator3.default)(codec.rtcpFeedback), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
												var fb = _step13.value;
	
												remoteMediaObj.rtcpFb.push({
													payload: codec.payloadType,
													type: fb.type,
													subtype: fb.parameter || ''
												});
											}
										} catch (err) {
											_didIteratorError13 = true;
											_iteratorError13 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion13 && _iterator13.return) {
													_iterator13.return();
												}
											} finally {
												if (_didIteratorError13) {
													throw _iteratorError13;
												}
											}
										}
									}
								}
							} catch (err) {
								_didIteratorError10 = true;
								_iteratorError10 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion10 && _iterator10.return) {
										_iterator10.return();
									}
								} finally {
									if (_didIteratorError10) {
										throw _iteratorError10;
									}
								}
							}
	
							remoteMediaObj.payloads = codecs.map(function (codec) {
								return codec.payloadType;
							}).join(' ');
	
							// NOTE: Firefox does not like a=extmap lines if a=inactive.
							if (!closed) {
								remoteMediaObj.ext = [];
	
								var _iteratorNormalCompletion11 = true;
								var _didIteratorError11 = false;
								var _iteratorError11 = undefined;
	
								try {
									for (var _iterator11 = (0, _getIterator3.default)(headerExtensions), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
										var _ext = _step11.value;
	
										remoteMediaObj.ext.push({
											uri: _ext.uri,
											value: _ext.id
										});
									}
								} catch (err) {
									_didIteratorError11 = true;
									_iteratorError11 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion11 && _iterator11.return) {
											_iterator11.return();
										}
									} finally {
										if (_didIteratorError11) {
											throw _iteratorError11;
										}
									}
								}
							}
	
							remoteMediaObj.rtcpMux = 'rtcp-mux';
							remoteMediaObj.rtcpRsize = 'rtcp-rsize';
	
							if (!closed) {
								remoteMediaObj.ssrcs = [];
								remoteMediaObj.ssrcGroups = [];
	
								remoteMediaObj.ssrcs.push({
									id: info.ssrc,
									attribute: 'cname',
									value: info.cname
								});
	
								if (info.rtxSsrc) {
									remoteMediaObj.ssrcs.push({
										id: info.rtxSsrc,
										attribute: 'cname',
										value: info.cname
									});
	
									// Associate original and retransmission SSRC.
									remoteMediaObj.ssrcGroups.push({
										semantics: 'FID',
										ssrcs: info.ssrc + ' ' + info.rtxSsrc
									});
								}
							}
						} else {
							remoteMediaObj.payloads = 5000;
							remoteMediaObj.sctpmap = {
								app: 'webrtc-datachannel',
								maxMessageSize: 256,
								sctpmapNumber: 5000
							};
						}
	
						// Push it.
						sdpObj.media.push(remoteMediaObj);
					}
				} catch (err) {
					_didIteratorError8 = true;
					_iteratorError8 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion8 && _iterator8.return) {
							_iterator8.return();
						}
					} finally {
						if (_didIteratorError8) {
							throw _iteratorError8;
						}
					}
				}
	
				var sdp = _sdpTransform2.default.write(sdpObj);
	
				return sdp;
			}
		}]);
		return RecvRemoteSdp;
	}(RemoteSdp);
	
	var RemoteUnifiedPlanSdp = function RemoteUnifiedPlanSdp(direction, rtpParametersByKind) {
		(0, _classCallCheck3.default)(this, RemoteUnifiedPlanSdp);
	
		logger.debug('constructor() [direction:%s, rtpParametersByKind:%o]', direction, rtpParametersByKind);
	
		switch (direction) {
			case 'send':
				return new SendRemoteSdp(rtpParametersByKind);
			case 'recv':
				return new RecvRemoteSdp(rtpParametersByKind);
		}
	};
	
	exports.default = RemoteUnifiedPlanSdp;
	
	},{"../../Logger":13,"../../utils":34,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/object/get-prototype-of":43,"babel-runtime/core-js/object/keys":44,"babel-runtime/helpers/classCallCheck":51,"babel-runtime/helpers/createClass":52,"babel-runtime/helpers/inherits":54,"babel-runtime/helpers/possibleConstructorReturn":55,"sdp-transform":213}],29:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _from = require('babel-runtime/core-js/array/from');
	
	var _from2 = _interopRequireDefault(_from);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	exports.extractRtpCapabilities = extractRtpCapabilities;
	exports.extractDtlsParameters = extractDtlsParameters;
	
	var _sdpTransform = require('sdp-transform');
	
	var _sdpTransform2 = _interopRequireDefault(_sdpTransform);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Extract RTP capabilities from a SDP.
	 *
	 * @param {Object} sdpObj - SDP Object generated by sdp-transform.
	 * @return {RTCRtpCapabilities}
	 */
	function extractRtpCapabilities(sdpObj) {
		// Map of RtpCodecParameters indexed by payload type.
		var codecsMap = new _map2.default();
	
		// Array of RtpHeaderExtensions.
		var headerExtensions = [];
	
		// Whether a m=audio/video section has been already found.
		var gotAudio = false;
		var gotVideo = false;
	
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _getIterator3.default)(sdpObj.media), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var m = _step.value;
	
				var kind = m.type;
	
				switch (kind) {
					case 'audio':
						{
							if (gotAudio) continue;
	
							gotAudio = true;
							break;
						}
					case 'video':
						{
							if (gotVideo) continue;
	
							gotVideo = true;
							break;
						}
					default:
						{
							continue;
						}
				}
	
				// Get codecs.
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _getIterator3.default)(m.rtp), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var rtp = _step2.value;
	
						var codec = {
							name: rtp.codec,
							mimeType: kind + '/' + rtp.codec,
							kind: kind,
							clockRate: rtp.rate,
							preferredPayloadType: rtp.payload,
							channels: rtp.encoding,
							rtcpFeedback: [],
							parameters: {}
						};
	
						if (codec.kind !== 'audio') delete codec.channels;else if (!codec.channels) codec.channels = 1;
	
						codecsMap.set(codec.preferredPayloadType, codec);
					}
	
					// Get codec parameters.
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
	
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;
	
				try {
					for (var _iterator3 = (0, _getIterator3.default)(m.fmtp || []), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var fmtp = _step3.value;
	
						var parameters = _sdpTransform2.default.parseFmtpConfig(fmtp.config);
						var _codec = codecsMap.get(fmtp.payload);
	
						if (!_codec) continue;
	
						_codec.parameters = parameters;
					}
	
					// Get RTCP feedback for each codec.
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
	
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;
	
				try {
					for (var _iterator4 = (0, _getIterator3.default)(m.rtcpFb || []), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var fb = _step4.value;
	
						var _codec2 = codecsMap.get(fb.payload);
	
						if (!_codec2) continue;
	
						var feedback = {
							type: fb.type,
							parameter: fb.subtype
						};
	
						if (!feedback.parameter) delete feedback.parameter;
	
						_codec2.rtcpFeedback.push(feedback);
					}
	
					// Get RTP header extensions.
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
	
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;
	
				try {
					for (var _iterator5 = (0, _getIterator3.default)(m.ext || []), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var ext = _step5.value;
	
						var headerExtension = {
							kind: kind,
							uri: ext.uri,
							preferredId: ext.value
						};
	
						headerExtensions.push(headerExtension);
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		var rtpCapabilities = {
			codecs: (0, _from2.default)(codecsMap.values()),
			headerExtensions: headerExtensions,
			fecMechanisms: [] // TODO
		};
	
		return rtpCapabilities;
	}
	
	/**
	 * Extract DTLS parameters from a SDP.
	 *
	 * @param {Object} sdpObj - SDP Object generated by sdp-transform.
	 * @return {RTCDtlsParameters}
	 */
	function extractDtlsParameters(sdpObj) {
		var media = getFirstActiveMediaSection(sdpObj);
		var fingerprint = media.fingerprint || sdpObj.fingerprint;
		var role = void 0;
	
		switch (media.setup) {
			case 'active':
				role = 'client';
				break;
			case 'passive':
				role = 'server';
				break;
			case 'actpass':
				role = 'auto';
				break;
		}
	
		var dtlsParameters = {
			role: role,
			fingerprints: [{
				algorithm: fingerprint.type,
				value: fingerprint.hash
			}]
		};
	
		return dtlsParameters;
	}
	
	/**
	 * Get the first acive media section.
	 *
	 * @private
	 * @param {Object} sdpObj - SDP Object generated by sdp-transform.
	 * @return {Object} SDP media section as parsed by sdp-transform.
	 */
	function getFirstActiveMediaSection(sdpObj) {
		return (sdpObj.media || []).find(function (m) {
			return m.iceUfrag && m.port !== 0;
		});
	}
	
	},{"babel-runtime/core-js/array/from":35,"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/map":39,"sdp-transform":213}],30:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');
	
	var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	var _map = require('babel-runtime/core-js/map');
	
	var _map2 = _interopRequireDefault(_map);
	
	var _set = require('babel-runtime/core-js/set');
	
	var _set2 = _interopRequireDefault(_set);
	
	exports.fillRtpParametersForTrack = fillRtpParametersForTrack;
	exports.addSimulcastForTrack = addSimulcastForTrack;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Fill the given RTP parameters for the given track.
	 *
	 * @param {RTCRtpParameters} rtpParameters -  RTP parameters to be filled.
	 * @param {Object} sdpObj - Local SDP Object generated by sdp-transform.
	 * @param {MediaStreamTrack} track
	 */
	function fillRtpParametersForTrack(rtpParameters, sdpObj, track) {
		var kind = track.kind;
		var rtcp = {
			cname: null,
			reducedSize: true,
			mux: true
		};
	
		var mSection = (sdpObj.media || []).find(function (m) {
			return m.type === kind;
		});
	
		if (!mSection) throw new Error('m=' + kind + ' section not found');
	
		// First media SSRC (or the only one).
		var firstSsrc = void 0;
	
		// Get all the SSRCs.
	
		var ssrcs = new _set2.default();
	
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _getIterator3.default)(mSection.ssrcs || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var line = _step.value;
	
				if (line.attribute !== 'msid') continue;
	
				var trackId = line.value.split(' ')[1];
	
				if (trackId === track.id) {
					var ssrc = line.id;
	
					ssrcs.add(ssrc);
	
					if (!firstSsrc) firstSsrc = ssrc;
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		if (ssrcs.size === 0) throw new Error('a=ssrc line not found for local track [track.id:' + track.id + ']');
	
		// Get media and RTX SSRCs.
	
		var ssrcToRtxSsrc = new _map2.default();
	
		// First assume RTX is used.
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;
	
		try {
			for (var _iterator2 = (0, _getIterator3.default)(mSection.ssrcGroups || []), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var _line = _step2.value;
	
				if (_line.semantics !== 'FID') continue;
	
				var _line$ssrcs$split = _line.ssrcs.split(/\s+/),
						_line$ssrcs$split2 = (0, _slicedToArray3.default)(_line$ssrcs$split, 2),
						_ssrc = _line$ssrcs$split2[0],
						rtxSsrc = _line$ssrcs$split2[1];
	
				_ssrc = Number(_ssrc);
				rtxSsrc = Number(rtxSsrc);
	
				if (ssrcs.has(_ssrc)) {
					// Remove both the SSRC and RTX SSRC from the Set so later we know that they
					// are already handled.
					ssrcs.delete(_ssrc);
					ssrcs.delete(rtxSsrc);
	
					// Add to the map.
					ssrcToRtxSsrc.set(_ssrc, rtxSsrc);
				}
			}
	
			// If the Set of SSRCs is not empty it means that RTX is not being used, so take
			// media SSRCs from there.
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;
	
		try {
			for (var _iterator3 = (0, _getIterator3.default)(ssrcs), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _ssrc2 = _step3.value;
	
				// Add to the map.
				ssrcToRtxSsrc.set(_ssrc2, null);
			}
	
			// Get RTCP info.
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}
	
		var ssrcCnameLine = mSection.ssrcs.find(function (line) {
			return line.attribute === 'cname' && line.id === firstSsrc;
		});
	
		if (ssrcCnameLine) rtcp.cname = ssrcCnameLine.value;
	
		// Fill RTP parameters.
	
		rtpParameters.rtcp = rtcp;
		rtpParameters.encodings = [];
	
		var simulcast = ssrcToRtxSsrc.size > 1;
		var simulcastProfiles = ['low', 'medium', 'high'];
	
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;
	
		try {
			for (var _iterator4 = (0, _getIterator3.default)(ssrcToRtxSsrc), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2),
						_ssrc3 = _step4$value[0],
						rtxSsrc = _step4$value[1];
	
				var encoding = { ssrc: _ssrc3 };
	
				if (rtxSsrc) encoding.rtx = { ssrc: rtxSsrc };
	
				if (simulcast) encoding.profile = simulcastProfiles.shift();
	
				rtpParameters.encodings.push(encoding);
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}
	}
	
	/**
	 * Adds simulcast into the given SDP for the given track.
	 *
	 * @param {Object} sdpObj - Local SDP Object generated by sdp-transform.
	 * @param {MediaStreamTrack} track
	 */
	function addSimulcastForTrack(sdpObj, track) {
		var kind = track.kind;
	
		var mSection = (sdpObj.media || []).find(function (m) {
			return m.type === kind;
		});
	
		if (!mSection) throw new Error('m=' + kind + ' section not found');
	
		var ssrc = void 0;
		var rtxSsrc = void 0;
		var msid = void 0;
	
		// Get the SSRC.
	
		var ssrcMsidLine = (mSection.ssrcs || []).find(function (line) {
			if (line.attribute !== 'msid') return false;
	
			var trackId = line.value.split(' ')[1];
	
			if (trackId === track.id) {
				ssrc = line.id;
				msid = line.value.split(' ')[0];
	
				return true;
			}
		});
	
		if (!ssrcMsidLine) throw new Error('a=ssrc line not found for local track [track.id:' + track.id + ']');
	
		// Get the SSRC for RTX.
	
		(mSection.ssrcGroups || []).some(function (line) {
			if (line.semantics !== 'FID') return;
	
			var ssrcs = line.ssrcs.split(/\s+/);
	
			if (Number(ssrcs[0]) === ssrc) {
				rtxSsrc = Number(ssrcs[1]);
	
				return true;
			}
		});
	
		var ssrcCnameLine = mSection.ssrcs.find(function (line) {
			return line.attribute === 'cname' && line.id === ssrc;
		});
	
		if (!ssrcCnameLine) throw new Error('CNAME line not found for local track [track.id:' + track.id + ']');
	
		var cname = ssrcCnameLine.value;
		var ssrc2 = ssrc + 1;
		var ssrc3 = ssrc + 2;
	
		mSection.ssrcGroups = mSection.ssrcGroups || [];
	
		mSection.ssrcGroups.push({
			semantics: 'SIM',
			ssrcs: ssrc + ' ' + ssrc2 + ' ' + ssrc3
		});
	
		mSection.ssrcs.push({
			id: ssrc2,
			attribute: 'cname',
			value: cname
		});
	
		mSection.ssrcs.push({
			id: ssrc2,
			attribute: 'msid',
			value: msid + ' ' + track.id
		});
	
		mSection.ssrcs.push({
			id: ssrc3,
			attribute: 'cname',
			value: cname
		});
	
		mSection.ssrcs.push({
			id: ssrc3,
			attribute: 'msid',
			value: msid + ' ' + track.id
		});
	
		if (rtxSsrc) {
			var rtxSsrc2 = rtxSsrc + 1;
			var rtxSsrc3 = rtxSsrc + 2;
	
			mSection.ssrcGroups.push({
				semantics: 'FID',
				ssrcs: ssrc2 + ' ' + rtxSsrc2
			});
	
			mSection.ssrcs.push({
				id: rtxSsrc2,
				attribute: 'cname',
				value: cname
			});
	
			mSection.ssrcs.push({
				id: rtxSsrc2,
				attribute: 'msid',
				value: msid + ' ' + track.id
			});
	
			mSection.ssrcGroups.push({
				semantics: 'FID',
				ssrcs: ssrc3 + ' ' + rtxSsrc3
			});
	
			mSection.ssrcs.push({
				id: rtxSsrc3,
				attribute: 'cname',
				value: cname
			});
	
			mSection.ssrcs.push({
				id: rtxSsrc3,
				attribute: 'msid',
				value: msid + ' ' + track.id
			});
		}
	}
	
	},{"babel-runtime/core-js/get-iterator":36,"babel-runtime/core-js/map":39,"babel-runtime/core-js/set":48,"babel-runtime/helpers/slicedToArray":56}],31:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	exports.fillRtpParametersForTrack = fillRtpParametersForTrack;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Fill the given RTP parameters for the given track.
	 *
	 * @param {RTCRtpParameters} rtpParameters -  RTP parameters to be filled.
	 * @param {Object} sdpObj - Local SDP Object generated by sdp-transform.
	 * @param {MediaStreamTrack} track
	 */
	function fillRtpParametersForTrack(rtpParameters, sdpObj, track) {
		var kind = track.kind;
		var rtcp = {
			cname: null,
			reducedSize: true,
			mux: true
		};
	
		var mSection = (sdpObj.media || []).find(function (m) {
			if (m.type !== kind) return;
	
			var msidLine = m.msid;
	
			if (!msidLine) return;
	
			var trackId = msidLine.split(' ')[1];
	
			if (trackId === track.id) return true;
		});
	
		if (!mSection) throw new Error('m=' + kind + ' section not found');
	
		// Get the SSRC and CNAME.
	
		var ssrcCnameLine = (mSection.ssrcs || []).find(function (line) {
			return line.attribute === 'cname';
		});
	
		var ssrc = void 0;
	
		if (ssrcCnameLine) {
			ssrc = ssrcCnameLine.id;
			rtcp.cname = ssrcCnameLine.value;
		}
	
		// Get a=rid lines.
	
		// Array of Objects with rid and profile keys.
		var simulcastStreams = [];
	
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _getIterator3.default)(mSection.rids || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var rid = _step.value;
	
				if (rid.direction !== 'send') continue;
	
				if (/^low/.test(rid.id)) simulcastStreams.push({ rid: rid.id, profile: 'low' });else if (/^medium/.test(rid.id)) simulcastStreams.push({ rid: rid.id, profile: 'medium' });
				if (/^high/.test(rid.id)) simulcastStreams.push({ rid: rid.id, profile: 'high' });
			}
	
			// Fill RTP parameters.
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		rtpParameters.rtcp = rtcp;
		rtpParameters.encodings = [];
	
		if (simulcastStreams.length === 0) {
			var encoding = { ssrc: ssrc };
	
			rtpParameters.encodings.push(encoding);
		} else {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;
	
			try {
				for (var _iterator2 = (0, _getIterator3.default)(simulcastStreams), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var simulcastStream = _step2.value;
	
					var _encoding = {
						encodingId: simulcastStream.rid,
						profile: simulcastStream.profile
					};
	
					rtpParameters.encodings.push(_encoding);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	}
	
	},{"babel-runtime/core-js/get-iterator":36}],32:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Room = undefined;
	
	var _promise = require('babel-runtime/core-js/promise');
	
	var _promise2 = _interopRequireDefault(_promise);
	
	exports.isDeviceSupported = isDeviceSupported;
	exports.getDeviceInfo = getDeviceInfo;
	exports.checkCapabilitiesForRoom = checkCapabilitiesForRoom;
	
	var _ortc = require('./ortc');
	
	var ortc = _interopRequireWildcard(_ortc);
	
	var _Device = require('./Device');
	
	var _Device2 = _interopRequireDefault(_Device);
	
	var _Room = require('./Room');
	
	var _Room2 = _interopRequireDefault(_Room);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Whether the current browser or device is supported.
	 *
	 * @return {Boolean}
	 *
	 * @example
	 * isDeviceSupported()
	 * // => true
	 */
	function isDeviceSupported() {
		return _Device2.default.isSupported();
	}
	
	/**
	 * Get information regarding the current browser or device.
	 *
	 * @return {Object} - Object with `name` (String) and version {String}.
	 *
	 * @example
	 * getDeviceInfo()
	 * // => { flag: 'chrome', name: 'Chrome', version: '59.0', bowser: {} }
	 */
	function getDeviceInfo() {
		return {
			flag: _Device2.default.getFlag(),
			name: _Device2.default.getName(),
			version: _Device2.default.getVersion(),
			bowser: _Device2.default.getBowser()
		};
	}
	
	/**
	 * Check whether this device/browser can send/receive audio/video in a room
	 * whose RTP capabilities are given.
	 *
	 * @param {Object} Room RTP capabilities.
	 *
	 * @return {Promise} Resolves to an Object with 'audio' and 'video' Booleans.
	 */
	function checkCapabilitiesForRoom(roomRtpCapabilities) {
		if (!_Device2.default.isSupported()) return _promise2.default.reject(new Error('current browser/device not supported'));
	
		return _Device2.default.Handler.getNativeRtpCapabilities().then(function (nativeRtpCapabilities) {
			var extendedRtpCapabilities = ortc.getExtendedRtpCapabilities(nativeRtpCapabilities, roomRtpCapabilities);
	
			return {
				audio: ortc.canSend('audio', extendedRtpCapabilities),
				video: ortc.canSend('video', extendedRtpCapabilities)
			};
		});
	}
	
	/**
	 * Expose the Room class.
	 *
	 * @example
	 * const room = new Room();`
	 */
	exports.Room = _Room2.default;
	
	},{"./Device":11,"./Room":16,"./ortc":33,"babel-runtime/core-js/promise":47}],33:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getIterator2 = require('babel-runtime/core-js/get-iterator');
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	exports.getExtendedRtpCapabilities = getExtendedRtpCapabilities;
	exports.getRtpCapabilities = getRtpCapabilities;
	exports.getUnsupportedCodecs = getUnsupportedCodecs;
	exports.canSend = canSend;
	exports.canReceive = canReceive;
	exports.getSendingRtpParameters = getSendingRtpParameters;
	exports.getReceivingFullRtpParameters = getReceivingFullRtpParameters;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Generate extended RTP capabilities for sending and receiving.
	 *
	 * @param {RTCRtpCapabilities} localCaps - Local capabilities.
	 * @param {RTCRtpCapabilities} remoteCaps - Remote capabilities.
	 *
	 * @return {RTCExtendedRtpCapabilities}
	 */
	function getExtendedRtpCapabilities(localCaps, remoteCaps) {
		var extendedCaps = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: []
		};
	
		// Match media codecs and keep the order preferred by remoteCaps.
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			var _loop = function _loop() {
				var remoteCodec = _step.value;
	
				// TODO: Ignore pseudo-codecs and feature codecs.
				if (remoteCodec.name === 'rtx') return 'continue';
	
				var matchingLocalCodec = (localCaps.codecs || []).find(function (localCodec) {
					return matchCapCodecs(localCodec, remoteCodec);
				});
	
				if (matchingLocalCodec) {
					var extendedCodec = {
						name: remoteCodec.name,
						mimeType: remoteCodec.mimeType,
						kind: remoteCodec.kind,
						clockRate: remoteCodec.clockRate,
						sendPayloadType: matchingLocalCodec.preferredPayloadType,
						sendRtxPayloadType: null,
						recvPayloadType: remoteCodec.preferredPayloadType,
						recvRtxPayloadType: null,
						channels: remoteCodec.channels,
						rtcpFeedback: reduceRtcpFeedback(matchingLocalCodec, remoteCodec),
						parameters: remoteCodec.parameters
					};
	
					if (!extendedCodec.channels) delete extendedCodec.channels;
	
					extendedCaps.codecs.push(extendedCodec);
				}
			};
	
			for (var _iterator = (0, _getIterator3.default)(remoteCaps.codecs || []), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _ret = _loop();
	
				if (_ret === 'continue') continue;
			}
	
			// Match RTX codecs.
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;
	
		try {
			var _loop2 = function _loop2() {
				var extendedCodec = _step2.value;
	
				var matchingLocalRtxCodec = (localCaps.codecs || []).find(function (localCodec) {
					return localCodec.name === 'rtx' && localCodec.parameters.apt === extendedCodec.sendPayloadType;
				});
	
				var matchingRemoteRtxCodec = (remoteCaps.codecs || []).find(function (remoteCodec) {
					return remoteCodec.name === 'rtx' && remoteCodec.parameters.apt === extendedCodec.recvPayloadType;
				});
	
				if (matchingLocalRtxCodec && matchingRemoteRtxCodec) {
					extendedCodec.sendRtxPayloadType = matchingLocalRtxCodec.preferredPayloadType;
					extendedCodec.recvRtxPayloadType = matchingRemoteRtxCodec.preferredPayloadType;
				}
			};
	
			for (var _iterator2 = (0, _getIterator3.default)(extendedCaps.codecs || []), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				_loop2();
			}
	
			// Match header extensions.
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;
	
		try {
			var _loop3 = function _loop3() {
				var remoteExt = _step3.value;
	
				var matchingLocalExt = (localCaps.headerExtensions || []).find(function (localExt) {
					return matchCapHeaderExtensions(localExt, remoteExt);
				});
	
				if (matchingLocalExt) {
					var extendedExt = {
						kind: remoteExt.kind,
						uri: remoteExt.uri,
						sendId: matchingLocalExt.preferredId,
						recvId: remoteExt.preferredId
					};
	
					extendedCaps.headerExtensions.push(extendedExt);
				}
			};
	
			for (var _iterator3 = (0, _getIterator3.default)(remoteCaps.headerExtensions || []), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				_loop3();
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}
	
		return extendedCaps;
	}
	
	/**
	 * Generate RTP capabilities for receiving media based on the given extended
	 * RTP capabilities.
	 *
	 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
	 *
	 * @return {RTCRtpCapabilities}
	 */
	function getRtpCapabilities(extendedRtpCapabilities) {
		var caps = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: []
		};
	
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;
	
		try {
			for (var _iterator4 = (0, _getIterator3.default)(extendedRtpCapabilities.codecs), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var capCodec = _step4.value;
	
				var codec = {
					name: capCodec.name,
					mimeType: capCodec.mimeType,
					kind: capCodec.kind,
					clockRate: capCodec.clockRate,
					preferredPayloadType: capCodec.recvPayloadType,
					channels: capCodec.channels,
					rtcpFeedback: capCodec.rtcpFeedback,
					parameters: capCodec.parameters
				};
	
				if (!codec.channels) delete codec.channels;
	
				caps.codecs.push(codec);
	
				// Add RTX codec.
				if (capCodec.recvRtxPayloadType) {
					var rtxCapCodec = {
						name: 'rtx',
						mimeType: capCodec.kind + '/rtx',
						kind: capCodec.kind,
						clockRate: capCodec.clockRate,
						preferredPayloadType: capCodec.recvRtxPayloadType,
						parameters: {
							apt: capCodec.recvPayloadType
						}
					};
	
					caps.codecs.push(rtxCapCodec);
				}
	
				// TODO: In the future, we need to add FEC, CN, etc, codecs.
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}
	
		var _iteratorNormalCompletion5 = true;
		var _didIteratorError5 = false;
		var _iteratorError5 = undefined;
	
		try {
			for (var _iterator5 = (0, _getIterator3.default)(extendedRtpCapabilities.headerExtensions), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
				var capExt = _step5.value;
	
				var ext = {
					kind: capExt.kind,
					uri: capExt.uri,
					preferredId: capExt.recvId
				};
	
				caps.headerExtensions.push(ext);
			}
		} catch (err) {
			_didIteratorError5 = true;
			_iteratorError5 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion5 && _iterator5.return) {
					_iterator5.return();
				}
			} finally {
				if (_didIteratorError5) {
					throw _iteratorError5;
				}
			}
		}
	
		caps.fecMechanisms = extendedRtpCapabilities.fecMechanisms;
	
		return caps;
	}
	
	/**
	 * Get unsupported remote codecs.
	 *
	 * @param {RTCRtpCapabilities} remoteCaps - Remote capabilities.
	 * @param {Array<Number>} mandatoryCodecPayloadTypes - List of codec PT values.
	 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
	 *
	 * @return {Boolean}
	 */
	function getUnsupportedCodecs(remoteCaps, mandatoryCodecPayloadTypes, extendedRtpCapabilities) {
		// If not given just ignore.
		if (!Array.isArray(mandatoryCodecPayloadTypes)) return [];
	
		var unsupportedCodecs = [];
		var remoteCodecs = remoteCaps.codecs;
		var supportedCodecs = extendedRtpCapabilities.codecs;
	
		var _iteratorNormalCompletion6 = true;
		var _didIteratorError6 = false;
		var _iteratorError6 = undefined;
	
		try {
			var _loop4 = function _loop4() {
				var pt = _step6.value;
	
				if (!supportedCodecs.some(function (codec) {
					return codec.recvPayloadType === pt;
				})) {
					var unsupportedCodec = remoteCodecs.find(function (codec) {
						return codec.preferredPayloadType === pt;
					});
	
					if (!unsupportedCodec) throw new Error('mandatory codec PT ' + pt + ' not found in remote codecs');
	
					unsupportedCodecs.push(unsupportedCodec);
				}
			};
	
			for (var _iterator6 = (0, _getIterator3.default)(mandatoryCodecPayloadTypes), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
				_loop4();
			}
		} catch (err) {
			_didIteratorError6 = true;
			_iteratorError6 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion6 && _iterator6.return) {
					_iterator6.return();
				}
			} finally {
				if (_didIteratorError6) {
					throw _iteratorError6;
				}
			}
		}
	
		return unsupportedCodecs;
	}
	
	/**
	 * Whether media can be sent based on the given RTP capabilities.
	 *
	 * @param {String} kind
	 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
	 *
	 * @return {Boolean}
	 */
	function canSend(kind, extendedRtpCapabilities) {
		return extendedRtpCapabilities.codecs.some(function (codec) {
			return codec.kind === kind;
		});
	}
	
	/**
	 * Whether the given RTP parameters can be received with the given RTP
	 * capabilities.
	 *
	 * @param {RTCRtpParameters} rtpParameters
	 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
	 *
	 * @return {Boolean}
	 */
	function canReceive(rtpParameters, extendedRtpCapabilities) {
		if (rtpParameters.codecs.length === 0) return false;
	
		var firstMediaCodec = rtpParameters.codecs[0];
	
		return extendedRtpCapabilities.codecs.some(function (codec) {
			return codec.recvPayloadType === firstMediaCodec.payloadType;
		});
	}
	
	/**
	 * Generate RTP parameters of the given kind for sending media.
	 * Just the first media codec per kind is considered.
	 * NOTE: muxId, encodings and rtcp fields are left empty.
	 *
	 * @param {kind} kind
	 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
	 *
	 * @return {RTCRtpParameters}
	 */
	function getSendingRtpParameters(kind, extendedRtpCapabilities) {
		var params = {
			muxId: null,
			codecs: [],
			headerExtensions: [],
			encodings: [],
			rtcp: {}
		};
	
		var _iteratorNormalCompletion7 = true;
		var _didIteratorError7 = false;
		var _iteratorError7 = undefined;
	
		try {
			for (var _iterator7 = (0, _getIterator3.default)(extendedRtpCapabilities.codecs), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
				var capCodec = _step7.value;
	
				if (capCodec.kind !== kind) continue;
	
				var codec = {
					name: capCodec.name,
					mimeType: capCodec.mimeType,
					clockRate: capCodec.clockRate,
					payloadType: capCodec.sendPayloadType,
					channels: capCodec.channels,
					rtcpFeedback: capCodec.rtcpFeedback,
					parameters: capCodec.parameters
				};
	
				if (!codec.channels) delete codec.channels;
	
				params.codecs.push(codec);
	
				// Add RTX codec.
				if (capCodec.sendRtxPayloadType) {
					var rtxCodec = {
						name: 'rtx',
						mimeType: capCodec.kind + '/rtx',
						clockRate: capCodec.clockRate,
						payloadType: capCodec.sendRtxPayloadType,
						parameters: {
							apt: capCodec.sendPayloadType
						}
					};
	
					params.codecs.push(rtxCodec);
				}
	
				// NOTE: We assume a single media codec plus an optional RTX codec for now.
				// TODO: In the future, we need to add FEC, CN, etc, codecs.
				break;
			}
		} catch (err) {
			_didIteratorError7 = true;
			_iteratorError7 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion7 && _iterator7.return) {
					_iterator7.return();
				}
			} finally {
				if (_didIteratorError7) {
					throw _iteratorError7;
				}
			}
		}
	
		var _iteratorNormalCompletion8 = true;
		var _didIteratorError8 = false;
		var _iteratorError8 = undefined;
	
		try {
			for (var _iterator8 = (0, _getIterator3.default)(extendedRtpCapabilities.headerExtensions), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
				var capExt = _step8.value;
	
				if (capExt.kind && capExt.kind !== kind) continue;
	
				var ext = {
					uri: capExt.uri,
					id: capExt.sendId
				};
	
				params.headerExtensions.push(ext);
			}
		} catch (err) {
			_didIteratorError8 = true;
			_iteratorError8 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion8 && _iterator8.return) {
					_iterator8.return();
				}
			} finally {
				if (_didIteratorError8) {
					throw _iteratorError8;
				}
			}
		}
	
		return params;
	}
	
	/**
	 * Generate RTP parameters of the given kind for receiving media.
	 * All the media codecs per kind are considered. This is useful for generating
	 * a SDP remote offer.
	 * NOTE: muxId, encodings and rtcp fields are left empty.
	 *
	 * @param {String} kind
	 * @param {RTCExtendedRtpCapabilities} extendedRtpCapabilities
	 *
	 * @return {RTCRtpParameters}
	 */
	function getReceivingFullRtpParameters(kind, extendedRtpCapabilities) {
		var params = {
			muxId: null,
			codecs: [],
			headerExtensions: [],
			encodings: [],
			rtcp: {}
		};
	
		var _iteratorNormalCompletion9 = true;
		var _didIteratorError9 = false;
		var _iteratorError9 = undefined;
	
		try {
			for (var _iterator9 = (0, _getIterator3.default)(extendedRtpCapabilities.codecs), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
				var capCodec = _step9.value;
	
				if (capCodec.kind !== kind) continue;
	
				var codec = {
					name: capCodec.name,
					mimeType: capCodec.mimeType,
					clockRate: capCodec.clockRate,
					payloadType: capCodec.recvPayloadType,
					channels: capCodec.channels,
					rtcpFeedback: capCodec.rtcpFeedback,
					parameters: capCodec.parameters
				};
	
				if (!codec.channels) delete codec.channels;
	
				params.codecs.push(codec);
	
				// Add RTX codec.
				if (capCodec.recvRtxPayloadType) {
					var rtxCodec = {
						name: 'rtx',
						mimeType: capCodec.kind + '/rtx',
						clockRate: capCodec.clockRate,
						payloadType: capCodec.recvRtxPayloadType,
						parameters: {
							apt: capCodec.recvPayloadType
						}
					};
	
					params.codecs.push(rtxCodec);
				}
	
				// TODO: In the future, we need to add FEC, CN, etc, codecs.
			}
		} catch (err) {
			_didIteratorError9 = true;
			_iteratorError9 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion9 && _iterator9.return) {
					_iterator9.return();
				}
			} finally {
				if (_didIteratorError9) {
					throw _iteratorError9;
				}
			}
		}
	
		var _iteratorNormalCompletion10 = true;
		var _didIteratorError10 = false;
		var _iteratorError10 = undefined;
	
		try {
			for (var _iterator10 = (0, _getIterator3.default)(extendedRtpCapabilities.headerExtensions), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
				var capExt = _step10.value;
	
				if (capExt.kind && capExt.kind !== kind) continue;
	
				var ext = {
					uri: capExt.uri,
					id: capExt.recvId
				};
	
				params.headerExtensions.push(ext);
			}
		} catch (err) {
			_didIteratorError10 = true;
			_iteratorError10 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion10 && _iterator10.return) {
					_iterator10.return();
				}
			} finally {
				if (_didIteratorError10) {
					throw _iteratorError10;
				}
			}
		}
	
		return params;
	}
	
	function matchCapCodecs(aCodec, bCodec) {
		var aMimeType = aCodec.mimeType.toLowerCase();
		var bMimeType = bCodec.mimeType.toLowerCase();
	
		if (aMimeType !== bMimeType) return false;
	
		if (aCodec.clockRate !== bCodec.clockRate) return false;
	
		if (aCodec.channels !== bCodec.channels) return false;
	
		// Match H264 parameters.
		if (aMimeType === 'video/h264') {
			var aPacketizationMode = (aCodec.parameters || {})['packetization-mode'] || 0;
			var bPacketizationMode = (bCodec.parameters || {})['packetization-mode'] || 0;
	
			if (aPacketizationMode !== bPacketizationMode) return false;
		}
	
		return true;
	}
	
	function matchCapHeaderExtensions(aExt, bExt) {
		if (aExt.kind && bExt.kind && aExt.kind !== bExt.kind) return false;
	
		if (aExt.uri !== bExt.uri) return false;
	
		return true;
	}
	
	function reduceRtcpFeedback(codecA, codecB) {
		var reducedRtcpFeedback = [];
	
		var _iteratorNormalCompletion11 = true;
		var _didIteratorError11 = false;
		var _iteratorError11 = undefined;
	
		try {
			var _loop5 = function _loop5() {
				var aFb = _step11.value;
	
				var matchingBFb = (codecB.rtcpFeedback || []).find(function (bFb) {
					return bFb.type === aFb.type && bFb.parameter === aFb.parameter;
				});
	
				if (matchingBFb) reducedRtcpFeedback.push(matchingBFb);
			};
	
			for (var _iterator11 = (0, _getIterator3.default)(codecA.rtcpFeedback || []), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
				_loop5();
			}
		} catch (err) {
			_didIteratorError11 = true;
			_iteratorError11 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion11 && _iterator11.return) {
					_iterator11.return();
				}
			} finally {
				if (_didIteratorError11) {
					throw _iteratorError11;
				}
			}
		}
	
		return reducedRtcpFeedback;
	}
	
	},{"babel-runtime/core-js/get-iterator":36}],34:[function(require,module,exports){
	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _stringify = require('babel-runtime/core-js/json/stringify');
	
	var _stringify2 = _interopRequireDefault(_stringify);
	
	exports.randomNumber = randomNumber;
	exports.clone = clone;
	
	var _randomNumber = require('random-number');
	
	var _randomNumber2 = _interopRequireDefault(_randomNumber);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var randomNumberGenerator = _randomNumber2.default.generator({
		min: 10000000,
		max: 99999999,
		integer: true
	});
	
	/**
	 * Generates a random positive number between 10000000 and 99999999.
	 *
	 * @return {Number}
	 */
	function randomNumber() {
		return randomNumberGenerator();
	}
	
	/**
	 * Clones the given Object/Array.
	 *
	 * @param {Object|Array} obj
	 *
	 * @return {Object|Array}
	 */
	function clone(obj) {
		return JSON.parse((0, _stringify2.default)(obj));
	}
	
	},{"babel-runtime/core-js/json/stringify":38,"random-number":207}],35:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
	},{"core-js/library/fn/array/from":61}],36:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
	},{"core-js/library/fn/get-iterator":62}],37:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
	},{"core-js/library/fn/is-iterable":63}],38:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
	},{"core-js/library/fn/json/stringify":64}],39:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
	},{"core-js/library/fn/map":65}],40:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
	},{"core-js/library/fn/object/assign":66}],41:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
	},{"core-js/library/fn/object/create":67}],42:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
	},{"core-js/library/fn/object/define-property":68}],43:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
	},{"core-js/library/fn/object/get-prototype-of":69}],44:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
	},{"core-js/library/fn/object/keys":70}],45:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
	},{"core-js/library/fn/object/set-prototype-of":71}],46:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/object/values"), __esModule: true };
	},{"core-js/library/fn/object/values":72}],47:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
	},{"core-js/library/fn/promise":73}],48:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
	},{"core-js/library/fn/set":74}],49:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
	},{"core-js/library/fn/symbol":75}],50:[function(require,module,exports){
	module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
	},{"core-js/library/fn/symbol/iterator":76}],51:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	exports.default = function (instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	};
	},{}],52:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = require("../core-js/object/define-property");
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				(0, _defineProperty2.default)(target, descriptor.key, descriptor);
			}
		}
	
		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();
	},{"../core-js/object/define-property":42}],53:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _assign = require("../core-js/object/assign");
	
	var _assign2 = _interopRequireDefault(_assign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = _assign2.default || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
	
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
	
		return target;
	};
	},{"../core-js/object/assign":40}],54:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _setPrototypeOf = require("../core-js/object/set-prototype-of");
	
	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);
	
	var _create = require("../core-js/object/create");
	
	var _create2 = _interopRequireDefault(_create);
	
	var _typeof2 = require("../helpers/typeof");
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
		}
	
		subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
	};
	},{"../core-js/object/create":41,"../core-js/object/set-prototype-of":45,"../helpers/typeof":58}],55:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _typeof2 = require("../helpers/typeof");
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}
	
		return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};
	},{"../helpers/typeof":58}],56:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _isIterable2 = require("../core-js/is-iterable");
	
	var _isIterable3 = _interopRequireDefault(_isIterable2);
	
	var _getIterator2 = require("../core-js/get-iterator");
	
	var _getIterator3 = _interopRequireDefault(_getIterator2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;
	
			try {
				for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);
	
					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}
	
			return _arr;
		}
	
		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if ((0, _isIterable3.default)(Object(arr))) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	}();
	},{"../core-js/get-iterator":36,"../core-js/is-iterable":37}],57:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _from = require("../core-js/array/from");
	
	var _from2 = _interopRequireDefault(_from);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (arr) {
		if (Array.isArray(arr)) {
			for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
				arr2[i] = arr[i];
			}
	
			return arr2;
		} else {
			return (0, _from2.default)(arr);
		}
	};
	},{"../core-js/array/from":35}],58:[function(require,module,exports){
	"use strict";
	
	exports.__esModule = true;
	
	var _iterator = require("../core-js/symbol/iterator");
	
	var _iterator2 = _interopRequireDefault(_iterator);
	
	var _symbol = require("../core-js/symbol");
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
		return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
		return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};
	},{"../core-js/symbol":49,"../core-js/symbol/iterator":50}],59:[function(require,module,exports){
	/*!
	 * Bowser - a browser detector
	 * https://github.com/ded/bowser
	 * MIT License | (c) Dustin Diaz 2015
	 */
	
	!function (root, name, definition) {
		if (typeof module != 'undefined' && module.exports) module.exports = definition()
		else if (typeof define == 'function' && define.amd) define(name, definition)
		else root[name] = definition()
	}(this, 'bowser', function () {
		/**
			* See useragents.js for examples of navigator.userAgent
			*/
	
		var t = true
	
		function detect(ua) {
	
			function getFirstMatch(regex) {
				var match = ua.match(regex);
				return (match && match.length > 1 && match[1]) || '';
			}
	
			function getSecondMatch(regex) {
				var match = ua.match(regex);
				return (match && match.length > 1 && match[2]) || '';
			}
	
			var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
				, likeAndroid = /like android/i.test(ua)
				, android = !likeAndroid && /android/i.test(ua)
				, nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
				, nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
				, chromeos = /CrOS/.test(ua)
				, silk = /silk/i.test(ua)
				, sailfish = /sailfish/i.test(ua)
				, tizen = /tizen/i.test(ua)
				, webos = /(web|hpw)os/i.test(ua)
				, windowsphone = /windows phone/i.test(ua)
				, samsungBrowser = /SamsungBrowser/i.test(ua)
				, windows = !windowsphone && /windows/i.test(ua)
				, mac = !iosdevice && !silk && /macintosh/i.test(ua)
				, linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
				, edgeVersion = getSecondMatch(/edg([ea]|ios)\/(\d+(\.\d+)?)/i)
				, versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
				, tablet = /tablet/i.test(ua) && !/tablet pc/i.test(ua)
				, mobile = !tablet && /[^-]mobi/i.test(ua)
				, xbox = /xbox/i.test(ua)
				, result
	
			if (/opera/i.test(ua)) {
				//  an old Opera
				result = {
					name: 'Opera'
				, opera: t
				, version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
				}
			} else if (/opr\/|opios/i.test(ua)) {
				// a new Opera
				result = {
					name: 'Opera'
					, opera: t
					, version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
				}
			}
			else if (/SamsungBrowser/i.test(ua)) {
				result = {
					name: 'Samsung Internet for Android'
					, samsungBrowser: t
					, version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
				}
			}
			else if (/coast/i.test(ua)) {
				result = {
					name: 'Opera Coast'
					, coast: t
					, version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
				}
			}
			else if (/yabrowser/i.test(ua)) {
				result = {
					name: 'Yandex Browser'
				, yandexbrowser: t
				, version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
				}
			}
			else if (/ucbrowser/i.test(ua)) {
				result = {
						name: 'UC Browser'
					, ucbrowser: t
					, version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
				}
			}
			else if (/mxios/i.test(ua)) {
				result = {
					name: 'Maxthon'
					, maxthon: t
					, version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
				}
			}
			else if (/epiphany/i.test(ua)) {
				result = {
					name: 'Epiphany'
					, epiphany: t
					, version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
				}
			}
			else if (/puffin/i.test(ua)) {
				result = {
					name: 'Puffin'
					, puffin: t
					, version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
				}
			}
			else if (/sleipnir/i.test(ua)) {
				result = {
					name: 'Sleipnir'
					, sleipnir: t
					, version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
				}
			}
			else if (/k-meleon/i.test(ua)) {
				result = {
					name: 'K-Meleon'
					, kMeleon: t
					, version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
				}
			}
			else if (windowsphone) {
				result = {
					name: 'Windows Phone'
				, osname: 'Windows Phone'
				, windowsphone: t
				}
				if (edgeVersion) {
					result.msedge = t
					result.version = edgeVersion
				}
				else {
					result.msie = t
					result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
				}
			}
			else if (/msie|trident/i.test(ua)) {
				result = {
					name: 'Internet Explorer'
				, msie: t
				, version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
				}
			} else if (chromeos) {
				result = {
					name: 'Chrome'
				, osname: 'Chrome OS'
				, chromeos: t
				, chromeBook: t
				, chrome: t
				, version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
				}
			} else if (/edg([ea]|ios)/i.test(ua)) {
				result = {
					name: 'Microsoft Edge'
				, msedge: t
				, version: edgeVersion
				}
			}
			else if (/vivaldi/i.test(ua)) {
				result = {
					name: 'Vivaldi'
					, vivaldi: t
					, version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
				}
			}
			else if (sailfish) {
				result = {
					name: 'Sailfish'
				, osname: 'Sailfish OS'
				, sailfish: t
				, version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
				}
			}
			else if (/seamonkey\//i.test(ua)) {
				result = {
					name: 'SeaMonkey'
				, seamonkey: t
				, version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
				}
			}
			else if (/firefox|iceweasel|fxios/i.test(ua)) {
				result = {
					name: 'Firefox'
				, firefox: t
				, version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
				}
				if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
					result.firefoxos = t
					result.osname = 'Firefox OS'
				}
			}
			else if (silk) {
				result =  {
					name: 'Amazon Silk'
				, silk: t
				, version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
				}
			}
			else if (/phantom/i.test(ua)) {
				result = {
					name: 'PhantomJS'
				, phantom: t
				, version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
				}
			}
			else if (/slimerjs/i.test(ua)) {
				result = {
					name: 'SlimerJS'
					, slimer: t
					, version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
				}
			}
			else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
				result = {
					name: 'BlackBerry'
				, osname: 'BlackBerry OS'
				, blackberry: t
				, version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
				}
			}
			else if (webos) {
				result = {
					name: 'WebOS'
				, osname: 'WebOS'
				, webos: t
				, version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
				};
				/touchpad\//i.test(ua) && (result.touchpad = t)
			}
			else if (/bada/i.test(ua)) {
				result = {
					name: 'Bada'
				, osname: 'Bada'
				, bada: t
				, version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
				};
			}
			else if (tizen) {
				result = {
					name: 'Tizen'
				, osname: 'Tizen'
				, tizen: t
				, version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
				};
			}
			else if (/qupzilla/i.test(ua)) {
				result = {
					name: 'QupZilla'
					, qupzilla: t
					, version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
				}
			}
			else if (/chromium/i.test(ua)) {
				result = {
					name: 'Chromium'
					, chromium: t
					, version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
				}
			}
			else if (/chrome|crios|crmo/i.test(ua)) {
				result = {
					name: 'Chrome'
					, chrome: t
					, version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
				}
			}
			else if (android) {
				result = {
					name: 'Android'
					, version: versionIdentifier
				}
			}
			else if (/safari|applewebkit/i.test(ua)) {
				result = {
					name: 'Safari'
				, safari: t
				}
				if (versionIdentifier) {
					result.version = versionIdentifier
				}
			}
			else if (iosdevice) {
				result = {
					name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
				}
				// WTF: version is not part of user agent in web apps
				if (versionIdentifier) {
					result.version = versionIdentifier
				}
			}
			else if(/googlebot/i.test(ua)) {
				result = {
					name: 'Googlebot'
				, googlebot: t
				, version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
				}
			}
			else {
				result = {
					name: getFirstMatch(/^(.*)\/(.*) /),
					version: getSecondMatch(/^(.*)\/(.*) /)
			 };
		 }
	
			// set webkit or gecko flag for browsers based on these engines
			if (!result.msedge && /(apple)?webkit/i.test(ua)) {
				if (/(apple)?webkit\/537\.36/i.test(ua)) {
					result.name = result.name || "Blink"
					result.blink = t
				} else {
					result.name = result.name || "Webkit"
					result.webkit = t
				}
				if (!result.version && versionIdentifier) {
					result.version = versionIdentifier
				}
			} else if (!result.opera && /gecko\//i.test(ua)) {
				result.name = result.name || "Gecko"
				result.gecko = t
				result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
			}
	
			// set OS flags for platforms that have multiple browsers
			if (!result.windowsphone && (android || result.silk)) {
				result.android = t
				result.osname = 'Android'
			} else if (!result.windowsphone && iosdevice) {
				result[iosdevice] = t
				result.ios = t
				result.osname = 'iOS'
			} else if (mac) {
				result.mac = t
				result.osname = 'macOS'
			} else if (xbox) {
				result.xbox = t
				result.osname = 'Xbox'
			} else if (windows) {
				result.windows = t
				result.osname = 'Windows'
			} else if (linux) {
				result.linux = t
				result.osname = 'Linux'
			}
	
			function getWindowsVersion (s) {
				switch (s) {
					case 'NT': return 'NT'
					case 'XP': return 'XP'
					case 'NT 5.0': return '2000'
					case 'NT 5.1': return 'XP'
					case 'NT 5.2': return '2003'
					case 'NT 6.0': return 'Vista'
					case 'NT 6.1': return '7'
					case 'NT 6.2': return '8'
					case 'NT 6.3': return '8.1'
					case 'NT 10.0': return '10'
					default: return undefined
				}
			}
	
			// OS version extraction
			var osVersion = '';
			if (result.windows) {
				osVersion = getWindowsVersion(getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i))
			} else if (result.windowsphone) {
				osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
			} else if (result.mac) {
				osVersion = getFirstMatch(/Mac OS X (\d+([_\.\s]\d+)*)/i);
				osVersion = osVersion.replace(/[_\s]/g, '.');
			} else if (iosdevice) {
				osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
				osVersion = osVersion.replace(/[_\s]/g, '.');
			} else if (android) {
				osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
			} else if (result.webos) {
				osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
			} else if (result.blackberry) {
				osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
			} else if (result.bada) {
				osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
			} else if (result.tizen) {
				osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
			}
			if (osVersion) {
				result.osversion = osVersion;
			}
	
			// device type extraction
			var osMajorVersion = !result.windows && osVersion.split('.')[0];
			if (
					 tablet
				|| nexusTablet
				|| iosdevice == 'ipad'
				|| (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
				|| result.silk
			) {
				result.tablet = t
			} else if (
					 mobile
				|| iosdevice == 'iphone'
				|| iosdevice == 'ipod'
				|| android
				|| nexusMobile
				|| result.blackberry
				|| result.webos
				|| result.bada
			) {
				result.mobile = t
			}
	
			// Graded Browser Support
			// http://developer.yahoo.com/yui/articles/gbs
			if (result.msedge ||
					(result.msie && result.version >= 10) ||
					(result.yandexbrowser && result.version >= 15) ||
					(result.vivaldi && result.version >= 1.0) ||
					(result.chrome && result.version >= 20) ||
					(result.samsungBrowser && result.version >= 4) ||
					(result.firefox && result.version >= 20.0) ||
					(result.safari && result.version >= 6) ||
					(result.opera && result.version >= 10.0) ||
					(result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
					(result.blackberry && result.version >= 10.1)
					|| (result.chromium && result.version >= 20)
					) {
				result.a = t;
			}
			else if ((result.msie && result.version < 10) ||
					(result.chrome && result.version < 20) ||
					(result.firefox && result.version < 20.0) ||
					(result.safari && result.version < 6) ||
					(result.opera && result.version < 10.0) ||
					(result.ios && result.osversion && result.osversion.split(".")[0] < 6)
					|| (result.chromium && result.version < 20)
					) {
				result.c = t
			} else result.x = t
	
			return result
		}
	
		var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')
	
		bowser.test = function (browserList) {
			for (var i = 0; i < browserList.length; ++i) {
				var browserItem = browserList[i];
				if (typeof browserItem=== 'string') {
					if (browserItem in bowser) {
						return true;
					}
				}
			}
			return false;
		}
	
		/**
		 * Get version precisions count
		 *
		 * @example
		 *   getVersionPrecision("1.10.3") // 3
		 *
		 * @param  {string} version
		 * @return {number}
		 */
		function getVersionPrecision(version) {
			return version.split(".").length;
		}
	
		/**
		 * Array::map polyfill
		 *
		 * @param  {Array} arr
		 * @param  {Function} iterator
		 * @return {Array}
		 */
		function map(arr, iterator) {
			var result = [], i;
			if (Array.prototype.map) {
				return Array.prototype.map.call(arr, iterator);
			}
			for (i = 0; i < arr.length; i++) {
				result.push(iterator(arr[i]));
			}
			return result;
		}
	
		/**
		 * Calculate browser version weight
		 *
		 * @example
		 *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
		 *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
		 *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
		 *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
		 *
		 * @param  {Array<String>} versions versions to compare
		 * @return {Number} comparison result
		 */
		function compareVersions(versions) {
			// 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
			var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
			var chunks = map(versions, function (version) {
				var delta = precision - getVersionPrecision(version);
	
				// 2) "9" -> "9.0" (for precision = 2)
				version = version + new Array(delta + 1).join(".0");
	
				// 3) "9.0" -> ["000000000"", "000000009"]
				return map(version.split("."), function (chunk) {
					return new Array(20 - chunk.length).join("0") + chunk;
				}).reverse();
			});
	
			// iterate in reverse order by reversed chunks array
			while (--precision >= 0) {
				// 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
				if (chunks[0][precision] > chunks[1][precision]) {
					return 1;
				}
				else if (chunks[0][precision] === chunks[1][precision]) {
					if (precision === 0) {
						// all version chunks are same
						return 0;
					}
				}
				else {
					return -1;
				}
			}
		}
	
		/**
		 * Check if browser is unsupported
		 *
		 * @example
		 *   bowser.isUnsupportedBrowser({
		 *     msie: "10",
		 *     firefox: "23",
		 *     chrome: "29",
		 *     safari: "5.1",
		 *     opera: "16",
		 *     phantom: "534"
		 *   });
		 *
		 * @param  {Object}  minVersions map of minimal version to browser
		 * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
		 * @param  {String}  [ua] user agent string
		 * @return {Boolean}
		 */
		function isUnsupportedBrowser(minVersions, strictMode, ua) {
			var _bowser = bowser;
	
			// make strictMode param optional with ua param usage
			if (typeof strictMode === 'string') {
				ua = strictMode;
				strictMode = void(0);
			}
	
			if (strictMode === void(0)) {
				strictMode = false;
			}
			if (ua) {
				_bowser = detect(ua);
			}
	
			var version = "" + _bowser.version;
			for (var browser in minVersions) {
				if (minVersions.hasOwnProperty(browser)) {
					if (_bowser[browser]) {
						if (typeof minVersions[browser] !== 'string') {
							throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
						}
	
						// browser version and min supported version.
						return compareVersions([version, minVersions[browser]]) < 0;
					}
				}
			}
	
			return strictMode; // not found
		}
	
		/**
		 * Check if browser is supported
		 *
		 * @param  {Object} minVersions map of minimal version to browser
		 * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
		 * @param  {String}  [ua] user agent string
		 * @return {Boolean}
		 */
		function check(minVersions, strictMode, ua) {
			return !isUnsupportedBrowser(minVersions, strictMode, ua);
		}
	
		bowser.isUnsupportedBrowser = isUnsupportedBrowser;
		bowser.compareVersions = compareVersions;
		bowser.check = check;
	
		/*
		 * Set our detect method to the main bowser object so we can
		 * reuse it to test other user agents.
		 * This is needed to implement future tests.
		 */
		bowser._detect = detect;
	
		/*
		 * Set our detect public method to the main bowser object
		 * This is needed to implement bowser in server side
		 */
		bowser.detect = detect;
		return bowser
	});
	
	},{}],60:[function(require,module,exports){
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	var objectCreate = Object.create || objectCreatePolyfill
	var objectKeys = Object.keys || objectKeysPolyfill
	var bind = Function.prototype.bind || functionBindPolyfill
	
	function EventEmitter() {
		if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
			this._events = objectCreate(null);
			this._eventsCount = 0;
		}
	
		this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	var defaultMaxListeners = 10;
	
	var hasDefineProperty;
	try {
		var o = {};
		if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
		hasDefineProperty = o.x === 0;
	} catch (err) { hasDefineProperty = false }
	if (hasDefineProperty) {
		Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
			enumerable: true,
			get: function() {
				return defaultMaxListeners;
			},
			set: function(arg) {
				// check whether the input is a positive number (whose value is zero or
				// greater and not a NaN).
				if (typeof arg !== 'number' || arg < 0 || arg !== arg)
					throw new TypeError('"defaultMaxListeners" must be a positive number');
				defaultMaxListeners = arg;
			}
		});
	} else {
		EventEmitter.defaultMaxListeners = defaultMaxListeners;
	}
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
		if (typeof n !== 'number' || n < 0 || isNaN(n))
			throw new TypeError('"n" argument must be a positive number');
		this._maxListeners = n;
		return this;
	};
	
	function $getMaxListeners(that) {
		if (that._maxListeners === undefined)
			return EventEmitter.defaultMaxListeners;
		return that._maxListeners;
	}
	
	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
		return $getMaxListeners(this);
	};
	
	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
		if (isFn)
			handler.call(self);
		else {
			var len = handler.length;
			var listeners = arrayClone(handler, len);
			for (var i = 0; i < len; ++i)
				listeners[i].call(self);
		}
	}
	function emitOne(handler, isFn, self, arg1) {
		if (isFn)
			handler.call(self, arg1);
		else {
			var len = handler.length;
			var listeners = arrayClone(handler, len);
			for (var i = 0; i < len; ++i)
				listeners[i].call(self, arg1);
		}
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
		if (isFn)
			handler.call(self, arg1, arg2);
		else {
			var len = handler.length;
			var listeners = arrayClone(handler, len);
			for (var i = 0; i < len; ++i)
				listeners[i].call(self, arg1, arg2);
		}
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
		if (isFn)
			handler.call(self, arg1, arg2, arg3);
		else {
			var len = handler.length;
			var listeners = arrayClone(handler, len);
			for (var i = 0; i < len; ++i)
				listeners[i].call(self, arg1, arg2, arg3);
		}
	}
	
	function emitMany(handler, isFn, self, args) {
		if (isFn)
			handler.apply(self, args);
		else {
			var len = handler.length;
			var listeners = arrayClone(handler, len);
			for (var i = 0; i < len; ++i)
				listeners[i].apply(self, args);
		}
	}
	
	EventEmitter.prototype.emit = function emit(type) {
		var er, handler, len, args, i, events;
		var doError = (type === 'error');
	
		events = this._events;
		if (events)
			doError = (doError && events.error == null);
		else if (!doError)
			return false;
	
		// If there is no 'error' event listener then throw.
		if (doError) {
			if (arguments.length > 1)
				er = arguments[1];
			if (er instanceof Error) {
				throw er; // Unhandled 'error' event
			} else {
				// At least give some kind of context to the user
				var err = new Error('Unhandled "error" event. (' + er + ')');
				err.context = er;
				throw err;
			}
			return false;
		}
	
		handler = events[type];
	
		if (!handler)
			return false;
	
		var isFn = typeof handler === 'function';
		len = arguments.length;
		switch (len) {
				// fast cases
			case 1:
				emitNone(handler, isFn, this);
				break;
			case 2:
				emitOne(handler, isFn, this, arguments[1]);
				break;
			case 3:
				emitTwo(handler, isFn, this, arguments[1], arguments[2]);
				break;
			case 4:
				emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
				break;
				// slower
			default:
				args = new Array(len - 1);
				for (i = 1; i < len; i++)
					args[i - 1] = arguments[i];
				emitMany(handler, isFn, this, args);
		}
	
		return true;
	};
	
	function _addListener(target, type, listener, prepend) {
		var m;
		var events;
		var existing;
	
		if (typeof listener !== 'function')
			throw new TypeError('"listener" argument must be a function');
	
		events = target._events;
		if (!events) {
			events = target._events = objectCreate(null);
			target._eventsCount = 0;
		} else {
			// To avoid recursion in the case that type === "newListener"! Before
			// adding it to the listeners, first emit "newListener".
			if (events.newListener) {
				target.emit('newListener', type,
						listener.listener ? listener.listener : listener);
	
				// Re-assign `events` because a newListener handler could have caused the
				// this._events to be assigned to a new object
				events = target._events;
			}
			existing = events[type];
		}
	
		if (!existing) {
			// Optimize the case of one listener. Don't need the extra array object.
			existing = events[type] = listener;
			++target._eventsCount;
		} else {
			if (typeof existing === 'function') {
				// Adding the second element, need to change to array.
				existing = events[type] =
						prepend ? [listener, existing] : [existing, listener];
			} else {
				// If we've already got an array, just append.
				if (prepend) {
					existing.unshift(listener);
				} else {
					existing.push(listener);
				}
			}
	
			// Check for listener leak
			if (!existing.warned) {
				m = $getMaxListeners(target);
				if (m && m > 0 && existing.length > m) {
					existing.warned = true;
					var w = new Error('Possible EventEmitter memory leak detected. ' +
							existing.length + ' "' + String(type) + '" listeners ' +
							'added. Use emitter.setMaxListeners() to ' +
							'increase limit.');
					w.name = 'MaxListenersExceededWarning';
					w.emitter = target;
					w.type = type;
					w.count = existing.length;
					if (typeof console === 'object' && console.warn) {
						console.warn('%s: %s', w.name, w.message);
					}
				}
			}
		}
	
		return target;
	}
	
	EventEmitter.prototype.addListener = function addListener(type, listener) {
		return _addListener(this, type, listener, false);
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.prependListener =
			function prependListener(type, listener) {
				return _addListener(this, type, listener, true);
			};
	
	function onceWrapper() {
		if (!this.fired) {
			this.target.removeListener(this.type, this.wrapFn);
			this.fired = true;
			switch (arguments.length) {
				case 0:
					return this.listener.call(this.target);
				case 1:
					return this.listener.call(this.target, arguments[0]);
				case 2:
					return this.listener.call(this.target, arguments[0], arguments[1]);
				case 3:
					return this.listener.call(this.target, arguments[0], arguments[1],
							arguments[2]);
				default:
					var args = new Array(arguments.length);
					for (var i = 0; i < args.length; ++i)
						args[i] = arguments[i];
					this.listener.apply(this.target, args);
			}
		}
	}
	
	function _onceWrap(target, type, listener) {
		var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
		var wrapped = bind.call(onceWrapper, state);
		wrapped.listener = listener;
		state.wrapFn = wrapped;
		return wrapped;
	}
	
	EventEmitter.prototype.once = function once(type, listener) {
		if (typeof listener !== 'function')
			throw new TypeError('"listener" argument must be a function');
		this.on(type, _onceWrap(this, type, listener));
		return this;
	};
	
	EventEmitter.prototype.prependOnceListener =
			function prependOnceListener(type, listener) {
				if (typeof listener !== 'function')
					throw new TypeError('"listener" argument must be a function');
				this.prependListener(type, _onceWrap(this, type, listener));
				return this;
			};
	
	// Emits a 'removeListener' event if and only if the listener was removed.
	EventEmitter.prototype.removeListener =
			function removeListener(type, listener) {
				var list, events, position, i, originalListener;
	
				if (typeof listener !== 'function')
					throw new TypeError('"listener" argument must be a function');
	
				events = this._events;
				if (!events)
					return this;
	
				list = events[type];
				if (!list)
					return this;
	
				if (list === listener || list.listener === listener) {
					if (--this._eventsCount === 0)
						this._events = objectCreate(null);
					else {
						delete events[type];
						if (events.removeListener)
							this.emit('removeListener', type, list.listener || listener);
					}
				} else if (typeof list !== 'function') {
					position = -1;
	
					for (i = list.length - 1; i >= 0; i--) {
						if (list[i] === listener || list[i].listener === listener) {
							originalListener = list[i].listener;
							position = i;
							break;
						}
					}
	
					if (position < 0)
						return this;
	
					if (position === 0)
						list.shift();
					else
						spliceOne(list, position);
	
					if (list.length === 1)
						events[type] = list[0];
	
					if (events.removeListener)
						this.emit('removeListener', type, originalListener || listener);
				}
	
				return this;
			};
	
	EventEmitter.prototype.removeAllListeners =
			function removeAllListeners(type) {
				var listeners, events, i;
	
				events = this._events;
				if (!events)
					return this;
	
				// not listening for removeListener, no need to emit
				if (!events.removeListener) {
					if (arguments.length === 0) {
						this._events = objectCreate(null);
						this._eventsCount = 0;
					} else if (events[type]) {
						if (--this._eventsCount === 0)
							this._events = objectCreate(null);
						else
							delete events[type];
					}
					return this;
				}
	
				// emit removeListener for all listeners on all events
				if (arguments.length === 0) {
					var keys = objectKeys(events);
					var key;
					for (i = 0; i < keys.length; ++i) {
						key = keys[i];
						if (key === 'removeListener') continue;
						this.removeAllListeners(key);
					}
					this.removeAllListeners('removeListener');
					this._events = objectCreate(null);
					this._eventsCount = 0;
					return this;
				}
	
				listeners = events[type];
	
				if (typeof listeners === 'function') {
					this.removeListener(type, listeners);
				} else if (listeners) {
					// LIFO order
					for (i = listeners.length - 1; i >= 0; i--) {
						this.removeListener(type, listeners[i]);
					}
				}
	
				return this;
			};
	
	EventEmitter.prototype.listeners = function listeners(type) {
		var evlistener;
		var ret;
		var events = this._events;
	
		if (!events)
			ret = [];
		else {
			evlistener = events[type];
			if (!evlistener)
				ret = [];
			else if (typeof evlistener === 'function')
				ret = [evlistener.listener || evlistener];
			else
				ret = unwrapListeners(evlistener);
		}
	
		return ret;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
		if (typeof emitter.listenerCount === 'function') {
			return emitter.listenerCount(type);
		} else {
			return listenerCount.call(emitter, type);
		}
	};
	
	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
		var events = this._events;
	
		if (events) {
			var evlistener = events[type];
	
			if (typeof evlistener === 'function') {
				return 1;
			} else if (evlistener) {
				return evlistener.length;
			}
		}
	
		return 0;
	}
	
	EventEmitter.prototype.eventNames = function eventNames() {
		return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};
	
	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
		for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
			list[i] = list[k];
		list.pop();
	}
	
	function arrayClone(arr, n) {
		var copy = new Array(n);
		for (var i = 0; i < n; ++i)
			copy[i] = arr[i];
		return copy;
	}
	
	function unwrapListeners(arr) {
		var ret = new Array(arr.length);
		for (var i = 0; i < ret.length; ++i) {
			ret[i] = arr[i].listener || arr[i];
		}
		return ret;
	}
	
	function objectCreatePolyfill(proto) {
		var F = function() {};
		F.prototype = proto;
		return new F;
	}
	function objectKeysPolyfill(obj) {
		var keys = [];
		for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
			keys.push(k);
		}
		return k;
	}
	function functionBindPolyfill(context) {
		var fn = this;
		return function () {
			return fn.apply(context, arguments);
		};
	}
	
	},{}],61:[function(require,module,exports){
	require('../../modules/es6.string.iterator');
	require('../../modules/es6.array.from');
	module.exports = require('../../modules/_core').Array.from;
	
	},{"../../modules/_core":91,"../../modules/es6.array.from":166,"../../modules/es6.string.iterator":178}],62:[function(require,module,exports){
	require('../modules/web.dom.iterable');
	require('../modules/es6.string.iterator');
	module.exports = require('../modules/core.get-iterator');
	
	},{"../modules/core.get-iterator":164,"../modules/es6.string.iterator":178,"../modules/web.dom.iterable":191}],63:[function(require,module,exports){
	require('../modules/web.dom.iterable');
	require('../modules/es6.string.iterator');
	module.exports = require('../modules/core.is-iterable');
	
	},{"../modules/core.is-iterable":165,"../modules/es6.string.iterator":178,"../modules/web.dom.iterable":191}],64:[function(require,module,exports){
	var core = require('../../modules/_core');
	var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
	module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
		return $JSON.stringify.apply($JSON, arguments);
	};
	
	},{"../../modules/_core":91}],65:[function(require,module,exports){
	require('../modules/es6.object.to-string');
	require('../modules/es6.string.iterator');
	require('../modules/web.dom.iterable');
	require('../modules/es6.map');
	require('../modules/es7.map.to-json');
	require('../modules/es7.map.of');
	require('../modules/es7.map.from');
	module.exports = require('../modules/_core').Map;
	
	},{"../modules/_core":91,"../modules/es6.map":168,"../modules/es6.object.to-string":175,"../modules/es6.string.iterator":178,"../modules/es7.map.from":180,"../modules/es7.map.of":181,"../modules/es7.map.to-json":182,"../modules/web.dom.iterable":191}],66:[function(require,module,exports){
	require('../../modules/es6.object.assign');
	module.exports = require('../../modules/_core').Object.assign;
	
	},{"../../modules/_core":91,"../../modules/es6.object.assign":169}],67:[function(require,module,exports){
	require('../../modules/es6.object.create');
	var $Object = require('../../modules/_core').Object;
	module.exports = function create(P, D) {
		return $Object.create(P, D);
	};
	
	},{"../../modules/_core":91,"../../modules/es6.object.create":170}],68:[function(require,module,exports){
	require('../../modules/es6.object.define-property');
	var $Object = require('../../modules/_core').Object;
	module.exports = function defineProperty(it, key, desc) {
		return $Object.defineProperty(it, key, desc);
	};
	
	},{"../../modules/_core":91,"../../modules/es6.object.define-property":171}],69:[function(require,module,exports){
	require('../../modules/es6.object.get-prototype-of');
	module.exports = require('../../modules/_core').Object.getPrototypeOf;
	
	},{"../../modules/_core":91,"../../modules/es6.object.get-prototype-of":172}],70:[function(require,module,exports){
	require('../../modules/es6.object.keys');
	module.exports = require('../../modules/_core').Object.keys;
	
	},{"../../modules/_core":91,"../../modules/es6.object.keys":173}],71:[function(require,module,exports){
	require('../../modules/es6.object.set-prototype-of');
	module.exports = require('../../modules/_core').Object.setPrototypeOf;
	
	},{"../../modules/_core":91,"../../modules/es6.object.set-prototype-of":174}],72:[function(require,module,exports){
	require('../../modules/es7.object.values');
	module.exports = require('../../modules/_core').Object.values;
	
	},{"../../modules/_core":91,"../../modules/es7.object.values":183}],73:[function(require,module,exports){
	require('../modules/es6.object.to-string');
	require('../modules/es6.string.iterator');
	require('../modules/web.dom.iterable');
	require('../modules/es6.promise');
	require('../modules/es7.promise.finally');
	require('../modules/es7.promise.try');
	module.exports = require('../modules/_core').Promise;
	
	},{"../modules/_core":91,"../modules/es6.object.to-string":175,"../modules/es6.promise":176,"../modules/es6.string.iterator":178,"../modules/es7.promise.finally":184,"../modules/es7.promise.try":185,"../modules/web.dom.iterable":191}],74:[function(require,module,exports){
	require('../modules/es6.object.to-string');
	require('../modules/es6.string.iterator');
	require('../modules/web.dom.iterable');
	require('../modules/es6.set');
	require('../modules/es7.set.to-json');
	require('../modules/es7.set.of');
	require('../modules/es7.set.from');
	module.exports = require('../modules/_core').Set;
	
	},{"../modules/_core":91,"../modules/es6.object.to-string":175,"../modules/es6.set":177,"../modules/es6.string.iterator":178,"../modules/es7.set.from":186,"../modules/es7.set.of":187,"../modules/es7.set.to-json":188,"../modules/web.dom.iterable":191}],75:[function(require,module,exports){
	require('../../modules/es6.symbol');
	require('../../modules/es6.object.to-string');
	require('../../modules/es7.symbol.async-iterator');
	require('../../modules/es7.symbol.observable');
	module.exports = require('../../modules/_core').Symbol;
	
	},{"../../modules/_core":91,"../../modules/es6.object.to-string":175,"../../modules/es6.symbol":179,"../../modules/es7.symbol.async-iterator":189,"../../modules/es7.symbol.observable":190}],76:[function(require,module,exports){
	require('../../modules/es6.string.iterator');
	require('../../modules/web.dom.iterable');
	module.exports = require('../../modules/_wks-ext').f('iterator');
	
	},{"../../modules/_wks-ext":161,"../../modules/es6.string.iterator":178,"../../modules/web.dom.iterable":191}],77:[function(require,module,exports){
	module.exports = function (it) {
		if (typeof it != 'function') throw TypeError(it + ' is not a function!');
		return it;
	};
	
	},{}],78:[function(require,module,exports){
	module.exports = function () { /* empty */ };
	
	},{}],79:[function(require,module,exports){
	module.exports = function (it, Constructor, name, forbiddenField) {
		if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
			throw TypeError(name + ': incorrect invocation!');
		} return it;
	};
	
	},{}],80:[function(require,module,exports){
	var isObject = require('./_is-object');
	module.exports = function (it) {
		if (!isObject(it)) throw TypeError(it + ' is not an object!');
		return it;
	};
	
	},{"./_is-object":111}],81:[function(require,module,exports){
	var forOf = require('./_for-of');
	
	module.exports = function (iter, ITERATOR) {
		var result = [];
		forOf(iter, false, result.push, result, ITERATOR);
		return result;
	};
	
	},{"./_for-of":101}],82:[function(require,module,exports){
	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = require('./_to-iobject');
	var toLength = require('./_to-length');
	var toAbsoluteIndex = require('./_to-absolute-index');
	module.exports = function (IS_INCLUDES) {
		return function ($this, el, fromIndex) {
			var O = toIObject($this);
			var length = toLength(O.length);
			var index = toAbsoluteIndex(fromIndex, length);
			var value;
			// Array#includes uses SameValueZero equality algorithm
			// eslint-disable-next-line no-self-compare
			if (IS_INCLUDES && el != el) while (length > index) {
				value = O[index++];
				// eslint-disable-next-line no-self-compare
				if (value != value) return true;
			// Array#indexOf ignores holes, Array#includes - not
			} else for (;length > index; index++) if (IS_INCLUDES || index in O) {
				if (O[index] === el) return IS_INCLUDES || index || 0;
			} return !IS_INCLUDES && -1;
		};
	};
	
	},{"./_to-absolute-index":152,"./_to-iobject":154,"./_to-length":155}],83:[function(require,module,exports){
	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx = require('./_ctx');
	var IObject = require('./_iobject');
	var toObject = require('./_to-object');
	var toLength = require('./_to-length');
	var asc = require('./_array-species-create');
	module.exports = function (TYPE, $create) {
		var IS_MAP = TYPE == 1;
		var IS_FILTER = TYPE == 2;
		var IS_SOME = TYPE == 3;
		var IS_EVERY = TYPE == 4;
		var IS_FIND_INDEX = TYPE == 6;
		var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
		var create = $create || asc;
		return function ($this, callbackfn, that) {
			var O = toObject($this);
			var self = IObject(O);
			var f = ctx(callbackfn, that, 3);
			var length = toLength(self.length);
			var index = 0;
			var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
			var val, res;
			for (;length > index; index++) if (NO_HOLES || index in self) {
				val = self[index];
				res = f(val, index, O);
				if (TYPE) {
					if (IS_MAP) result[index] = res;   // map
					else if (res) switch (TYPE) {
						case 3: return true;             // some
						case 5: return val;              // find
						case 6: return index;            // findIndex
						case 2: result.push(val);        // filter
					} else if (IS_EVERY) return false; // every
				}
			}
			return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
		};
	};
	
	},{"./_array-species-create":85,"./_ctx":93,"./_iobject":108,"./_to-length":155,"./_to-object":156}],84:[function(require,module,exports){
	var isObject = require('./_is-object');
	var isArray = require('./_is-array');
	var SPECIES = require('./_wks')('species');
	
	module.exports = function (original) {
		var C;
		if (isArray(original)) {
			C = original.constructor;
			// cross-realm fallback
			if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
			if (isObject(C)) {
				C = C[SPECIES];
				if (C === null) C = undefined;
			}
		} return C === undefined ? Array : C;
	};
	
	},{"./_is-array":110,"./_is-object":111,"./_wks":162}],85:[function(require,module,exports){
	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = require('./_array-species-constructor');
	
	module.exports = function (original, length) {
		return new (speciesConstructor(original))(length);
	};
	
	},{"./_array-species-constructor":84}],86:[function(require,module,exports){
	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = require('./_cof');
	var TAG = require('./_wks')('toStringTag');
	// ES3 wrong here
	var ARG = cof(function () { return arguments; }()) == 'Arguments';
	
	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
		try {
			return it[key];
		} catch (e) { /* empty */ }
	};
	
	module.exports = function (it) {
		var O, T, B;
		return it === undefined ? 'Undefined' : it === null ? 'Null'
			// @@toStringTag case
			: typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
			// builtinTag case
			: ARG ? cof(O)
			// ES3 arguments fallback
			: (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};
	
	},{"./_cof":87,"./_wks":162}],87:[function(require,module,exports){
	var toString = {}.toString;
	
	module.exports = function (it) {
		return toString.call(it).slice(8, -1);
	};
	
	},{}],88:[function(require,module,exports){
	'use strict';
	var dP = require('./_object-dp').f;
	var create = require('./_object-create');
	var redefineAll = require('./_redefine-all');
	var ctx = require('./_ctx');
	var anInstance = require('./_an-instance');
	var forOf = require('./_for-of');
	var $iterDefine = require('./_iter-define');
	var step = require('./_iter-step');
	var setSpecies = require('./_set-species');
	var DESCRIPTORS = require('./_descriptors');
	var fastKey = require('./_meta').fastKey;
	var validate = require('./_validate-collection');
	var SIZE = DESCRIPTORS ? '_s' : 'size';
	
	var getEntry = function (that, key) {
		// fast case
		var index = fastKey(key);
		var entry;
		if (index !== 'F') return that._i[index];
		// frozen object case
		for (entry = that._f; entry; entry = entry.n) {
			if (entry.k == key) return entry;
		}
	};
	
	module.exports = {
		getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
			var C = wrapper(function (that, iterable) {
				anInstance(that, C, NAME, '_i');
				that._t = NAME;         // collection type
				that._i = create(null); // index
				that._f = undefined;    // first entry
				that._l = undefined;    // last entry
				that[SIZE] = 0;         // size
				if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
			});
			redefineAll(C.prototype, {
				// 23.1.3.1 Map.prototype.clear()
				// 23.2.3.2 Set.prototype.clear()
				clear: function clear() {
					for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
						entry.r = true;
						if (entry.p) entry.p = entry.p.n = undefined;
						delete data[entry.i];
					}
					that._f = that._l = undefined;
					that[SIZE] = 0;
				},
				// 23.1.3.3 Map.prototype.delete(key)
				// 23.2.3.4 Set.prototype.delete(value)
				'delete': function (key) {
					var that = validate(this, NAME);
					var entry = getEntry(that, key);
					if (entry) {
						var next = entry.n;
						var prev = entry.p;
						delete that._i[entry.i];
						entry.r = true;
						if (prev) prev.n = next;
						if (next) next.p = prev;
						if (that._f == entry) that._f = next;
						if (that._l == entry) that._l = prev;
						that[SIZE]--;
					} return !!entry;
				},
				// 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
				// 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
				forEach: function forEach(callbackfn /* , that = undefined */) {
					validate(this, NAME);
					var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
					var entry;
					while (entry = entry ? entry.n : this._f) {
						f(entry.v, entry.k, this);
						// revert to the last existing entry
						while (entry && entry.r) entry = entry.p;
					}
				},
				// 23.1.3.7 Map.prototype.has(key)
				// 23.2.3.7 Set.prototype.has(value)
				has: function has(key) {
					return !!getEntry(validate(this, NAME), key);
				}
			});
			if (DESCRIPTORS) dP(C.prototype, 'size', {
				get: function () {
					return validate(this, NAME)[SIZE];
				}
			});
			return C;
		},
		def: function (that, key, value) {
			var entry = getEntry(that, key);
			var prev, index;
			// change existing entry
			if (entry) {
				entry.v = value;
			// create new entry
			} else {
				that._l = entry = {
					i: index = fastKey(key, true), // <- index
					k: key,                        // <- key
					v: value,                      // <- value
					p: prev = that._l,             // <- previous entry
					n: undefined,                  // <- next entry
					r: false                       // <- removed
				};
				if (!that._f) that._f = entry;
				if (prev) prev.n = entry;
				that[SIZE]++;
				// add to index
				if (index !== 'F') that._i[index] = entry;
			} return that;
		},
		getEntry: getEntry,
		setStrong: function (C, NAME, IS_MAP) {
			// add .keys, .values, .entries, [@@iterator]
			// 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
			$iterDefine(C, NAME, function (iterated, kind) {
				this._t = validate(iterated, NAME); // target
				this._k = kind;                     // kind
				this._l = undefined;                // previous
			}, function () {
				var that = this;
				var kind = that._k;
				var entry = that._l;
				// revert to the last existing entry
				while (entry && entry.r) entry = entry.p;
				// get next entry
				if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
					// or finish the iteration
					that._t = undefined;
					return step(1);
				}
				// return step by kind
				if (kind == 'keys') return step(0, entry.k);
				if (kind == 'values') return step(0, entry.v);
				return step(0, [entry.k, entry.v]);
			}, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
	
			// add [@@species], 23.1.2.2, 23.2.2.2
			setSpecies(NAME);
		}
	};
	
	},{"./_an-instance":79,"./_ctx":93,"./_descriptors":95,"./_for-of":101,"./_iter-define":114,"./_iter-step":116,"./_meta":120,"./_object-create":124,"./_object-dp":125,"./_redefine-all":140,"./_set-species":145,"./_validate-collection":159}],89:[function(require,module,exports){
	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = require('./_classof');
	var from = require('./_array-from-iterable');
	module.exports = function (NAME) {
		return function toJSON() {
			if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
			return from(this);
		};
	};
	
	},{"./_array-from-iterable":81,"./_classof":86}],90:[function(require,module,exports){
	'use strict';
	var global = require('./_global');
	var $export = require('./_export');
	var meta = require('./_meta');
	var fails = require('./_fails');
	var hide = require('./_hide');
	var redefineAll = require('./_redefine-all');
	var forOf = require('./_for-of');
	var anInstance = require('./_an-instance');
	var isObject = require('./_is-object');
	var setToStringTag = require('./_set-to-string-tag');
	var dP = require('./_object-dp').f;
	var each = require('./_array-methods')(0);
	var DESCRIPTORS = require('./_descriptors');
	
	module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
		var Base = global[NAME];
		var C = Base;
		var ADDER = IS_MAP ? 'set' : 'add';
		var proto = C && C.prototype;
		var O = {};
		if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
			new C().entries().next();
		}))) {
			// create collection constructor
			C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
			redefineAll(C.prototype, methods);
			meta.NEED = true;
		} else {
			C = wrapper(function (target, iterable) {
				anInstance(target, C, NAME, '_c');
				target._c = new Base();
				if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
			});
			each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
				var IS_ADDER = KEY == 'add' || KEY == 'set';
				if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
					anInstance(this, C, KEY);
					if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
					var result = this._c[KEY](a === 0 ? 0 : a, b);
					return IS_ADDER ? this : result;
				});
			});
			IS_WEAK || dP(C.prototype, 'size', {
				get: function () {
					return this._c.size;
				}
			});
		}
	
		setToStringTag(C, NAME);
	
		O[NAME] = C;
		$export($export.G + $export.W + $export.F, O);
	
		if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
	
		return C;
	};
	
	},{"./_an-instance":79,"./_array-methods":83,"./_descriptors":95,"./_export":99,"./_fails":100,"./_for-of":101,"./_global":102,"./_hide":104,"./_is-object":111,"./_meta":120,"./_object-dp":125,"./_redefine-all":140,"./_set-to-string-tag":146}],91:[function(require,module,exports){
	var core = module.exports = { version: '2.5.0' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	
	},{}],92:[function(require,module,exports){
	'use strict';
	var $defineProperty = require('./_object-dp');
	var createDesc = require('./_property-desc');
	
	module.exports = function (object, index, value) {
		if (index in object) $defineProperty.f(object, index, createDesc(0, value));
		else object[index] = value;
	};
	
	},{"./_object-dp":125,"./_property-desc":139}],93:[function(require,module,exports){
	// optional / simple context binding
	var aFunction = require('./_a-function');
	module.exports = function (fn, that, length) {
		aFunction(fn);
		if (that === undefined) return fn;
		switch (length) {
			case 1: return function (a) {
				return fn.call(that, a);
			};
			case 2: return function (a, b) {
				return fn.call(that, a, b);
			};
			case 3: return function (a, b, c) {
				return fn.call(that, a, b, c);
			};
		}
		return function (/* ...args */) {
			return fn.apply(that, arguments);
		};
	};
	
	},{"./_a-function":77}],94:[function(require,module,exports){
	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function (it) {
		if (it == undefined) throw TypeError("Can't call method on  " + it);
		return it;
	};
	
	},{}],95:[function(require,module,exports){
	// Thank's IE8 for his funny defineProperty
	module.exports = !require('./_fails')(function () {
		return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});
	
	},{"./_fails":100}],96:[function(require,module,exports){
	var isObject = require('./_is-object');
	var document = require('./_global').document;
	// typeof document.createElement is 'object' in old IE
	var is = isObject(document) && isObject(document.createElement);
	module.exports = function (it) {
		return is ? document.createElement(it) : {};
	};
	
	},{"./_global":102,"./_is-object":111}],97:[function(require,module,exports){
	// IE 8- don't enum bug keys
	module.exports = (
		'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');
	
	},{}],98:[function(require,module,exports){
	// all enumerable object keys, includes symbols
	var getKeys = require('./_object-keys');
	var gOPS = require('./_object-gops');
	var pIE = require('./_object-pie');
	module.exports = function (it) {
		var result = getKeys(it);
		var getSymbols = gOPS.f;
		if (getSymbols) {
			var symbols = getSymbols(it);
			var isEnum = pIE.f;
			var i = 0;
			var key;
			while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
		} return result;
	};
	
	},{"./_object-gops":130,"./_object-keys":133,"./_object-pie":134}],99:[function(require,module,exports){
	var global = require('./_global');
	var core = require('./_core');
	var ctx = require('./_ctx');
	var hide = require('./_hide');
	var PROTOTYPE = 'prototype';
	
	var $export = function (type, name, source) {
		var IS_FORCED = type & $export.F;
		var IS_GLOBAL = type & $export.G;
		var IS_STATIC = type & $export.S;
		var IS_PROTO = type & $export.P;
		var IS_BIND = type & $export.B;
		var IS_WRAP = type & $export.W;
		var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
		var expProto = exports[PROTOTYPE];
		var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
		var key, own, out;
		if (IS_GLOBAL) source = name;
		for (key in source) {
			// contains in native
			own = !IS_FORCED && target && target[key] !== undefined;
			if (own && key in exports) continue;
			// export native or passed
			out = own ? target[key] : source[key];
			// prevent global pollution for namespaces
			exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
			// bind timers to global for call from export context
			: IS_BIND && own ? ctx(out, global)
			// wrap global constructors for prevent change them in library
			: IS_WRAP && target[key] == out ? (function (C) {
				var F = function (a, b, c) {
					if (this instanceof C) {
						switch (arguments.length) {
							case 0: return new C();
							case 1: return new C(a);
							case 2: return new C(a, b);
						} return new C(a, b, c);
					} return C.apply(this, arguments);
				};
				F[PROTOTYPE] = C[PROTOTYPE];
				return F;
			// make static versions for prototype methods
			})(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
			// export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
			if (IS_PROTO) {
				(exports.virtual || (exports.virtual = {}))[key] = out;
				// export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
				if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
			}
		}
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	module.exports = $export;
	
	},{"./_core":91,"./_ctx":93,"./_global":102,"./_hide":104}],100:[function(require,module,exports){
	module.exports = function (exec) {
		try {
			return !!exec();
		} catch (e) {
			return true;
		}
	};
	
	},{}],101:[function(require,module,exports){
	var ctx = require('./_ctx');
	var call = require('./_iter-call');
	var isArrayIter = require('./_is-array-iter');
	var anObject = require('./_an-object');
	var toLength = require('./_to-length');
	var getIterFn = require('./core.get-iterator-method');
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
		var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
		var f = ctx(fn, that, entries ? 2 : 1);
		var index = 0;
		var length, step, iterator, result;
		if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
		// fast case for arrays with default iterator
		if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
			result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
			if (result === BREAK || result === RETURN) return result;
		} else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
			result = call(iterator, f, step.value, entries);
			if (result === BREAK || result === RETURN) return result;
		}
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;
	
	},{"./_an-object":80,"./_ctx":93,"./_is-array-iter":109,"./_iter-call":112,"./_to-length":155,"./core.get-iterator-method":163}],102:[function(require,module,exports){
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
		? window : typeof self != 'undefined' && self.Math == Math ? self
		// eslint-disable-next-line no-new-func
		: Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	
	},{}],103:[function(require,module,exports){
	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function (it, key) {
		return hasOwnProperty.call(it, key);
	};
	
	},{}],104:[function(require,module,exports){
	var dP = require('./_object-dp');
	var createDesc = require('./_property-desc');
	module.exports = require('./_descriptors') ? function (object, key, value) {
		return dP.f(object, key, createDesc(1, value));
	} : function (object, key, value) {
		object[key] = value;
		return object;
	};
	
	},{"./_descriptors":95,"./_object-dp":125,"./_property-desc":139}],105:[function(require,module,exports){
	var document = require('./_global').document;
	module.exports = document && document.documentElement;
	
	},{"./_global":102}],106:[function(require,module,exports){
	module.exports = !require('./_descriptors') && !require('./_fails')(function () {
		return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
	});
	
	},{"./_descriptors":95,"./_dom-create":96,"./_fails":100}],107:[function(require,module,exports){
	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function (fn, args, that) {
		var un = that === undefined;
		switch (args.length) {
			case 0: return un ? fn()
												: fn.call(that);
			case 1: return un ? fn(args[0])
												: fn.call(that, args[0]);
			case 2: return un ? fn(args[0], args[1])
												: fn.call(that, args[0], args[1]);
			case 3: return un ? fn(args[0], args[1], args[2])
												: fn.call(that, args[0], args[1], args[2]);
			case 4: return un ? fn(args[0], args[1], args[2], args[3])
												: fn.call(that, args[0], args[1], args[2], args[3]);
		} return fn.apply(that, args);
	};
	
	},{}],108:[function(require,module,exports){
	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = require('./_cof');
	// eslint-disable-next-line no-prototype-builtins
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
		return cof(it) == 'String' ? it.split('') : Object(it);
	};
	
	},{"./_cof":87}],109:[function(require,module,exports){
	// check on default Array iterator
	var Iterators = require('./_iterators');
	var ITERATOR = require('./_wks')('iterator');
	var ArrayProto = Array.prototype;
	
	module.exports = function (it) {
		return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};
	
	},{"./_iterators":117,"./_wks":162}],110:[function(require,module,exports){
	// 7.2.2 IsArray(argument)
	var cof = require('./_cof');
	module.exports = Array.isArray || function isArray(arg) {
		return cof(arg) == 'Array';
	};
	
	},{"./_cof":87}],111:[function(require,module,exports){
	module.exports = function (it) {
		return typeof it === 'object' ? it !== null : typeof it === 'function';
	};
	
	},{}],112:[function(require,module,exports){
	// call something on iterator step with safe closing on error
	var anObject = require('./_an-object');
	module.exports = function (iterator, fn, value, entries) {
		try {
			return entries ? fn(anObject(value)[0], value[1]) : fn(value);
		// 7.4.6 IteratorClose(iterator, completion)
		} catch (e) {
			var ret = iterator['return'];
			if (ret !== undefined) anObject(ret.call(iterator));
			throw e;
		}
	};
	
	},{"./_an-object":80}],113:[function(require,module,exports){
	'use strict';
	var create = require('./_object-create');
	var descriptor = require('./_property-desc');
	var setToStringTag = require('./_set-to-string-tag');
	var IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });
	
	module.exports = function (Constructor, NAME, next) {
		Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
		setToStringTag(Constructor, NAME + ' Iterator');
	};
	
	},{"./_hide":104,"./_object-create":124,"./_property-desc":139,"./_set-to-string-tag":146,"./_wks":162}],114:[function(require,module,exports){
	'use strict';
	var LIBRARY = require('./_library');
	var $export = require('./_export');
	var redefine = require('./_redefine');
	var hide = require('./_hide');
	var has = require('./_has');
	var Iterators = require('./_iterators');
	var $iterCreate = require('./_iter-create');
	var setToStringTag = require('./_set-to-string-tag');
	var getPrototypeOf = require('./_object-gpo');
	var ITERATOR = require('./_wks')('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';
	
	var returnThis = function () { return this; };
	
	module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
		$iterCreate(Constructor, NAME, next);
		var getMethod = function (kind) {
			if (!BUGGY && kind in proto) return proto[kind];
			switch (kind) {
				case KEYS: return function keys() { return new Constructor(this, kind); };
				case VALUES: return function values() { return new Constructor(this, kind); };
			} return function entries() { return new Constructor(this, kind); };
		};
		var TAG = NAME + ' Iterator';
		var DEF_VALUES = DEFAULT == VALUES;
		var VALUES_BUG = false;
		var proto = Base.prototype;
		var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
		var $default = $native || getMethod(DEFAULT);
		var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
		var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
		var methods, key, IteratorPrototype;
		// Fix native
		if ($anyNative) {
			IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
			if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
				// Set @@toStringTag to native iterators
				setToStringTag(IteratorPrototype, TAG, true);
				// fix for some old engines
				if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
			}
		}
		// fix Array#{values, @@iterator}.name in V8 / FF
		if (DEF_VALUES && $native && $native.name !== VALUES) {
			VALUES_BUG = true;
			$default = function values() { return $native.call(this); };
		}
		// Define iterator
		if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
			hide(proto, ITERATOR, $default);
		}
		// Plug for library
		Iterators[NAME] = $default;
		Iterators[TAG] = returnThis;
		if (DEFAULT) {
			methods = {
				values: DEF_VALUES ? $default : getMethod(VALUES),
				keys: IS_SET ? $default : getMethod(KEYS),
				entries: $entries
			};
			if (FORCED) for (key in methods) {
				if (!(key in proto)) redefine(proto, key, methods[key]);
			} else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
		}
		return methods;
	};
	
	},{"./_export":99,"./_has":103,"./_hide":104,"./_iter-create":113,"./_iterators":117,"./_library":119,"./_object-gpo":131,"./_redefine":141,"./_set-to-string-tag":146,"./_wks":162}],115:[function(require,module,exports){
	var ITERATOR = require('./_wks')('iterator');
	var SAFE_CLOSING = false;
	
	try {
		var riter = [7][ITERATOR]();
		riter['return'] = function () { SAFE_CLOSING = true; };
		// eslint-disable-next-line no-throw-literal
		Array.from(riter, function () { throw 2; });
	} catch (e) { /* empty */ }
	
	module.exports = function (exec, skipClosing) {
		if (!skipClosing && !SAFE_CLOSING) return false;
		var safe = false;
		try {
			var arr = [7];
			var iter = arr[ITERATOR]();
			iter.next = function () { return { done: safe = true }; };
			arr[ITERATOR] = function () { return iter; };
			exec(arr);
		} catch (e) { /* empty */ }
		return safe;
	};
	
	},{"./_wks":162}],116:[function(require,module,exports){
	module.exports = function (done, value) {
		return { value: value, done: !!done };
	};
	
	},{}],117:[function(require,module,exports){
	module.exports = {};
	
	},{}],118:[function(require,module,exports){
	var getKeys = require('./_object-keys');
	var toIObject = require('./_to-iobject');
	module.exports = function (object, el) {
		var O = toIObject(object);
		var keys = getKeys(O);
		var length = keys.length;
		var index = 0;
		var key;
		while (length > index) if (O[key = keys[index++]] === el) return key;
	};
	
	},{"./_object-keys":133,"./_to-iobject":154}],119:[function(require,module,exports){
	module.exports = true;
	
	},{}],120:[function(require,module,exports){
	var META = require('./_uid')('meta');
	var isObject = require('./_is-object');
	var has = require('./_has');
	var setDesc = require('./_object-dp').f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
		return true;
	};
	var FREEZE = !require('./_fails')(function () {
		return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
		setDesc(it, META, { value: {
			i: 'O' + ++id, // object ID
			w: {}          // weak collections IDs
		} });
	};
	var fastKey = function (it, create) {
		// return primitive with prefix
		if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
		if (!has(it, META)) {
			// can't set metadata to uncaught frozen object
			if (!isExtensible(it)) return 'F';
			// not necessary to add metadata
			if (!create) return 'E';
			// add missing metadata
			setMeta(it);
		// return object ID
		} return it[META].i;
	};
	var getWeak = function (it, create) {
		if (!has(it, META)) {
			// can't set metadata to uncaught frozen object
			if (!isExtensible(it)) return true;
			// not necessary to add metadata
			if (!create) return false;
			// add missing metadata
			setMeta(it);
		// return hash weak collections IDs
		} return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
		if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
		return it;
	};
	var meta = module.exports = {
		KEY: META,
		NEED: false,
		fastKey: fastKey,
		getWeak: getWeak,
		onFreeze: onFreeze
	};
	
	},{"./_fails":100,"./_has":103,"./_is-object":111,"./_object-dp":125,"./_uid":158}],121:[function(require,module,exports){
	var global = require('./_global');
	var macrotask = require('./_task').set;
	var Observer = global.MutationObserver || global.WebKitMutationObserver;
	var process = global.process;
	var Promise = global.Promise;
	var isNode = require('./_cof')(process) == 'process';
	
	module.exports = function () {
		var head, last, notify;
	
		var flush = function () {
			var parent, fn;
			if (isNode && (parent = process.domain)) parent.exit();
			while (head) {
				fn = head.fn;
				head = head.next;
				try {
					fn();
				} catch (e) {
					if (head) notify();
					else last = undefined;
					throw e;
				}
			} last = undefined;
			if (parent) parent.enter();
		};
	
		// Node.js
		if (isNode) {
			notify = function () {
				process.nextTick(flush);
			};
		// browsers with MutationObserver
		} else if (Observer) {
			var toggle = true;
			var node = document.createTextNode('');
			new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
			notify = function () {
				node.data = toggle = !toggle;
			};
		// environments with maybe non-completely correct, but existent Promise
		} else if (Promise && Promise.resolve) {
			var promise = Promise.resolve();
			notify = function () {
				promise.then(flush);
			};
		// for other environments - macrotask based on:
		// - setImmediate
		// - MessageChannel
		// - window.postMessag
		// - onreadystatechange
		// - setTimeout
		} else {
			notify = function () {
				// strange IE + webpack dev server bug - use .call(global)
				macrotask.call(global, flush);
			};
		}
	
		return function (fn) {
			var task = { fn: fn, next: undefined };
			if (last) last.next = task;
			if (!head) {
				head = task;
				notify();
			} last = task;
		};
	};
	
	},{"./_cof":87,"./_global":102,"./_task":151}],122:[function(require,module,exports){
	'use strict';
	// 25.4.1.5 NewPromiseCapability(C)
	var aFunction = require('./_a-function');
	
	function PromiseCapability(C) {
		var resolve, reject;
		this.promise = new C(function ($$resolve, $$reject) {
			if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
			resolve = $$resolve;
			reject = $$reject;
		});
		this.resolve = aFunction(resolve);
		this.reject = aFunction(reject);
	}
	
	module.exports.f = function (C) {
		return new PromiseCapability(C);
	};
	
	},{"./_a-function":77}],123:[function(require,module,exports){
	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys = require('./_object-keys');
	var gOPS = require('./_object-gops');
	var pIE = require('./_object-pie');
	var toObject = require('./_to-object');
	var IObject = require('./_iobject');
	var $assign = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || require('./_fails')(function () {
		var A = {};
		var B = {};
		// eslint-disable-next-line no-undef
		var S = Symbol();
		var K = 'abcdefghijklmnopqrst';
		A[S] = 7;
		K.split('').forEach(function (k) { B[k] = k; });
		return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
		var T = toObject(target);
		var aLen = arguments.length;
		var index = 1;
		var getSymbols = gOPS.f;
		var isEnum = pIE.f;
		while (aLen > index) {
			var S = IObject(arguments[index++]);
			var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
			var length = keys.length;
			var j = 0;
			var key;
			while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
		} return T;
	} : $assign;
	
	},{"./_fails":100,"./_iobject":108,"./_object-gops":130,"./_object-keys":133,"./_object-pie":134,"./_to-object":156}],124:[function(require,module,exports){
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject = require('./_an-object');
	var dPs = require('./_object-dps');
	var enumBugKeys = require('./_enum-bug-keys');
	var IE_PROTO = require('./_shared-key')('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
		// Thrash, waste and sodomy: IE GC bug
		var iframe = require('./_dom-create')('iframe');
		var i = enumBugKeys.length;
		var lt = '<';
		var gt = '>';
		var iframeDocument;
		iframe.style.display = 'none';
		require('./_html').appendChild(iframe);
		iframe.src = 'javascript:'; // eslint-disable-line no-script-url
		// createDict = iframe.contentWindow.Object;
		// html.removeChild(iframe);
		iframeDocument = iframe.contentWindow.document;
		iframeDocument.open();
		iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
		iframeDocument.close();
		createDict = iframeDocument.F;
		while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
		return createDict();
	};
	
	module.exports = Object.create || function create(O, Properties) {
		var result;
		if (O !== null) {
			Empty[PROTOTYPE] = anObject(O);
			result = new Empty();
			Empty[PROTOTYPE] = null;
			// add "__proto__" for Object.getPrototypeOf polyfill
			result[IE_PROTO] = O;
		} else result = createDict();
		return Properties === undefined ? result : dPs(result, Properties);
	};
	
	},{"./_an-object":80,"./_dom-create":96,"./_enum-bug-keys":97,"./_html":105,"./_object-dps":126,"./_shared-key":147}],125:[function(require,module,exports){
	var anObject = require('./_an-object');
	var IE8_DOM_DEFINE = require('./_ie8-dom-define');
	var toPrimitive = require('./_to-primitive');
	var dP = Object.defineProperty;
	
	exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
		anObject(O);
		P = toPrimitive(P, true);
		anObject(Attributes);
		if (IE8_DOM_DEFINE) try {
			return dP(O, P, Attributes);
		} catch (e) { /* empty */ }
		if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
		if ('value' in Attributes) O[P] = Attributes.value;
		return O;
	};
	
	},{"./_an-object":80,"./_descriptors":95,"./_ie8-dom-define":106,"./_to-primitive":157}],126:[function(require,module,exports){
	var dP = require('./_object-dp');
	var anObject = require('./_an-object');
	var getKeys = require('./_object-keys');
	
	module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
		anObject(O);
		var keys = getKeys(Properties);
		var length = keys.length;
		var i = 0;
		var P;
		while (length > i) dP.f(O, P = keys[i++], Properties[P]);
		return O;
	};
	
	},{"./_an-object":80,"./_descriptors":95,"./_object-dp":125,"./_object-keys":133}],127:[function(require,module,exports){
	var pIE = require('./_object-pie');
	var createDesc = require('./_property-desc');
	var toIObject = require('./_to-iobject');
	var toPrimitive = require('./_to-primitive');
	var has = require('./_has');
	var IE8_DOM_DEFINE = require('./_ie8-dom-define');
	var gOPD = Object.getOwnPropertyDescriptor;
	
	exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
		O = toIObject(O);
		P = toPrimitive(P, true);
		if (IE8_DOM_DEFINE) try {
			return gOPD(O, P);
		} catch (e) { /* empty */ }
		if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
	};
	
	},{"./_descriptors":95,"./_has":103,"./_ie8-dom-define":106,"./_object-pie":134,"./_property-desc":139,"./_to-iobject":154,"./_to-primitive":157}],128:[function(require,module,exports){
	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = require('./_to-iobject');
	var gOPN = require('./_object-gopn').f;
	var toString = {}.toString;
	
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
		? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function (it) {
		try {
			return gOPN(it);
		} catch (e) {
			return windowNames.slice();
		}
	};
	
	module.exports.f = function getOwnPropertyNames(it) {
		return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};
	
	},{"./_object-gopn":129,"./_to-iobject":154}],129:[function(require,module,exports){
	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys = require('./_object-keys-internal');
	var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
		return $keys(O, hiddenKeys);
	};
	
	},{"./_enum-bug-keys":97,"./_object-keys-internal":132}],130:[function(require,module,exports){
	exports.f = Object.getOwnPropertySymbols;
	
	},{}],131:[function(require,module,exports){
	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has = require('./_has');
	var toObject = require('./_to-object');
	var IE_PROTO = require('./_shared-key')('IE_PROTO');
	var ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function (O) {
		O = toObject(O);
		if (has(O, IE_PROTO)) return O[IE_PROTO];
		if (typeof O.constructor == 'function' && O instanceof O.constructor) {
			return O.constructor.prototype;
		} return O instanceof Object ? ObjectProto : null;
	};
	
	},{"./_has":103,"./_shared-key":147,"./_to-object":156}],132:[function(require,module,exports){
	var has = require('./_has');
	var toIObject = require('./_to-iobject');
	var arrayIndexOf = require('./_array-includes')(false);
	var IE_PROTO = require('./_shared-key')('IE_PROTO');
	
	module.exports = function (object, names) {
		var O = toIObject(object);
		var i = 0;
		var result = [];
		var key;
		for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
		// Don't enum bug & hidden keys
		while (names.length > i) if (has(O, key = names[i++])) {
			~arrayIndexOf(result, key) || result.push(key);
		}
		return result;
	};
	
	},{"./_array-includes":82,"./_has":103,"./_shared-key":147,"./_to-iobject":154}],133:[function(require,module,exports){
	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys = require('./_object-keys-internal');
	var enumBugKeys = require('./_enum-bug-keys');
	
	module.exports = Object.keys || function keys(O) {
		return $keys(O, enumBugKeys);
	};
	
	},{"./_enum-bug-keys":97,"./_object-keys-internal":132}],134:[function(require,module,exports){
	exports.f = {}.propertyIsEnumerable;
	
	},{}],135:[function(require,module,exports){
	// most Object methods by ES6 should accept primitives
	var $export = require('./_export');
	var core = require('./_core');
	var fails = require('./_fails');
	module.exports = function (KEY, exec) {
		var fn = (core.Object || {})[KEY] || Object[KEY];
		var exp = {};
		exp[KEY] = exec(fn);
		$export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
	};
	
	},{"./_core":91,"./_export":99,"./_fails":100}],136:[function(require,module,exports){
	var getKeys = require('./_object-keys');
	var toIObject = require('./_to-iobject');
	var isEnum = require('./_object-pie').f;
	module.exports = function (isEntries) {
		return function (it) {
			var O = toIObject(it);
			var keys = getKeys(O);
			var length = keys.length;
			var i = 0;
			var result = [];
			var key;
			while (length > i) if (isEnum.call(O, key = keys[i++])) {
				result.push(isEntries ? [key, O[key]] : O[key]);
			} return result;
		};
	};
	
	},{"./_object-keys":133,"./_object-pie":134,"./_to-iobject":154}],137:[function(require,module,exports){
	module.exports = function (exec) {
		try {
			return { e: false, v: exec() };
		} catch (e) {
			return { e: true, v: e };
		}
	};
	
	},{}],138:[function(require,module,exports){
	var newPromiseCapability = require('./_new-promise-capability');
	
	module.exports = function (C, x) {
		var promiseCapability = newPromiseCapability.f(C);
		var resolve = promiseCapability.resolve;
		resolve(x);
		return promiseCapability.promise;
	};
	
	},{"./_new-promise-capability":122}],139:[function(require,module,exports){
	module.exports = function (bitmap, value) {
		return {
			enumerable: !(bitmap & 1),
			configurable: !(bitmap & 2),
			writable: !(bitmap & 4),
			value: value
		};
	};
	
	},{}],140:[function(require,module,exports){
	var hide = require('./_hide');
	module.exports = function (target, src, safe) {
		for (var key in src) {
			if (safe && target[key]) target[key] = src[key];
			else hide(target, key, src[key]);
		} return target;
	};
	
	},{"./_hide":104}],141:[function(require,module,exports){
	module.exports = require('./_hide');
	
	},{"./_hide":104}],142:[function(require,module,exports){
	'use strict';
	// https://tc39.github.io/proposal-setmap-offrom/
	var $export = require('./_export');
	var aFunction = require('./_a-function');
	var ctx = require('./_ctx');
	var forOf = require('./_for-of');
	
	module.exports = function (COLLECTION) {
		$export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
			var mapFn = arguments[1];
			var mapping, A, n, cb;
			aFunction(this);
			mapping = mapFn !== undefined;
			if (mapping) aFunction(mapFn);
			if (source == undefined) return new this();
			A = [];
			if (mapping) {
				n = 0;
				cb = ctx(mapFn, arguments[2], 2);
				forOf(source, false, function (nextItem) {
					A.push(cb(nextItem, n++));
				});
			} else {
				forOf(source, false, A.push, A);
			}
			return new this(A);
		} });
	};
	
	},{"./_a-function":77,"./_ctx":93,"./_export":99,"./_for-of":101}],143:[function(require,module,exports){
	'use strict';
	// https://tc39.github.io/proposal-setmap-offrom/
	var $export = require('./_export');
	
	module.exports = function (COLLECTION) {
		$export($export.S, COLLECTION, { of: function of() {
			var length = arguments.length;
			var A = Array(length);
			while (length--) A[length] = arguments[length];
			return new this(A);
		} });
	};
	
	},{"./_export":99}],144:[function(require,module,exports){
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = require('./_is-object');
	var anObject = require('./_an-object');
	var check = function (O, proto) {
		anObject(O);
		if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
		set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
			function (test, buggy, set) {
				try {
					set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
					set(test, []);
					buggy = !(test instanceof Array);
				} catch (e) { buggy = true; }
				return function setPrototypeOf(O, proto) {
					check(O, proto);
					if (buggy) O.__proto__ = proto;
					else set(O, proto);
					return O;
				};
			}({}, false) : undefined),
		check: check
	};
	
	},{"./_an-object":80,"./_ctx":93,"./_is-object":111,"./_object-gopd":127}],145:[function(require,module,exports){
	'use strict';
	var global = require('./_global');
	var core = require('./_core');
	var dP = require('./_object-dp');
	var DESCRIPTORS = require('./_descriptors');
	var SPECIES = require('./_wks')('species');
	
	module.exports = function (KEY) {
		var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
		if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
			configurable: true,
			get: function () { return this; }
		});
	};
	
	},{"./_core":91,"./_descriptors":95,"./_global":102,"./_object-dp":125,"./_wks":162}],146:[function(require,module,exports){
	var def = require('./_object-dp').f;
	var has = require('./_has');
	var TAG = require('./_wks')('toStringTag');
	
	module.exports = function (it, tag, stat) {
		if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};
	
	},{"./_has":103,"./_object-dp":125,"./_wks":162}],147:[function(require,module,exports){
	var shared = require('./_shared')('keys');
	var uid = require('./_uid');
	module.exports = function (key) {
		return shared[key] || (shared[key] = uid(key));
	};
	
	},{"./_shared":148,"./_uid":158}],148:[function(require,module,exports){
	var global = require('./_global');
	var SHARED = '__core-js_shared__';
	var store = global[SHARED] || (global[SHARED] = {});
	module.exports = function (key) {
		return store[key] || (store[key] = {});
	};
	
	},{"./_global":102}],149:[function(require,module,exports){
	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject = require('./_an-object');
	var aFunction = require('./_a-function');
	var SPECIES = require('./_wks')('species');
	module.exports = function (O, D) {
		var C = anObject(O).constructor;
		var S;
		return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};
	
	},{"./_a-function":77,"./_an-object":80,"./_wks":162}],150:[function(require,module,exports){
	var toInteger = require('./_to-integer');
	var defined = require('./_defined');
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function (TO_STRING) {
		return function (that, pos) {
			var s = String(defined(that));
			var i = toInteger(pos);
			var l = s.length;
			var a, b;
			if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
			a = s.charCodeAt(i);
			return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
				? TO_STRING ? s.charAt(i) : a
				: TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
		};
	};
	
	},{"./_defined":94,"./_to-integer":153}],151:[function(require,module,exports){
	var ctx = require('./_ctx');
	var invoke = require('./_invoke');
	var html = require('./_html');
	var cel = require('./_dom-create');
	var global = require('./_global');
	var process = global.process;
	var setTask = global.setImmediate;
	var clearTask = global.clearImmediate;
	var MessageChannel = global.MessageChannel;
	var Dispatch = global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
		var id = +this;
		// eslint-disable-next-line no-prototype-builtins
		if (queue.hasOwnProperty(id)) {
			var fn = queue[id];
			delete queue[id];
			fn();
		}
	};
	var listener = function (event) {
		run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
		setTask = function setImmediate(fn) {
			var args = [];
			var i = 1;
			while (arguments.length > i) args.push(arguments[i++]);
			queue[++counter] = function () {
				// eslint-disable-next-line no-new-func
				invoke(typeof fn == 'function' ? fn : Function(fn), args);
			};
			defer(counter);
			return counter;
		};
		clearTask = function clearImmediate(id) {
			delete queue[id];
		};
		// Node.js 0.8-
		if (require('./_cof')(process) == 'process') {
			defer = function (id) {
				process.nextTick(ctx(run, id, 1));
			};
		// Sphere (JS game engine) Dispatch API
		} else if (Dispatch && Dispatch.now) {
			defer = function (id) {
				Dispatch.now(ctx(run, id, 1));
			};
		// Browsers with MessageChannel, includes WebWorkers
		} else if (MessageChannel) {
			channel = new MessageChannel();
			port = channel.port2;
			channel.port1.onmessage = listener;
			defer = ctx(port.postMessage, port, 1);
		// Browsers with postMessage, skip WebWorkers
		// IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
		} else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
			defer = function (id) {
				global.postMessage(id + '', '*');
			};
			global.addEventListener('message', listener, false);
		// IE8-
		} else if (ONREADYSTATECHANGE in cel('script')) {
			defer = function (id) {
				html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
					html.removeChild(this);
					run.call(id);
				};
			};
		// Rest old browsers
		} else {
			defer = function (id) {
				setTimeout(ctx(run, id, 1), 0);
			};
		}
	}
	module.exports = {
		set: setTask,
		clear: clearTask
	};
	
	},{"./_cof":87,"./_ctx":93,"./_dom-create":96,"./_global":102,"./_html":105,"./_invoke":107}],152:[function(require,module,exports){
	var toInteger = require('./_to-integer');
	var max = Math.max;
	var min = Math.min;
	module.exports = function (index, length) {
		index = toInteger(index);
		return index < 0 ? max(index + length, 0) : min(index, length);
	};
	
	},{"./_to-integer":153}],153:[function(require,module,exports){
	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	module.exports = function (it) {
		return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};
	
	},{}],154:[function(require,module,exports){
	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = require('./_iobject');
	var defined = require('./_defined');
	module.exports = function (it) {
		return IObject(defined(it));
	};
	
	},{"./_defined":94,"./_iobject":108}],155:[function(require,module,exports){
	// 7.1.15 ToLength
	var toInteger = require('./_to-integer');
	var min = Math.min;
	module.exports = function (it) {
		return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};
	
	},{"./_to-integer":153}],156:[function(require,module,exports){
	// 7.1.13 ToObject(argument)
	var defined = require('./_defined');
	module.exports = function (it) {
		return Object(defined(it));
	};
	
	},{"./_defined":94}],157:[function(require,module,exports){
	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = require('./_is-object');
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function (it, S) {
		if (!isObject(it)) return it;
		var fn, val;
		if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
		if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
		if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
		throw TypeError("Can't convert object to primitive value");
	};
	
	},{"./_is-object":111}],158:[function(require,module,exports){
	var id = 0;
	var px = Math.random();
	module.exports = function (key) {
		return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};
	
	},{}],159:[function(require,module,exports){
	var isObject = require('./_is-object');
	module.exports = function (it, TYPE) {
		if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
		return it;
	};
	
	},{"./_is-object":111}],160:[function(require,module,exports){
	var global = require('./_global');
	var core = require('./_core');
	var LIBRARY = require('./_library');
	var wksExt = require('./_wks-ext');
	var defineProperty = require('./_object-dp').f;
	module.exports = function (name) {
		var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
		if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
	};
	
	},{"./_core":91,"./_global":102,"./_library":119,"./_object-dp":125,"./_wks-ext":161}],161:[function(require,module,exports){
	exports.f = require('./_wks');
	
	},{"./_wks":162}],162:[function(require,module,exports){
	var store = require('./_shared')('wks');
	var uid = require('./_uid');
	var Symbol = require('./_global').Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function (name) {
		return store[name] || (store[name] =
			USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;
	
	},{"./_global":102,"./_shared":148,"./_uid":158}],163:[function(require,module,exports){
	var classof = require('./_classof');
	var ITERATOR = require('./_wks')('iterator');
	var Iterators = require('./_iterators');
	module.exports = require('./_core').getIteratorMethod = function (it) {
		if (it != undefined) return it[ITERATOR]
			|| it['@@iterator']
			|| Iterators[classof(it)];
	};
	
	},{"./_classof":86,"./_core":91,"./_iterators":117,"./_wks":162}],164:[function(require,module,exports){
	var anObject = require('./_an-object');
	var get = require('./core.get-iterator-method');
	module.exports = require('./_core').getIterator = function (it) {
		var iterFn = get(it);
		if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
		return anObject(iterFn.call(it));
	};
	
	},{"./_an-object":80,"./_core":91,"./core.get-iterator-method":163}],165:[function(require,module,exports){
	var classof = require('./_classof');
	var ITERATOR = require('./_wks')('iterator');
	var Iterators = require('./_iterators');
	module.exports = require('./_core').isIterable = function (it) {
		var O = Object(it);
		return O[ITERATOR] !== undefined
			|| '@@iterator' in O
			// eslint-disable-next-line no-prototype-builtins
			|| Iterators.hasOwnProperty(classof(O));
	};
	
	},{"./_classof":86,"./_core":91,"./_iterators":117,"./_wks":162}],166:[function(require,module,exports){
	'use strict';
	var ctx = require('./_ctx');
	var $export = require('./_export');
	var toObject = require('./_to-object');
	var call = require('./_iter-call');
	var isArrayIter = require('./_is-array-iter');
	var toLength = require('./_to-length');
	var createProperty = require('./_create-property');
	var getIterFn = require('./core.get-iterator-method');
	
	$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
		// 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
		from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
			var O = toObject(arrayLike);
			var C = typeof this == 'function' ? this : Array;
			var aLen = arguments.length;
			var mapfn = aLen > 1 ? arguments[1] : undefined;
			var mapping = mapfn !== undefined;
			var index = 0;
			var iterFn = getIterFn(O);
			var length, result, step, iterator;
			if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
			// if object isn't iterable or it's array with default iterator - use simple case
			if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
				for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
					createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
				}
			} else {
				length = toLength(O.length);
				for (result = new C(length); length > index; index++) {
					createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
				}
			}
			result.length = index;
			return result;
		}
	});
	
	},{"./_create-property":92,"./_ctx":93,"./_export":99,"./_is-array-iter":109,"./_iter-call":112,"./_iter-detect":115,"./_to-length":155,"./_to-object":156,"./core.get-iterator-method":163}],167:[function(require,module,exports){
	'use strict';
	var addToUnscopables = require('./_add-to-unscopables');
	var step = require('./_iter-step');
	var Iterators = require('./_iterators');
	var toIObject = require('./_to-iobject');
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
		this._t = toIObject(iterated); // target
		this._i = 0;                   // next index
		this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
		var O = this._t;
		var kind = this._k;
		var index = this._i++;
		if (!O || index >= O.length) {
			this._t = undefined;
			return step(1);
		}
		if (kind == 'keys') return step(0, index);
		if (kind == 'values') return step(0, O[index]);
		return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');
	
	},{"./_add-to-unscopables":78,"./_iter-define":114,"./_iter-step":116,"./_iterators":117,"./_to-iobject":154}],168:[function(require,module,exports){
	'use strict';
	var strong = require('./_collection-strong');
	var validate = require('./_validate-collection');
	var MAP = 'Map';
	
	// 23.1 Map Objects
	module.exports = require('./_collection')(MAP, function (get) {
		return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
		// 23.1.3.6 Map.prototype.get(key)
		get: function get(key) {
			var entry = strong.getEntry(validate(this, MAP), key);
			return entry && entry.v;
		},
		// 23.1.3.9 Map.prototype.set(key, value)
		set: function set(key, value) {
			return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
		}
	}, strong, true);
	
	},{"./_collection":90,"./_collection-strong":88,"./_validate-collection":159}],169:[function(require,module,exports){
	// 19.1.3.1 Object.assign(target, source)
	var $export = require('./_export');
	
	$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });
	
	},{"./_export":99,"./_object-assign":123}],170:[function(require,module,exports){
	var $export = require('./_export');
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', { create: require('./_object-create') });
	
	},{"./_export":99,"./_object-create":124}],171:[function(require,module,exports){
	var $export = require('./_export');
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });
	
	},{"./_descriptors":95,"./_export":99,"./_object-dp":125}],172:[function(require,module,exports){
	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject = require('./_to-object');
	var $getPrototypeOf = require('./_object-gpo');
	
	require('./_object-sap')('getPrototypeOf', function () {
		return function getPrototypeOf(it) {
			return $getPrototypeOf(toObject(it));
		};
	});
	
	},{"./_object-gpo":131,"./_object-sap":135,"./_to-object":156}],173:[function(require,module,exports){
	// 19.1.2.14 Object.keys(O)
	var toObject = require('./_to-object');
	var $keys = require('./_object-keys');
	
	require('./_object-sap')('keys', function () {
		return function keys(it) {
			return $keys(toObject(it));
		};
	});
	
	},{"./_object-keys":133,"./_object-sap":135,"./_to-object":156}],174:[function(require,module,exports){
	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = require('./_export');
	$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });
	
	},{"./_export":99,"./_set-proto":144}],175:[function(require,module,exports){
	
	},{}],176:[function(require,module,exports){
	'use strict';
	var LIBRARY = require('./_library');
	var global = require('./_global');
	var ctx = require('./_ctx');
	var classof = require('./_classof');
	var $export = require('./_export');
	var isObject = require('./_is-object');
	var aFunction = require('./_a-function');
	var anInstance = require('./_an-instance');
	var forOf = require('./_for-of');
	var speciesConstructor = require('./_species-constructor');
	var task = require('./_task').set;
	var microtask = require('./_microtask')();
	var newPromiseCapabilityModule = require('./_new-promise-capability');
	var perform = require('./_perform');
	var promiseResolve = require('./_promise-resolve');
	var PROMISE = 'Promise';
	var TypeError = global.TypeError;
	var process = global.process;
	var $Promise = global[PROMISE];
	var isNode = classof(process) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;
	
	var USE_NATIVE = !!function () {
		try {
			// correct subclassing with @@species support
			var promise = $Promise.resolve(1);
			var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
				exec(empty, empty);
			};
			// unhandled rejections tracking support, NodeJS Promise without it fails @@species test
			return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
		} catch (e) { /* empty */ }
	}();
	
	// helpers
	var sameConstructor = LIBRARY ? function (a, b) {
		// with library wrapper special case
		return a === b || a === $Promise && b === Wrapper;
	} : function (a, b) {
		return a === b;
	};
	var isThenable = function (it) {
		var then;
		return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
		if (promise._n) return;
		promise._n = true;
		var chain = promise._c;
		microtask(function () {
			var value = promise._v;
			var ok = promise._s == 1;
			var i = 0;
			var run = function (reaction) {
				var handler = ok ? reaction.ok : reaction.fail;
				var resolve = reaction.resolve;
				var reject = reaction.reject;
				var domain = reaction.domain;
				var result, then;
				try {
					if (handler) {
						if (!ok) {
							if (promise._h == 2) onHandleUnhandled(promise);
							promise._h = 1;
						}
						if (handler === true) result = value;
						else {
							if (domain) domain.enter();
							result = handler(value);
							if (domain) domain.exit();
						}
						if (result === reaction.promise) {
							reject(TypeError('Promise-chain cycle'));
						} else if (then = isThenable(result)) {
							then.call(result, resolve, reject);
						} else resolve(result);
					} else reject(value);
				} catch (e) {
					reject(e);
				}
			};
			while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
			promise._c = [];
			promise._n = false;
			if (isReject && !promise._h) onUnhandled(promise);
		});
	};
	var onUnhandled = function (promise) {
		task.call(global, function () {
			var value = promise._v;
			var unhandled = isUnhandled(promise);
			var result, handler, console;
			if (unhandled) {
				result = perform(function () {
					if (isNode) {
						process.emit('unhandledRejection', value, promise);
					} else if (handler = global.onunhandledrejection) {
						handler({ promise: promise, reason: value });
					} else if ((console = global.console) && console.error) {
						console.error('Unhandled promise rejection', value);
					}
				});
				// Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
				promise._h = isNode || isUnhandled(promise) ? 2 : 1;
			} promise._a = undefined;
			if (unhandled && result.e) throw result.v;
		});
	};
	var isUnhandled = function (promise) {
		if (promise._h == 1) return false;
		var chain = promise._a || promise._c;
		var i = 0;
		var reaction;
		while (chain.length > i) {
			reaction = chain[i++];
			if (reaction.fail || !isUnhandled(reaction.promise)) return false;
		} return true;
	};
	var onHandleUnhandled = function (promise) {
		task.call(global, function () {
			var handler;
			if (isNode) {
				process.emit('rejectionHandled', promise);
			} else if (handler = global.onrejectionhandled) {
				handler({ promise: promise, reason: promise._v });
			}
		});
	};
	var $reject = function (value) {
		var promise = this;
		if (promise._d) return;
		promise._d = true;
		promise = promise._w || promise; // unwrap
		promise._v = value;
		promise._s = 2;
		if (!promise._a) promise._a = promise._c.slice();
		notify(promise, true);
	};
	var $resolve = function (value) {
		var promise = this;
		var then;
		if (promise._d) return;
		promise._d = true;
		promise = promise._w || promise; // unwrap
		try {
			if (promise === value) throw TypeError("Promise can't be resolved itself");
			if (then = isThenable(value)) {
				microtask(function () {
					var wrapper = { _w: promise, _d: false }; // wrap
					try {
						then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
					} catch (e) {
						$reject.call(wrapper, e);
					}
				});
			} else {
				promise._v = value;
				promise._s = 1;
				notify(promise, false);
			}
		} catch (e) {
			$reject.call({ _w: promise, _d: false }, e); // wrap
		}
	};
	
	// constructor polyfill
	if (!USE_NATIVE) {
		// 25.4.3.1 Promise(executor)
		$Promise = function Promise(executor) {
			anInstance(this, $Promise, PROMISE, '_h');
			aFunction(executor);
			Internal.call(this);
			try {
				executor(ctx($resolve, this, 1), ctx($reject, this, 1));
			} catch (err) {
				$reject.call(this, err);
			}
		};
		// eslint-disable-next-line no-unused-vars
		Internal = function Promise(executor) {
			this._c = [];             // <- awaiting reactions
			this._a = undefined;      // <- checked in isUnhandled reactions
			this._s = 0;              // <- state
			this._d = false;          // <- done
			this._v = undefined;      // <- value
			this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
			this._n = false;          // <- notify
		};
		Internal.prototype = require('./_redefine-all')($Promise.prototype, {
			// 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
			then: function then(onFulfilled, onRejected) {
				var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
				reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
				reaction.fail = typeof onRejected == 'function' && onRejected;
				reaction.domain = isNode ? process.domain : undefined;
				this._c.push(reaction);
				if (this._a) this._a.push(reaction);
				if (this._s) notify(this, false);
				return reaction.promise;
			},
			// 25.4.5.1 Promise.prototype.catch(onRejected)
			'catch': function (onRejected) {
				return this.then(undefined, onRejected);
			}
		});
		OwnPromiseCapability = function () {
			var promise = new Internal();
			this.promise = promise;
			this.resolve = ctx($resolve, promise, 1);
			this.reject = ctx($reject, promise, 1);
		};
		newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
			return sameConstructor($Promise, C)
				? new OwnPromiseCapability(C)
				: newGenericPromiseCapability(C);
		};
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
	require('./_set-to-string-tag')($Promise, PROMISE);
	require('./_set-species')(PROMISE);
	Wrapper = require('./_core')[PROMISE];
	
	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
		// 25.4.4.5 Promise.reject(r)
		reject: function reject(r) {
			var capability = newPromiseCapability(this);
			var $$reject = capability.reject;
			$$reject(r);
			return capability.promise;
		}
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
		// 25.4.4.6 Promise.resolve(x)
		resolve: function resolve(x) {
			// instanceof instead of internal slot check because we should fix it without replacement native Promise core
			if (x instanceof $Promise && sameConstructor(x.constructor, this)) return x;
			return promiseResolve(this, x);
		}
	});
	$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
		$Promise.all(iter)['catch'](empty);
	})), PROMISE, {
		// 25.4.4.1 Promise.all(iterable)
		all: function all(iterable) {
			var C = this;
			var capability = newPromiseCapability(C);
			var resolve = capability.resolve;
			var reject = capability.reject;
			var result = perform(function () {
				var values = [];
				var index = 0;
				var remaining = 1;
				forOf(iterable, false, function (promise) {
					var $index = index++;
					var alreadyCalled = false;
					values.push(undefined);
					remaining++;
					C.resolve(promise).then(function (value) {
						if (alreadyCalled) return;
						alreadyCalled = true;
						values[$index] = value;
						--remaining || resolve(values);
					}, reject);
				});
				--remaining || resolve(values);
			});
			if (result.e) reject(result.v);
			return capability.promise;
		},
		// 25.4.4.4 Promise.race(iterable)
		race: function race(iterable) {
			var C = this;
			var capability = newPromiseCapability(C);
			var reject = capability.reject;
			var result = perform(function () {
				forOf(iterable, false, function (promise) {
					C.resolve(promise).then(capability.resolve, reject);
				});
			});
			if (result.e) reject(result.v);
			return capability.promise;
		}
	});
	
	},{"./_a-function":77,"./_an-instance":79,"./_classof":86,"./_core":91,"./_ctx":93,"./_export":99,"./_for-of":101,"./_global":102,"./_is-object":111,"./_iter-detect":115,"./_library":119,"./_microtask":121,"./_new-promise-capability":122,"./_perform":137,"./_promise-resolve":138,"./_redefine-all":140,"./_set-species":145,"./_set-to-string-tag":146,"./_species-constructor":149,"./_task":151,"./_wks":162}],177:[function(require,module,exports){
	'use strict';
	var strong = require('./_collection-strong');
	var validate = require('./_validate-collection');
	var SET = 'Set';
	
	// 23.2 Set Objects
	module.exports = require('./_collection')(SET, function (get) {
		return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
		// 23.2.3.1 Set.prototype.add(value)
		add: function add(value) {
			return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
		}
	}, strong);
	
	},{"./_collection":90,"./_collection-strong":88,"./_validate-collection":159}],178:[function(require,module,exports){
	'use strict';
	var $at = require('./_string-at')(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	require('./_iter-define')(String, 'String', function (iterated) {
		this._t = String(iterated); // target
		this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
		var O = this._t;
		var index = this._i;
		var point;
		if (index >= O.length) return { value: undefined, done: true };
		point = $at(O, index);
		this._i += point.length;
		return { value: point, done: false };
	});
	
	},{"./_iter-define":114,"./_string-at":150}],179:[function(require,module,exports){
	'use strict';
	// ECMAScript 6 symbols shim
	var global = require('./_global');
	var has = require('./_has');
	var DESCRIPTORS = require('./_descriptors');
	var $export = require('./_export');
	var redefine = require('./_redefine');
	var META = require('./_meta').KEY;
	var $fails = require('./_fails');
	var shared = require('./_shared');
	var setToStringTag = require('./_set-to-string-tag');
	var uid = require('./_uid');
	var wks = require('./_wks');
	var wksExt = require('./_wks-ext');
	var wksDefine = require('./_wks-define');
	var keyOf = require('./_keyof');
	var enumKeys = require('./_enum-keys');
	var isArray = require('./_is-array');
	var anObject = require('./_an-object');
	var toIObject = require('./_to-iobject');
	var toPrimitive = require('./_to-primitive');
	var createDesc = require('./_property-desc');
	var _create = require('./_object-create');
	var gOPNExt = require('./_object-gopn-ext');
	var $GOPD = require('./_object-gopd');
	var $DP = require('./_object-dp');
	var $keys = require('./_object-keys');
	var gOPD = $GOPD.f;
	var dP = $DP.f;
	var gOPN = gOPNExt.f;
	var $Symbol = global.Symbol;
	var $JSON = global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE = 'prototype';
	var HIDDEN = wks('_hidden');
	var TO_PRIMITIVE = wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = shared('symbol-registry');
	var AllSymbols = shared('symbols');
	var OPSymbols = shared('op-symbols');
	var ObjectProto = Object[PROTOTYPE];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function () {
		return _create(dP({}, 'a', {
			get: function () { return dP(this, 'a', { value: 7 }).a; }
		})).a != 7;
	}) ? function (it, key, D) {
		var protoDesc = gOPD(ObjectProto, key);
		if (protoDesc) delete ObjectProto[key];
		dP(it, key, D);
		if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
	} : dP;
	
	var wrap = function (tag) {
		var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
		sym._k = tag;
		return sym;
	};
	
	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
		return typeof it == 'symbol';
	} : function (it) {
		return it instanceof $Symbol;
	};
	
	var $defineProperty = function defineProperty(it, key, D) {
		if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
		anObject(it);
		key = toPrimitive(key, true);
		anObject(D);
		if (has(AllSymbols, key)) {
			if (!D.enumerable) {
				if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
				it[HIDDEN][key] = true;
			} else {
				if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
				D = _create(D, { enumerable: createDesc(0, false) });
			} return setSymbolDesc(it, key, D);
		} return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
		anObject(it);
		var keys = enumKeys(P = toIObject(P));
		var i = 0;
		var l = keys.length;
		var key;
		while (l > i) $defineProperty(it, key = keys[i++], P[key]);
		return it;
	};
	var $create = function create(it, P) {
		return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
		var E = isEnum.call(this, key = toPrimitive(key, true));
		if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
		return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
		it = toIObject(it);
		key = toPrimitive(key, true);
		if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
		var D = gOPD(it, key);
		if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
		return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
		var names = gOPN(toIObject(it));
		var result = [];
		var i = 0;
		var key;
		while (names.length > i) {
			if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
		} return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
		var IS_OP = it === ObjectProto;
		var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
		var result = [];
		var i = 0;
		var key;
		while (names.length > i) {
			if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
		} return result;
	};
	
	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
		$Symbol = function Symbol() {
			if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
			var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
			var $set = function (value) {
				if (this === ObjectProto) $set.call(OPSymbols, value);
				if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
				setSymbolDesc(this, tag, createDesc(1, value));
			};
			if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
			return wrap(tag);
		};
		redefine($Symbol[PROTOTYPE], 'toString', function toString() {
			return this._k;
		});
	
		$GOPD.f = $getOwnPropertyDescriptor;
		$DP.f = $defineProperty;
		require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
		require('./_object-pie').f = $propertyIsEnumerable;
		require('./_object-gops').f = $getOwnPropertySymbols;
	
		if (DESCRIPTORS && !require('./_library')) {
			redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
		}
	
		wksExt.f = function (name) {
			return wrap(wks(name));
		};
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });
	
	for (var es6Symbols = (
		// 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
		'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);
	
	for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);
	
	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
		// 19.4.2.1 Symbol.for(key)
		'for': function (key) {
			return has(SymbolRegistry, key += '')
				? SymbolRegistry[key]
				: SymbolRegistry[key] = $Symbol(key);
		},
		// 19.4.2.5 Symbol.keyFor(sym)
		keyFor: function keyFor(key) {
			if (isSymbol(key)) return keyOf(SymbolRegistry, key);
			throw TypeError(key + ' is not a symbol!');
		},
		useSetter: function () { setter = true; },
		useSimple: function () { setter = false; }
	});
	
	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
		// 19.1.2.2 Object.create(O [, Properties])
		create: $create,
		// 19.1.2.4 Object.defineProperty(O, P, Attributes)
		defineProperty: $defineProperty,
		// 19.1.2.3 Object.defineProperties(O, Properties)
		defineProperties: $defineProperties,
		// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
		getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
		// 19.1.2.7 Object.getOwnPropertyNames(O)
		getOwnPropertyNames: $getOwnPropertyNames,
		// 19.1.2.8 Object.getOwnPropertySymbols(O)
		getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
		var S = $Symbol();
		// MS Edge converts symbol values to JSON as {}
		// WebKit converts symbol values to JSON as null
		// V8 throws on boxed symbols
		return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
		stringify: function stringify(it) {
			if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
			var args = [it];
			var i = 1;
			var replacer, $replacer;
			while (arguments.length > i) args.push(arguments[i++]);
			replacer = args[1];
			if (typeof replacer == 'function') $replacer = replacer;
			if ($replacer || !isArray(replacer)) replacer = function (key, value) {
				if ($replacer) value = $replacer.call(this, key, value);
				if (!isSymbol(value)) return value;
			};
			args[1] = replacer;
			return _stringify.apply($JSON, args);
		}
	});
	
	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);
	
	},{"./_an-object":80,"./_descriptors":95,"./_enum-keys":98,"./_export":99,"./_fails":100,"./_global":102,"./_has":103,"./_hide":104,"./_is-array":110,"./_keyof":118,"./_library":119,"./_meta":120,"./_object-create":124,"./_object-dp":125,"./_object-gopd":127,"./_object-gopn":129,"./_object-gopn-ext":128,"./_object-gops":130,"./_object-keys":133,"./_object-pie":134,"./_property-desc":139,"./_redefine":141,"./_set-to-string-tag":146,"./_shared":148,"./_to-iobject":154,"./_to-primitive":157,"./_uid":158,"./_wks":162,"./_wks-define":160,"./_wks-ext":161}],180:[function(require,module,exports){
	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
	require('./_set-collection-from')('Map');
	
	},{"./_set-collection-from":142}],181:[function(require,module,exports){
	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
	require('./_set-collection-of')('Map');
	
	},{"./_set-collection-of":143}],182:[function(require,module,exports){
	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export = require('./_export');
	
	$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });
	
	},{"./_collection-to-json":89,"./_export":99}],183:[function(require,module,exports){
	// https://github.com/tc39/proposal-object-values-entries
	var $export = require('./_export');
	var $values = require('./_object-to-array')(false);
	
	$export($export.S, 'Object', {
		values: function values(it) {
			return $values(it);
		}
	});
	
	},{"./_export":99,"./_object-to-array":136}],184:[function(require,module,exports){
	// https://github.com/tc39/proposal-promise-finally
	'use strict';
	var $export = require('./_export');
	var core = require('./_core');
	var global = require('./_global');
	var speciesConstructor = require('./_species-constructor');
	var promiseResolve = require('./_promise-resolve');
	
	$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
		var C = speciesConstructor(this, core.Promise || global.Promise);
		var isFunction = typeof onFinally == 'function';
		return this.then(
			isFunction ? function (x) {
				return promiseResolve(C, onFinally()).then(function () { return x; });
			} : onFinally,
			isFunction ? function (e) {
				return promiseResolve(C, onFinally()).then(function () { throw e; });
			} : onFinally
		);
	} });
	
	},{"./_core":91,"./_export":99,"./_global":102,"./_promise-resolve":138,"./_species-constructor":149}],185:[function(require,module,exports){
	'use strict';
	// https://github.com/tc39/proposal-promise-try
	var $export = require('./_export');
	var newPromiseCapability = require('./_new-promise-capability');
	var perform = require('./_perform');
	
	$export($export.S, 'Promise', { 'try': function (callbackfn) {
		var promiseCapability = newPromiseCapability.f(this);
		var result = perform(callbackfn);
		(result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
		return promiseCapability.promise;
	} });
	
	},{"./_export":99,"./_new-promise-capability":122,"./_perform":137}],186:[function(require,module,exports){
	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
	require('./_set-collection-from')('Set');
	
	},{"./_set-collection-from":142}],187:[function(require,module,exports){
	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
	require('./_set-collection-of')('Set');
	
	},{"./_set-collection-of":143}],188:[function(require,module,exports){
	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export = require('./_export');
	
	$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });
	
	},{"./_collection-to-json":89,"./_export":99}],189:[function(require,module,exports){
	require('./_wks-define')('asyncIterator');
	
	},{"./_wks-define":160}],190:[function(require,module,exports){
	require('./_wks-define')('observable');
	
	},{"./_wks-define":160}],191:[function(require,module,exports){
	require('./es6.array.iterator');
	var global = require('./_global');
	var hide = require('./_hide');
	var Iterators = require('./_iterators');
	var TO_STRING_TAG = require('./_wks')('toStringTag');
	
	var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
		'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
		'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
		'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
		'TextTrackList,TouchList').split(',');
	
	for (var i = 0; i < DOMIterables.length; i++) {
		var NAME = DOMIterables[i];
		var Collection = global[NAME];
		var proto = Collection && Collection.prototype;
		if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
		Iterators[NAME] = Iterators.Array;
	}
	
	},{"./_global":102,"./_hide":104,"./_iterators":117,"./_wks":162,"./es6.array.iterator":167}],192:[function(require,module,exports){
	(function (process){
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = require('./debug');
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
								 && 'undefined' != typeof chrome.storage
										? chrome.storage.local
										: localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
		'#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
		'#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
		'#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
		'#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
		'#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
		'#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
		'#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
		'#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
		'#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
		'#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
		'#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
			return true;
		}
	
		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}
	
		// is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
			// double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (err) {
			return '[UnexpectedJSONParseError]: ' + err.message;
		}
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs(args) {
		var useColors = this.useColors;
	
		args[0] = (useColors ? '%c' : '')
			+ this.namespace
			+ (useColors ? ' %c' : ' ')
			+ args[0]
			+ (useColors ? '%c ' : ' ')
			+ '+' + exports.humanize(this.diff);
	
		if (!useColors) return;
	
		var c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit')
	
		// the final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		var index = 0;
		var lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, function(match) {
			if ('%%' === match) return;
			index++;
			if ('%c' === match) {
				// we only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});
	
		args.splice(lastC, 0, c);
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
		// this hackery is required for IE8/9, where
		// the `console.log` function doesn't have 'apply'
		return 'object' === typeof console
			&& console.log
			&& Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
		try {
			if (null == namespaces) {
				exports.storage.removeItem('debug');
			} else {
				exports.storage.debug = namespaces;
			}
		} catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
		var r;
		try {
			r = exports.storage.debug;
		} catch(e) {}
	
		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = process.env.DEBUG;
		}
	
		return r;
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage() {
		try {
			return window.localStorage;
		} catch (e) {}
	}
	
	}).call(this,require('_process'))
	
	},{"./debug":193,"_process":198}],193:[function(require,module,exports){
	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = require('ms');
	
	/**
	 * Active `debug` instances.
	 */
	exports.instances = [];
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	 */
	
	exports.formatters = {};
	
	/**
	 * Select a color.
	 * @param {String} namespace
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor(namespace) {
		var hash = 0, i;
	
		for (i in namespace) {
			hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}
	
		return exports.colors[Math.abs(hash) % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function createDebug(namespace) {
	
		var prevTime;
	
		function debug() {
			// disabled?
			if (!debug.enabled) return;
	
			var self = debug;
	
			// set `diff` timestamp
			var curr = +new Date();
			var ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;
	
			// turn the `arguments` into a proper Array
			var args = new Array(arguments.length);
			for (var i = 0; i < args.length; i++) {
				args[i] = arguments[i];
			}
	
			args[0] = exports.coerce(args[0]);
	
			if ('string' !== typeof args[0]) {
				// anything else let's inspect with %O
				args.unshift('%O');
			}
	
			// apply any `formatters` transformations
			var index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
				// if we encounter an escaped % then don't increase the array index
				if (match === '%%') return match;
				index++;
				var formatter = exports.formatters[format];
				if ('function' === typeof formatter) {
					var val = args[index];
					match = formatter.call(self, val);
	
					// now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});
	
			// apply env-specific formatting (colors, etc.)
			exports.formatArgs.call(self, args);
	
			var logFn = debug.log || exports.log || console.log.bind(console);
			logFn.apply(self, args);
		}
	
		debug.namespace = namespace;
		debug.enabled = exports.enabled(namespace);
		debug.useColors = exports.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
	
		// env-specific initialization logic for debug instances
		if ('function' === typeof exports.init) {
			exports.init(debug);
		}
	
		exports.instances.push(debug);
	
		return debug;
	}
	
	function destroy () {
		var index = exports.instances.indexOf(this);
		if (index !== -1) {
			exports.instances.splice(index, 1);
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
		exports.save(namespaces);
	
		exports.names = [];
		exports.skips = [];
	
		var i;
		var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		var len = split.length;
	
		for (i = 0; i < len; i++) {
			if (!split[i]) continue; // ignore empty strings
			namespaces = split[i].replace(/\*/g, '.*?');
			if (namespaces[0] === '-') {
				exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				exports.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	
		for (i = 0; i < exports.instances.length; i++) {
			var instance = exports.instances[i];
			instance.enabled = exports.enabled(instance.namespace);
		}
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
		exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}
		var i, len;
		for (i = 0, len = exports.skips.length; i < len; i++) {
			if (exports.skips[i].test(name)) {
				return false;
			}
		}
		for (i = 0, len = exports.names.length; i < len; i++) {
			if (exports.names[i].test(name)) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
		if (val instanceof Error) return val.stack || val.message;
		return val;
	}
	
	},{"ms":197}],194:[function(require,module,exports){
	/*!
		* domready (c) Dustin Diaz 2014 - License MIT
		*/
	!function (name, definition) {
	
		if (typeof module != 'undefined') module.exports = definition()
		else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
		else this[name] = definition()
	
	}('domready', function () {
	
		var fns = [], listener
			, doc = document
			, hack = doc.documentElement.doScroll
			, domContentLoaded = 'DOMContentLoaded'
			, loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)
	
	
		if (!loaded)
		doc.addEventListener(domContentLoaded, listener = function () {
			doc.removeEventListener(domContentLoaded, listener)
			loaded = 1
			while (listener = fns.shift()) listener()
		})
	
		return function (fn) {
			loaded ? setTimeout(fn, 0) : fns.push(fn)
		}
	
	});
	
	},{}],195:[function(require,module,exports){
	var WildEmitter = require('wildemitter');
	
	function getMaxVolume (analyser, fftBins) {
		var maxVolume = -Infinity;
		analyser.getFloatFrequencyData(fftBins);
	
		for(var i=4, ii=fftBins.length; i < ii; i++) {
			if (fftBins[i] > maxVolume && fftBins[i] < 0) {
				maxVolume = fftBins[i];
			}
		};
	
		return maxVolume;
	}
	
	
	var audioContextType;
	if (typeof window !== 'undefined') {
		audioContextType = window.AudioContext || window.webkitAudioContext;
	}
	// use a single audio context due to hardware limits
	var audioContext = null;
	module.exports = function(stream, options) {
		var harker = new WildEmitter();
	
		// make it not break in non-supported browsers
		if (!audioContextType) return harker;
	
		//Config
		var options = options || {},
				smoothing = (options.smoothing || 0.1),
				interval = (options.interval || 50),
				threshold = options.threshold,
				play = options.play,
				history = options.history || 10,
				running = true;
	
		// Ensure that just a single AudioContext is internally created
		audioContext = options.audioContext || audioContext || new audioContextType();
	
		var sourceNode, fftBins, analyser;
	
		analyser = audioContext.createAnalyser();
		analyser.fftSize = 512;
		analyser.smoothingTimeConstant = smoothing;
		fftBins = new Float32Array(analyser.frequencyBinCount);
	
		if (stream.jquery) stream = stream[0];
		if (stream instanceof HTMLAudioElement || stream instanceof HTMLVideoElement) {
			//Audio Tag
			sourceNode = audioContext.createMediaElementSource(stream);
			if (typeof play === 'undefined') play = true;
			threshold = threshold || -50;
		} else {
			//WebRTC Stream
			sourceNode = audioContext.createMediaStreamSource(stream);
			threshold = threshold || -50;
		}
	
		sourceNode.connect(analyser);
		if (play) analyser.connect(audioContext.destination);
	
		harker.speaking = false;
	
		harker.suspend = function() {
			return audioContext.suspend();
		}
		harker.resume = function() {
			return audioContext.resume();
		}
		Object.defineProperty(harker, 'state', { get: function() {
			return audioContext.state;
		}});
		audioContext.onstatechange = function() {
			harker.emit('state_change', audioContext.state);
		}
	
		harker.setThreshold = function(t) {
			threshold = t;
		};
	
		harker.setInterval = function(i) {
			interval = i;
		};
	
		harker.stop = function() {
			running = false;
			harker.emit('volume_change', -100, threshold);
			if (harker.speaking) {
				harker.speaking = false;
				harker.emit('stopped_speaking');
			}
			analyser.disconnect();
			sourceNode.disconnect();
		};
		harker.speakingHistory = [];
		for (var i = 0; i < history; i++) {
				harker.speakingHistory.push(0);
		}
	
		// Poll the analyser node to determine if speaking
		// and emit events if changed
		var looper = function() {
			setTimeout(function() {
	
				//check if stop has been called
				if(!running) {
					return;
				}
	
				var currentVolume = getMaxVolume(analyser, fftBins);
	
				harker.emit('volume_change', currentVolume, threshold);
	
				var history = 0;
				if (currentVolume > threshold && !harker.speaking) {
					// trigger quickly, short history
					for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
						history += harker.speakingHistory[i];
					}
					if (history >= 2) {
						harker.speaking = true;
						harker.emit('speaking');
					}
				} else if (currentVolume < threshold && harker.speaking) {
					for (var i = 0; i < harker.speakingHistory.length; i++) {
						history += harker.speakingHistory[i];
					}
					if (history == 0) {
						harker.speaking = false;
						harker.emit('stopped_speaking');
					}
				}
				harker.speakingHistory.shift();
				harker.speakingHistory.push(0 + (currentVolume > threshold));
	
				looper();
			}, interval);
		};
		looper();
	
		return harker;
	}
	
	},{"wildemitter":221}],196:[function(require,module,exports){
	var support = require('webrtcsupport');
	
	
	function GainController(stream) {
			this.support = support.webAudio && support.mediaStream;
	
			// set our starting value
			this.gain = 1;
	
			if (this.support) {
					var context = this.context = new support.AudioContext();
					this.microphone = context.createMediaStreamSource(stream);
					this.gainFilter = context.createGain();
					this.destination = context.createMediaStreamDestination();
					this.outputStream = this.destination.stream;
					this.microphone.connect(this.gainFilter);
					this.gainFilter.connect(this.destination);
					stream.addTrack(this.outputStream.getAudioTracks()[0]);
					stream.removeTrack(stream.getAudioTracks()[0]);
			}
			this.stream = stream;
	}
	
	// setting
	GainController.prototype.setGain = function (val) {
			// check for support
			if (!this.support) return;
			this.gainFilter.gain.value = val;
			this.gain = val;
	};
	
	GainController.prototype.getGain = function () {
			return this.gain;
	};
	
	GainController.prototype.off = function () {
			return this.setGain(0);
	};
	
	GainController.prototype.on = function () {
			this.setGain(1);
	};
	
	
	module.exports = GainController;
	
	},{"webrtcsupport":217}],197:[function(require,module,exports){
	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === 'string' && val.length > 0) {
			return parse(val);
		} else if (type === 'number' && isNaN(val) === false) {
			return options.long ? fmtLong(val) : fmtShort(val);
		}
		throw new Error(
			'val is not a non-empty string or a valid number. val=' +
				JSON.stringify(val)
		);
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
		str = String(str);
		if (str.length > 100) {
			return;
		}
		var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
			str
		);
		if (!match) {
			return;
		}
		var n = parseFloat(match[1]);
		var type = (match[2] || 'ms').toLowerCase();
		switch (type) {
			case 'years':
			case 'year':
			case 'yrs':
			case 'yr':
			case 'y':
				return n * y;
			case 'days':
			case 'day':
			case 'd':
				return n * d;
			case 'hours':
			case 'hour':
			case 'hrs':
			case 'hr':
			case 'h':
				return n * h;
			case 'minutes':
			case 'minute':
			case 'mins':
			case 'min':
			case 'm':
				return n * m;
			case 'seconds':
			case 'second':
			case 'secs':
			case 'sec':
			case 's':
				return n * s;
			case 'milliseconds':
			case 'millisecond':
			case 'msecs':
			case 'msec':
			case 'ms':
				return n;
			default:
				return undefined;
		}
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtShort(ms) {
		if (ms >= d) {
			return Math.round(ms / d) + 'd';
		}
		if (ms >= h) {
			return Math.round(ms / h) + 'h';
		}
		if (ms >= m) {
			return Math.round(ms / m) + 'm';
		}
		if (ms >= s) {
			return Math.round(ms / s) + 's';
		}
		return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function fmtLong(ms) {
		return plural(ms, d, 'day') ||
			plural(ms, h, 'hour') ||
			plural(ms, m, 'minute') ||
			plural(ms, s, 'second') ||
			ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
		if (ms < n) {
			return;
		}
		if (ms < n * 1.5) {
			return Math.floor(ms / n) + ' ' + name;
		}
		return Math.ceil(ms / n) + ' ' + name + 's';
	}
	
	},{}],198:[function(require,module,exports){
	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
			throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
			throw new Error('clearTimeout has not been defined');
	}
	(function () {
			try {
					if (typeof setTimeout === 'function') {
							cachedSetTimeout = setTimeout;
					} else {
							cachedSetTimeout = defaultSetTimout;
					}
			} catch (e) {
					cachedSetTimeout = defaultSetTimout;
			}
			try {
					if (typeof clearTimeout === 'function') {
							cachedClearTimeout = clearTimeout;
					} else {
							cachedClearTimeout = defaultClearTimeout;
					}
			} catch (e) {
					cachedClearTimeout = defaultClearTimeout;
			}
	} ())
	function runTimeout(fun) {
			if (cachedSetTimeout === setTimeout) {
					//normal enviroments in sane situations
					return setTimeout(fun, 0);
			}
			// if setTimeout wasn't available but was latter defined
			if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
					cachedSetTimeout = setTimeout;
					return setTimeout(fun, 0);
			}
			try {
					// when when somebody has screwed with setTimeout but no I.E. maddness
					return cachedSetTimeout(fun, 0);
			} catch(e){
					try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
							return cachedSetTimeout.call(null, fun, 0);
					} catch(e){
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
							return cachedSetTimeout.call(this, fun, 0);
					}
			}
	
	
	}
	function runClearTimeout(marker) {
			if (cachedClearTimeout === clearTimeout) {
					//normal enviroments in sane situations
					return clearTimeout(marker);
			}
			// if clearTimeout wasn't available but was latter defined
			if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
					cachedClearTimeout = clearTimeout;
					return clearTimeout(marker);
			}
			try {
					// when when somebody has screwed with setTimeout but no I.E. maddness
					return cachedClearTimeout(marker);
			} catch (e){
					try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
							return cachedClearTimeout.call(null, marker);
					} catch (e){
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
							// Some versions of I.E. have different rules for clearTimeout vs setTimeout
							return cachedClearTimeout.call(this, marker);
					}
			}
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
			if (!draining || !currentQueue) {
					return;
			}
			draining = false;
			if (currentQueue.length) {
					queue = currentQueue.concat(queue);
			} else {
					queueIndex = -1;
			}
			if (queue.length) {
					drainQueue();
			}
	}
	
	function drainQueue() {
			if (draining) {
					return;
			}
			var timeout = runTimeout(cleanUpNextTick);
			draining = true;
	
			var len = queue.length;
			while(len) {
					currentQueue = queue;
					queue = [];
					while (++queueIndex < len) {
							if (currentQueue) {
									currentQueue[queueIndex].run();
							}
					}
					queueIndex = -1;
					len = queue.length;
			}
			currentQueue = null;
			draining = false;
			runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
			var args = new Array(arguments.length - 1);
			if (arguments.length > 1) {
					for (var i = 1; i < arguments.length; i++) {
							args[i - 1] = arguments[i];
					}
			}
			queue.push(new Item(fun, args));
			if (queue.length === 1 && !draining) {
					runTimeout(drainQueue);
			}
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
			this.fun = fun;
			this.array = array;
	}
	Item.prototype.run = function () {
			this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
			throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
			throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };
	
	},{}],199:[function(require,module,exports){
	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var logger = require('./logger')('Message');
	var utils = require('./utils');
	
	var Message = function () {
		function Message() {
			_classCallCheck(this, Message);
		}
	
		_createClass(Message, null, [{
			key: 'parse',
			value: function parse(raw) {
				var object = void 0;
				var message = {};
	
				try {
					object = JSON.parse(raw);
				} catch (error) {
					logger.error('parse() | invalid JSON: %s', error);
	
					return;
				}
	
				if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object' || Array.isArray(object)) {
					logger.error('parse() | not an object');
	
					return;
				}
	
				if (typeof object.id !== 'number') {
					logger.error('parse() | missing/invalid id field');
	
					return;
				}
	
				message.id = object.id;
	
				// Request.
				if (object.request) {
					message.request = true;
	
					if (typeof object.method !== 'string') {
						logger.error('parse() | missing/invalid method field');
	
						return;
					}
	
					message.method = object.method;
					message.data = object.data || {};
				}
				// Response.
				else if (object.response) {
						message.response = true;
	
						// Success.
						if (object.ok) {
							message.ok = true;
							message.data = object.data || {};
						}
						// Error.
						else {
								message.errorCode = object.errorCode;
								message.errorReason = object.errorReason;
							}
					}
					// Invalid.
					else {
							logger.error('parse() | missing request/response field');
	
							return;
						}
	
				return message;
			}
		}, {
			key: 'requestFactory',
			value: function requestFactory(method, data) {
				var request = {
					request: true,
					id: utils.randomNumber(),
					method: method,
					data: data || {}
				};
	
				return request;
			}
		}, {
			key: 'successResponseFactory',
			value: function successResponseFactory(request, data) {
				var response = {
					response: true,
					id: request.id,
					ok: true,
					data: data || {}
				};
	
				return response;
			}
		}, {
			key: 'errorResponseFactory',
			value: function errorResponseFactory(request, errorCode, errorReason) {
				var response = {
					response: true,
					id: request.id,
					errorCode: errorCode,
					errorReason: errorReason
				};
	
				return response;
			}
		}]);
	
		return Message;
	}();
	
	module.exports = Message;
	},{"./logger":202,"./utils":205}],200:[function(require,module,exports){
	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var EventEmitter = require('events').EventEmitter;
	var logger = require('./logger')('Peer');
	var Message = require('./Message');
	
	// Max time waiting for a response.
	var REQUEST_TIMEOUT = 20000;
	
	var Peer = function (_EventEmitter) {
		_inherits(Peer, _EventEmitter);
	
		function Peer(transport) {
			_classCallCheck(this, Peer);
	
			logger.debug('constructor()');
	
			var _this = _possibleConstructorReturn(this, (Peer.__proto__ || Object.getPrototypeOf(Peer)).call(this));
	
			_this.setMaxListeners(Infinity);
	
			// Transport.
			_this._transport = transport;
	
			// Closed flag.
			_this._closed = false;
	
			// Custom data object.
			_this._data = {};
	
			// Map of sent requests' handlers indexed by request.id.
			_this._requestHandlers = new Map();
	
			// Handle transport.
			_this._handleTransport();
			return _this;
		}
	
		_createClass(Peer, [{
			key: 'send',
			value: function send(method, data) {
				var _this2 = this;
	
				var request = Message.requestFactory(method, data);
	
				return this._transport.send(request).then(function () {
					return new Promise(function (pResolve, pReject) {
						var handler = {
							resolve: function resolve(data2) {
								if (!_this2._requestHandlers.delete(request.id)) return;
	
								clearTimeout(handler.timer);
								pResolve(data2);
							},
	
							reject: function reject(error) {
								if (!_this2._requestHandlers.delete(request.id)) return;
	
								clearTimeout(handler.timer);
								pReject(error);
							},
	
							timer: setTimeout(function () {
								if (!_this2._requestHandlers.delete(request.id)) return;
	
								pReject(new Error('request timeout'));
							}, REQUEST_TIMEOUT),
	
							close: function close() {
								clearTimeout(handler.timer);
								pReject(new Error('peer closed'));
							}
						};
	
						// Add handler stuff to the Map.
						_this2._requestHandlers.set(request.id, handler);
					});
				});
			}
		}, {
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				if (this._closed) return;
	
				this._closed = true;
	
				// Close transport.
				this._transport.close();
	
				// Close every pending request handler.
				this._requestHandlers.forEach(function (handler) {
					return handler.close();
				});
	
				// Emit 'close' event.
				this.emit('close');
			}
		}, {
			key: '_handleTransport',
			value: function _handleTransport() {
				var _this3 = this;
	
				if (this._transport.closed) {
					this._closed = true;
					setTimeout(function () {
						return _this3.emit('close');
					});
	
					return;
				}
	
				this._transport.on('connecting', function (currentAttempt) {
					_this3.emit('connecting', currentAttempt);
				});
	
				this._transport.on('open', function () {
					if (_this3._closed) return;
	
					// Emit 'open' event.
					_this3.emit('open');
				});
	
				this._transport.on('disconnected', function () {
					_this3.emit('disconnected');
				});
	
				this._transport.on('failed', function (currentAttempt) {
					_this3.emit('failed', currentAttempt);
				});
	
				this._transport.on('close', function () {
					if (_this3._closed) return;
	
					_this3._closed = true;
	
					// Emit 'close' event.
					_this3.emit('close');
				});
	
				this._transport.on('message', function (message) {
					if (message.response) {
						_this3._handleResponse(message);
					} else if (message.request) {
						_this3._handleRequest(message);
					}
				});
			}
		}, {
			key: '_handleResponse',
			value: function _handleResponse(response) {
				var handler = this._requestHandlers.get(response.id);
	
				if (!handler) {
					logger.error('received response does not match any sent request');
	
					return;
				}
	
				if (response.ok) {
					handler.resolve(response.data);
				} else {
					var error = new Error(response.errorReason);
	
					error.code = response.errorCode;
					handler.reject(error);
				}
			}
		}, {
			key: '_handleRequest',
			value: function _handleRequest(request) {
				var _this4 = this;
	
				this.emit('request',
				// Request.
				request,
				// accept() function.
				function (data) {
					var response = Message.successResponseFactory(request, data);
	
					_this4._transport.send(response).catch(function (error) {
						logger.warn('accept() failed, response could not be sent: %o', error);
					});
				},
				// reject() function.
				function (errorCode, errorReason) {
					if (errorCode instanceof Error) {
						errorReason = errorCode.toString();
						errorCode = 500;
					} else if (typeof errorCode === 'number' && errorReason instanceof Error) {
						errorReason = errorReason.toString();
					}
	
					var response = Message.errorResponseFactory(request, errorCode, errorReason);
	
					_this4._transport.send(response).catch(function (error) {
						logger.warn('reject() failed, response could not be sent: %o', error);
					});
				});
			}
		}, {
			key: 'data',
			get: function get() {
				return this._data;
			},
			set: function set(obj) {
				this._data = obj || {};
			}
		}, {
			key: 'closed',
			get: function get() {
				return this._closed;
			}
		}]);
	
		return Peer;
	}(EventEmitter);
	
	module.exports = Peer;
	},{"./Message":199,"./logger":202,"events":60}],201:[function(require,module,exports){
	'use strict';
	
	var Peer = require('./Peer');
	var transports = require('./transports');
	
	module.exports = {
		/**
		* Expose Peer.
		*/
		Peer: Peer,
	
		/**
		* Expose the built-in WebSocketTransport.
		*/
		WebSocketTransport: transports.WebSocketTransport
	};
	},{"./Peer":200,"./transports":204}],202:[function(require,module,exports){
	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var debug = require('debug');
	
	var APP_NAME = 'protoo-client';
	
	var Logger = function () {
		function Logger(prefix) {
			_classCallCheck(this, Logger);
	
			if (prefix) {
				this._debug = debug(APP_NAME + ':' + prefix);
				this._warn = debug(APP_NAME + ':WARN:' + prefix);
				this._error = debug(APP_NAME + ':ERROR:' + prefix);
			} else {
				this._debug = debug(APP_NAME);
				this._warn = debug(APP_NAME + ':WARN');
				this._error = debug(APP_NAME + ':ERROR');
			}
	
			/* eslint-disable no-console */
			this._debug.log = console.info.bind(console);
			this._warn.log = console.warn.bind(console);
			this._error.log = console.error.bind(console);
			/* eslint-enable no-console */
		}
	
		_createClass(Logger, [{
			key: 'debug',
			get: function get() {
				return this._debug;
			}
		}, {
			key: 'warn',
			get: function get() {
				return this._warn;
			}
		}, {
			key: 'error',
			get: function get() {
				return this._error;
			}
		}]);
	
		return Logger;
	}();
	
	module.exports = function (prefix) {
		return new Logger(prefix);
	};
	},{"debug":192}],203:[function(require,module,exports){
	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var EventEmitter = require('events').EventEmitter;
	var W3CWebSocket = require('websocket').w3cwebsocket;
	var retry = require('retry');
	var logger = require('../logger')('WebSocketTransport');
	var Message = require('../Message');
	
	var WS_SUBPROTOCOL = 'protoo';
	var DEFAULT_RETRY_OPTIONS = {
		retries: 10,
		factor: 2,
		minTimeout: 1 * 1000,
		maxTimeout: 8 * 1000
	};
	
	var WebSocketTransport = function (_EventEmitter) {
		_inherits(WebSocketTransport, _EventEmitter);
	
		function WebSocketTransport(url, options) {
			_classCallCheck(this, WebSocketTransport);
	
			logger.debug('constructor() [url:"%s", options:%o]', url, options);
	
			var _this = _possibleConstructorReturn(this, (WebSocketTransport.__proto__ || Object.getPrototypeOf(WebSocketTransport)).call(this));
	
			_this.setMaxListeners(Infinity);
	
			// Save URL and options.
			_this._url = url;
			_this._options = options || {};
	
			// WebSocket instance.
			_this._ws = null;
	
			// Closed flag.
			_this._closed = false;
	
			// Set WebSocket
			_this._setWebSocket();
			return _this;
		}
	
		_createClass(WebSocketTransport, [{
			key: 'send',
			value: function send(message) {
				if (this._closed) return Promise.reject(new Error('transport closed'));
	
				try {
					this._ws.send(JSON.stringify(message));
	
					return Promise.resolve();
				} catch (error) {
					logger.error('send() | error sending message: %o', error);
	
					return Promise.reject(error);
				}
			}
		}, {
			key: 'close',
			value: function close() {
				logger.debug('close()');
	
				if (this._closed) return;
	
				// Don't wait for the WebSocket 'close' event, do it now.
				this._closed = true;
				this.emit('close');
	
				try {
					this._ws.onopen = null;
					this._ws.onclose = null;
					this._ws.onerror = null;
					this._ws.onmessage = null;
					this._ws.close();
				} catch (error) {
					logger.error('close() | error closing the WebSocket: %o', error);
				}
			}
		}, {
			key: '_setWebSocket',
			value: function _setWebSocket() {
				var _this2 = this;
	
				var options = this._options;
				var operation = retry.operation(this._options.retry || DEFAULT_RETRY_OPTIONS);
				var wasConnected = false;
	
				operation.attempt(function (currentAttempt) {
					if (_this2._closed) {
						operation.stop();
	
						return;
					}
	
					logger.debug('_setWebSocket() [currentAttempt:%s]', currentAttempt);
	
					_this2._ws = new W3CWebSocket(_this2._url, WS_SUBPROTOCOL, options.origin, options.headers, options.requestOptions, options.clientConfig);
	
					_this2.emit('connecting', currentAttempt);
	
					_this2._ws.onopen = function () {
						if (_this2._closed) return;
	
						wasConnected = true;
	
						// Emit 'open' event.
						_this2.emit('open');
					};
	
					_this2._ws.onclose = function (event) {
						if (_this2._closed) return;
	
						logger.warn('WebSocket "close" event [wasClean:%s, code:%s, reason:"%s"]', event.wasClean, event.code, event.reason);
	
						// Don't retry if code is 4000 (closed by the server).
						if (event.code !== 4000) {
							// If it was not connected, try again.
							if (!wasConnected) {
								_this2.emit('failed', currentAttempt);
	
								if (operation.retry(true)) return;
							}
							// If it was connected, start from scratch.
							else {
									operation.stop();
	
									_this2.emit('disconnected');
									_this2._setWebSocket();
	
									return;
								}
						}
	
						_this2._closed = true;
	
						// Emit 'close' event.
						_this2.emit('close');
					};
	
					_this2._ws.onerror = function () {
						if (_this2._closed) return;
	
						logger.error('WebSocket "error" event');
					};
	
					_this2._ws.onmessage = function (event) {
						if (_this2._closed) return;
	
						var message = Message.parse(event.data);
	
						if (!message) return;
	
						if (_this2.listenerCount('message') === 0) {
							logger.error('no listeners for WebSocket "message" event, ignoring received message');
	
							return;
						}
	
						// Emit 'message' event.
						_this2.emit('message', message);
					};
				});
			}
		}, {
			key: 'closed',
			get: function get() {
				return this._closed;
			}
		}]);
	
		return WebSocketTransport;
	}(EventEmitter);
	
	module.exports = WebSocketTransport;
	},{"../Message":199,"../logger":202,"events":60,"retry":209,"websocket":218}],204:[function(require,module,exports){
	'use strict';
	
	var WebSocketTransport = require('./WebSocketTransport');
	
	module.exports = {
		WebSocketTransport: WebSocketTransport
	};
	},{"./WebSocketTransport":203}],205:[function(require,module,exports){
	'use strict';
	
	var randomNumber = require('random-number');
	
	var randomNumberGenerator = randomNumber.generator({
		min: 1000000,
		max: 9999999,
		integer: true
	});
	
	module.exports = {
		randomNumber: randomNumberGenerator
	};
	},{"random-number":207}],206:[function(require,module,exports){
	'use strict';
	
	var has = Object.prototype.hasOwnProperty;
	
	/**
	 * Decode a URI encoded string.
	 *
	 * @param {String} input The URI encoded string.
	 * @returns {String} The decoded string.
	 * @api private
	 */
	function decode(input) {
		return decodeURIComponent(input.replace(/\+/g, ' '));
	}
	
	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
		var parser = /([^=?&]+)=?([^&]*)/g
			, result = {}
			, part;
	
		//
		// Little nifty parsing hack, leverage the fact that RegExp.exec increments
		// the lastIndex property so we can continue executing this loop until we've
		// parsed all results.
		//
		for (;
			part = parser.exec(query);
			result[decode(part[1])] = decode(part[2])
		);
	
		return result;
	}
	
	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
		prefix = prefix || '';
	
		var pairs = [];
	
		//
		// Optionally prefix with a '?' if needed
		//
		if ('string' !== typeof prefix) prefix = '?';
	
		for (var key in obj) {
			if (has.call(obj, key)) {
				pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
			}
		}
	
		return pairs.length ? prefix + pairs.join('&') : '';
	}
	
	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;
	
	},{}],207:[function(require,module,exports){
	void function(root){
	
		function defaults(options){
			var options = options || {}
			var min = options.min
			var max = options.max
			var integer = options.integer || false
			if ( min == null && max == null ) {
				min = 0
				max = 1
			} else if ( min == null ) {
				min = max - 1
			} else if ( max == null ) {
				max = min + 1
			}
			if ( max < min ) throw new Error('invalid options, max must be >= min')
			return {
				min:     min
			, max:     max
			, integer: integer
			}
		}
	
		function random(options){
			options = defaults(options)
			if ( options.max === options.min ) return options.min
			var r = Math.random() * (options.max - options.min + Number(!!options.integer)) + options.min
			return options.integer ? Math.floor(r) : r
		}
	
		function generator(options){
			options = defaults(options)
			return function(min, max, integer){
				options.min     = min != null ? min : options.min
				options.max     = max != null ? max : options.max
				options.integer = integer != null ? integer : options.integer
				return random(options)
			}
		}
	
		module.exports =  random
		module.exports.generator = generator
		module.exports.defaults = defaults
	}(this)
	
	},{}],208:[function(require,module,exports){
	'use strict';
	
	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
		protocol = protocol.split(':')[0];
		port = +port;
	
		if (!port) return false;
	
		switch (protocol) {
			case 'http':
			case 'ws':
			return port !== 80;
	
			case 'https':
			case 'wss':
			return port !== 443;
	
			case 'ftp':
			return port !== 21;
	
			case 'gopher':
			return port !== 70;
	
			case 'file':
			return false;
		}
	
		return port !== 0;
	};
	
	},{}],209:[function(require,module,exports){
	module.exports = require('./lib/retry');
	},{"./lib/retry":210}],210:[function(require,module,exports){
	var RetryOperation = require('./retry_operation');
	
	exports.operation = function(options) {
		var timeouts = exports.timeouts(options);
		return new RetryOperation(timeouts, {
				forever: options && options.forever,
				unref: options && options.unref
		});
	};
	
	exports.timeouts = function(options) {
		if (options instanceof Array) {
			return [].concat(options);
		}
	
		var opts = {
			retries: 10,
			factor: 2,
			minTimeout: 1 * 1000,
			maxTimeout: Infinity,
			randomize: false
		};
		for (var key in options) {
			opts[key] = options[key];
		}
	
		if (opts.minTimeout > opts.maxTimeout) {
			throw new Error('minTimeout is greater than maxTimeout');
		}
	
		var timeouts = [];
		for (var i = 0; i < opts.retries; i++) {
			timeouts.push(this.createTimeout(i, opts));
		}
	
		if (options && options.forever && !timeouts.length) {
			timeouts.push(this.createTimeout(i, opts));
		}
	
		// sort the array numerically ascending
		timeouts.sort(function(a,b) {
			return a - b;
		});
	
		return timeouts;
	};
	
	exports.createTimeout = function(attempt, opts) {
		var random = (opts.randomize)
			? (Math.random() + 1)
			: 1;
	
		var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
		timeout = Math.min(timeout, opts.maxTimeout);
	
		return timeout;
	};
	
	exports.wrap = function(obj, options, methods) {
		if (options instanceof Array) {
			methods = options;
			options = null;
		}
	
		if (!methods) {
			methods = [];
			for (var key in obj) {
				if (typeof obj[key] === 'function') {
					methods.push(key);
				}
			}
		}
	
		for (var i = 0; i < methods.length; i++) {
			var method   = methods[i];
			var original = obj[method];
	
			obj[method] = function retryWrapper() {
				var op       = exports.operation(options);
				var args     = Array.prototype.slice.call(arguments);
				var callback = args.pop();
	
				args.push(function(err) {
					if (op.retry(err)) {
						return;
					}
					if (err) {
						arguments[0] = op.mainError();
					}
					callback.apply(this, arguments);
				});
	
				op.attempt(function() {
					original.apply(obj, args);
				});
			};
			obj[method].options = options;
		}
	};
	
	},{"./retry_operation":211}],211:[function(require,module,exports){
	function RetryOperation(timeouts, options) {
		// Compatibility for the old (timeouts, retryForever) signature
		if (typeof options === 'boolean') {
			options = { forever: options };
		}
	
		this._timeouts = timeouts;
		this._options = options || {};
		this._fn = null;
		this._errors = [];
		this._attempts = 1;
		this._operationTimeout = null;
		this._operationTimeoutCb = null;
		this._timeout = null;
	
		if (this._options.forever) {
			this._cachedTimeouts = this._timeouts.slice(0);
		}
	}
	module.exports = RetryOperation;
	
	RetryOperation.prototype.stop = function() {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
	
		this._timeouts       = [];
		this._cachedTimeouts = null;
	};
	
	RetryOperation.prototype.retry = function(err) {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
	
		if (!err) {
			return false;
		}
	
		this._errors.push(err);
	
		var timeout = this._timeouts.shift();
		if (timeout === undefined) {
			if (this._cachedTimeouts) {
				// retry forever, only keep last error
				this._errors.splice(this._errors.length - 1, this._errors.length);
				this._timeouts = this._cachedTimeouts.slice(0);
				timeout = this._timeouts.shift();
			} else {
				return false;
			}
		}
	
		var self = this;
		var timer = setTimeout(function() {
			self._attempts++;
	
			if (self._operationTimeoutCb) {
				self._timeout = setTimeout(function() {
					self._operationTimeoutCb(self._attempts);
				}, self._operationTimeout);
	
				if (this._options.unref) {
						self._timeout.unref();
				}
			}
	
			self._fn(self._attempts);
		}, timeout);
	
		if (this._options.unref) {
				timer.unref();
		}
	
		return true;
	};
	
	RetryOperation.prototype.attempt = function(fn, timeoutOps) {
		this._fn = fn;
	
		if (timeoutOps) {
			if (timeoutOps.timeout) {
				this._operationTimeout = timeoutOps.timeout;
			}
			if (timeoutOps.cb) {
				this._operationTimeoutCb = timeoutOps.cb;
			}
		}
	
		var self = this;
		if (this._operationTimeoutCb) {
			this._timeout = setTimeout(function() {
				self._operationTimeoutCb();
			}, self._operationTimeout);
		}
	
		this._fn(this._attempts);
	};
	
	RetryOperation.prototype.try = function(fn) {
		console.log('Using RetryOperation.try() is deprecated');
		this.attempt(fn);
	};
	
	RetryOperation.prototype.start = function(fn) {
		console.log('Using RetryOperation.start() is deprecated');
		this.attempt(fn);
	};
	
	RetryOperation.prototype.start = RetryOperation.prototype.try;
	
	RetryOperation.prototype.errors = function() {
		return this._errors;
	};
	
	RetryOperation.prototype.attempts = function() {
		return this._attempts;
	};
	
	RetryOperation.prototype.mainError = function() {
		if (this._errors.length === 0) {
			return null;
		}
	
		var counts = {};
		var mainError = null;
		var mainErrorCount = 0;
	
		for (var i = 0; i < this._errors.length; i++) {
			var error = this._errors[i];
			var message = error.message;
			var count = (counts[message] || 0) + 1;
	
			counts[message] = count;
	
			if (count >= mainErrorCount) {
				mainError = error;
				mainErrorCount = count;
			}
		}
	
		return mainError;
	};
	
	},{}],212:[function(require,module,exports){
	var grammar = module.exports = {
		v: [{
			name: 'version',
			reg: /^(\d*)$/
		}],
		o: [{ //o=- 20518 0 IN IP4 203.0.113.1
			// NB: sessionId will be a String in most cases because it is huge
			name: 'origin',
			reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
			names: ['username', 'sessionId', 'sessionVersion', 'netType', 'ipVer', 'address'],
			format: '%s %s %d %s IP%d %s'
		}],
		// default parsing of these only (though some of these feel outdated)
		s: [{ name: 'name' }],
		i: [{ name: 'description' }],
		u: [{ name: 'uri' }],
		e: [{ name: 'email' }],
		p: [{ name: 'phone' }],
		z: [{ name: 'timezones' }], // TODO: this one can actually be parsed properly..
		r: [{ name: 'repeats' }],   // TODO: this one can also be parsed properly
		//k: [{}], // outdated thing ignored
		t: [{ //t=0 0
			name: 'timing',
			reg: /^(\d*) (\d*)/,
			names: ['start', 'stop'],
			format: '%d %d'
		}],
		c: [{ //c=IN IP4 10.47.197.26
			name: 'connection',
			reg: /^IN IP(\d) (\S*)/,
			names: ['version', 'ip'],
			format: 'IN IP%d %s'
		}],
		b: [{ //b=AS:4000
			push: 'bandwidth',
			reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
			names: ['type', 'limit'],
			format: '%s:%s'
		}],
		m: [{ //m=video 51744 RTP/AVP 126 97 98 34 31
			// NB: special - pushes to session
			// TODO: rtp/fmtp should be filtered by the payloads found here?
			reg: /^(\w*) (\d*) ([\w\/]*)(?: (.*))?/,
			names: ['type', 'port', 'protocol', 'payloads'],
			format: '%s %d %s %s'
		}],
		a: [
			{ //a=rtpmap:110 opus/48000/2
				push: 'rtp',
				reg: /^rtpmap:(\d*) ([\w\-\.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
				names: ['payload', 'codec', 'rate', 'encoding'],
				format: function (o) {
					return (o.encoding) ?
						'rtpmap:%d %s/%s/%s':
						o.rate ?
						'rtpmap:%d %s/%s':
						'rtpmap:%d %s';
				}
			},
			{ //a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
				//a=fmtp:111 minptime=10; useinbandfec=1
				push: 'fmtp',
				reg: /^fmtp:(\d*) ([\S| ]*)/,
				names: ['payload', 'config'],
				format: 'fmtp:%d %s'
			},
			{ //a=control:streamid=0
				name: 'control',
				reg: /^control:(.*)/,
				format: 'control:%s'
			},
			{ //a=rtcp:65179 IN IP4 193.84.77.194
				name: 'rtcp',
				reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
				names: ['port', 'netType', 'ipVer', 'address'],
				format: function (o) {
					return (o.address != null) ?
						'rtcp:%d %s IP%d %s':
						'rtcp:%d';
				}
			},
			{ //a=rtcp-fb:98 trr-int 100
				push: 'rtcpFbTrrInt',
				reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
				names: ['payload', 'value'],
				format: 'rtcp-fb:%d trr-int %d'
			},
			{ //a=rtcp-fb:98 nack rpsi
				push: 'rtcpFb',
				reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
				names: ['payload', 'type', 'subtype'],
				format: function (o) {
					return (o.subtype != null) ?
						'rtcp-fb:%s %s %s':
						'rtcp-fb:%s %s';
				}
			},
			{ //a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
				//a=extmap:1/recvonly URI-gps-string
				push: 'ext',
				reg: /^extmap:(\d+)(?:\/(\w+))? (\S*)(?: (\S*))?/,
				names: ['value', 'direction', 'uri', 'config'],
				format: function (o) {
					return 'extmap:%d' + (o.direction ? '/%s' : '%v') + ' %s' + (o.config ? ' %s' : '');
				}
			},
			{ //a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
				push: 'crypto',
				reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
				names: ['id', 'suite', 'config', 'sessionConfig'],
				format: function (o) {
					return (o.sessionConfig != null) ?
						'crypto:%d %s %s %s':
						'crypto:%d %s %s';
				}
			},
			{ //a=setup:actpass
				name: 'setup',
				reg: /^setup:(\w*)/,
				format: 'setup:%s'
			},
			{ //a=mid:1
				name: 'mid',
				reg: /^mid:([^\s]*)/,
				format: 'mid:%s'
			},
			{ //a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
				name: 'msid',
				reg: /^msid:(.*)/,
				format: 'msid:%s'
			},
			{ //a=ptime:20
				name: 'ptime',
				reg: /^ptime:(\d*)/,
				format: 'ptime:%d'
			},
			{ //a=maxptime:60
				name: 'maxptime',
				reg: /^maxptime:(\d*)/,
				format: 'maxptime:%d'
			},
			{ //a=sendrecv
				name: 'direction',
				reg: /^(sendrecv|recvonly|sendonly|inactive)/
			},
			{ //a=ice-lite
				name: 'icelite',
				reg: /^(ice-lite)/
			},
			{ //a=ice-ufrag:F7gI
				name: 'iceUfrag',
				reg: /^ice-ufrag:(\S*)/,
				format: 'ice-ufrag:%s'
			},
			{ //a=ice-pwd:x9cml/YzichV2+XlhiMu8g
				name: 'icePwd',
				reg: /^ice-pwd:(\S*)/,
				format: 'ice-pwd:%s'
			},
			{ //a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
				name: 'fingerprint',
				reg: /^fingerprint:(\S*) (\S*)/,
				names: ['type', 'hash'],
				format: 'fingerprint:%s %s'
			},
			{ //a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
				//a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
				//a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
				//a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
				//a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
				push:'candidates',
				reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
				names: ['foundation', 'component', 'transport', 'priority', 'ip', 'port', 'type', 'raddr', 'rport', 'tcptype', 'generation', 'network-id', 'network-cost'],
				format: function (o) {
					var str = 'candidate:%s %d %s %d %s %d typ %s';
	
					str += (o.raddr != null) ? ' raddr %s rport %d' : '%v%v';
	
					// NB: candidate has three optional chunks, so %void middles one if it's missing
					str += (o.tcptype != null) ? ' tcptype %s' : '%v';
	
					if (o.generation != null) {
						str += ' generation %d';
					}
	
					str += (o['network-id'] != null) ? ' network-id %d' : '%v';
					str += (o['network-cost'] != null) ? ' network-cost %d' : '%v';
					return str;
				}
			},
			{ //a=end-of-candidates (keep after the candidates line for readability)
				name: 'endOfCandidates',
				reg: /^(end-of-candidates)/
			},
			{ //a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
				name: 'remoteCandidates',
				reg: /^remote-candidates:(.*)/,
				format: 'remote-candidates:%s'
			},
			{ //a=ice-options:google-ice
				name: 'iceOptions',
				reg: /^ice-options:(\S*)/,
				format: 'ice-options:%s'
			},
			{ //a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
				push: 'ssrcs',
				reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
				names: ['id', 'attribute', 'value'],
				format: function (o) {
					var str = 'ssrc:%d';
					if (o.attribute != null) {
						str += ' %s';
						if (o.value != null) {
							str += ':%s';
						}
					}
					return str;
				}
			},
			{ //a=ssrc-group:FEC 1 2
				//a=ssrc-group:FEC-FR 3004364195 1080772241
				push: 'ssrcGroups',
				// token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
				reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
				names: ['semantics', 'ssrcs'],
				format: 'ssrc-group:%s %s'
			},
			{ //a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
				name: 'msidSemantic',
				reg: /^msid-semantic:\s?(\w*) (\S*)/,
				names: ['semantic', 'token'],
				format: 'msid-semantic: %s %s' // space after ':' is not accidental
			},
			{ //a=group:BUNDLE audio video
				push: 'groups',
				reg: /^group:(\w*) (.*)/,
				names: ['type', 'mids'],
				format: 'group:%s %s'
			},
			{ //a=rtcp-mux
				name: 'rtcpMux',
				reg: /^(rtcp-mux)/
			},
			{ //a=rtcp-rsize
				name: 'rtcpRsize',
				reg: /^(rtcp-rsize)/
			},
			{ //a=sctpmap:5000 webrtc-datachannel 1024
				name: 'sctpmap',
				reg: /^sctpmap:([\w_\/]*) (\S*)(?: (\S*))?/,
				names: ['sctpmapNumber', 'app', 'maxMessageSize'],
				format: function (o) {
					return (o.maxMessageSize != null) ?
						'sctpmap:%s %s %s' :
						'sctpmap:%s %s';
				}
			},
			{ //a=x-google-flag:conference
				name: 'xGoogleFlag',
				reg: /^x-google-flag:([^\s]*)/,
				format: 'x-google-flag:%s'
			},
			{ //a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
				push: 'rids',
				reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
				names: ['id', 'direction', 'params'],
				format: function (o) {
					return (o.params) ? 'rid:%s %s %s' : 'rid:%s %s';
				}
			},
			{ //a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
				//a=imageattr:* send [x=800,y=640] recv *
				//a=imageattr:100 recv [x=320,y=240]
				push: 'imageattrs',
				reg: new RegExp(
					//a=imageattr:97
					'^imageattr:(\\d+|\\*)' +
					//send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320]
					'[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)' +
					//recv [x=330,y=250]
					'(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?'
				),
				names: ['pt', 'dir1', 'attrs1', 'dir2', 'attrs2'],
				format: function (o) {
					return 'imageattr:%s %s %s' + (o.dir2 ? ' %s %s' : '');
				}
			},
			{ //a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
				//a=simulcast:recv 1;4,5 send 6;7
				name: 'simulcast',
				reg: new RegExp(
					//a=simulcast:
					'^simulcast:' +
					//send 1,2,3;~4,~5
					'(send|recv) ([a-zA-Z0-9\\-_~;,]+)' +
					//space + recv 6;~7,~8
					'(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?' +
					//end
					'$'
				),
				names: ['dir1', 'list1', 'dir2', 'list2'],
				format: function (o) {
					return 'simulcast:%s %s' + (o.dir2 ? ' %s %s' : '');
				}
			},
			{ //Old simulcast draft 03 (implemented by Firefox)
				//  https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
				//a=simulcast: recv pt=97;98 send pt=97
				//a=simulcast: send rid=5;6;7 paused=6,7
				name: 'simulcast_03',
				reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
				names: ['value'],
				format: 'simulcast: %s'
			},
			{
				//a=framerate:25
				//a=framerate:29.97
				name: 'framerate',
				reg: /^framerate:(\d+(?:$|\.\d+))/,
				format: 'framerate:%s'
			},
			{ // RFC4570
				//a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
				name: 'sourceFilter',
				reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
				names: ['filterMode', 'netType', 'addressTypes', 'destAddress', 'srcList'],
				format: 'source-filter: %s %s %s %s %s'
			},
			{ // any a= that we don't understand is kepts verbatim on media.invalid
				push: 'invalid',
				names: ['value']
			}
		]
	};
	
	// set sensible defaults to avoid polluting the grammar with boring details
	Object.keys(grammar).forEach(function (key) {
		var objs = grammar[key];
		objs.forEach(function (obj) {
			if (!obj.reg) {
				obj.reg = /(.*)/;
			}
			if (!obj.format) {
				obj.format = '%s';
			}
		});
	});
	
	},{}],213:[function(require,module,exports){
	var parser = require('./parser');
	var writer = require('./writer');
	
	exports.write = writer;
	exports.parse = parser.parse;
	exports.parseFmtpConfig = parser.parseFmtpConfig;
	exports.parseParams = parser.parseParams;
	exports.parsePayloads = parser.parsePayloads;
	exports.parseRemoteCandidates = parser.parseRemoteCandidates;
	exports.parseImageAttributes = parser.parseImageAttributes;
	exports.parseSimulcastStreamList = parser.parseSimulcastStreamList;
	
	},{"./parser":214,"./writer":215}],214:[function(require,module,exports){
	var toIntIfInt = function (v) {
		return String(Number(v)) === v ? Number(v) : v;
	};
	
	var attachProperties = function (match, location, names, rawName) {
		if (rawName && !names) {
			location[rawName] = toIntIfInt(match[1]);
		}
		else {
			for (var i = 0; i < names.length; i += 1) {
				if (match[i+1] != null) {
					location[names[i]] = toIntIfInt(match[i+1]);
				}
			}
		}
	};
	
	var parseReg = function (obj, location, content) {
		var needsBlank = obj.name && obj.names;
		if (obj.push && !location[obj.push]) {
			location[obj.push] = [];
		}
		else if (needsBlank && !location[obj.name]) {
			location[obj.name] = {};
		}
		var keyLocation = obj.push ?
			{} :  // blank object that will be pushed
			needsBlank ? location[obj.name] : location; // otherwise, named location or root
	
		attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);
	
		if (obj.push) {
			location[obj.push].push(keyLocation);
		}
	};
	
	var grammar = require('./grammar');
	var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
	
	exports.parse = function (sdp) {
		var session = {}
			, media = []
			, location = session; // points at where properties go under (one of the above)
	
		// parse lines we understand
		sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function (l) {
			var type = l[0];
			var content = l.slice(2);
			if (type === 'm') {
				media.push({rtp: [], fmtp: []});
				location = media[media.length-1]; // point at latest media line
			}
	
			for (var j = 0; j < (grammar[type] || []).length; j += 1) {
				var obj = grammar[type][j];
				if (obj.reg.test(content)) {
					return parseReg(obj, location, content);
				}
			}
		});
	
		session.media = media; // link it up
		return session;
	};
	
	var paramReducer = function (acc, expr) {
		var s = expr.split(/=(.+)/, 2);
		if (s.length === 2) {
			acc[s[0]] = toIntIfInt(s[1]);
		}
		return acc;
	};
	
	exports.parseParams = function (str) {
		return str.split(/\;\s?/).reduce(paramReducer, {});
	};
	
	// For backward compatibility - alias will be removed in 3.0.0
	exports.parseFmtpConfig = exports.parseParams;
	
	exports.parsePayloads = function (str) {
		return str.split(' ').map(Number);
	};
	
	exports.parseRemoteCandidates = function (str) {
		var candidates = [];
		var parts = str.split(' ').map(toIntIfInt);
		for (var i = 0; i < parts.length; i += 3) {
			candidates.push({
				component: parts[i],
				ip: parts[i + 1],
				port: parts[i + 2]
			});
		}
		return candidates;
	};
	
	exports.parseImageAttributes = function (str) {
		return str.split(' ').map(function (item) {
			return item.substring(1, item.length-1).split(',').reduce(paramReducer, {});
		});
	};
	
	exports.parseSimulcastStreamList = function (str) {
		return str.split(';').map(function (stream) {
			return stream.split(',').map(function (format) {
				var scid, paused = false;
	
				if (format[0] !== '~') {
					scid = toIntIfInt(format);
				} else {
					scid = toIntIfInt(format.substring(1, format.length));
					paused = true;
				}
	
				return {
					scid: scid,
					paused: paused
				};
			});
		});
	};
	
	},{"./grammar":212}],215:[function(require,module,exports){
	var grammar = require('./grammar');
	
	// customized util.format - discards excess arguments and can void middle ones
	var formatRegExp = /%[sdv%]/g;
	var format = function (formatStr) {
		var i = 1;
		var args = arguments;
		var len = args.length;
		return formatStr.replace(formatRegExp, function (x) {
			if (i >= len) {
				return x; // missing argument
			}
			var arg = args[i];
			i += 1;
			switch (x) {
			case '%%':
				return '%';
			case '%s':
				return String(arg);
			case '%d':
				return Number(arg);
			case '%v':
				return '';
			}
		});
		// NB: we discard excess arguments - they are typically undefined from makeLine
	};
	
	var makeLine = function (type, obj, location) {
		var str = obj.format instanceof Function ?
			(obj.format(obj.push ? location : location[obj.name])) :
			obj.format;
	
		var args = [type + '=' + str];
		if (obj.names) {
			for (var i = 0; i < obj.names.length; i += 1) {
				var n = obj.names[i];
				if (obj.name) {
					args.push(location[obj.name][n]);
				}
				else { // for mLine and push attributes
					args.push(location[obj.names[i]]);
				}
			}
		}
		else {
			args.push(location[obj.name]);
		}
		return format.apply(null, args);
	};
	
	// RFC specified order
	// TODO: extend this with all the rest
	var defaultOuterOrder = [
		'v', 'o', 's', 'i',
		'u', 'e', 'p', 'c',
		'b', 't', 'r', 'z', 'a'
	];
	var defaultInnerOrder = ['i', 'c', 'b', 'a'];
	
	
	module.exports = function (session, opts) {
		opts = opts || {};
		// ensure certain properties exist
		if (session.version == null) {
			session.version = 0; // 'v=0' must be there (only defined version atm)
		}
		if (session.name == null) {
			session.name = ' '; // 's= ' must be there if no meaningful name set
		}
		session.media.forEach(function (mLine) {
			if (mLine.payloads == null) {
				mLine.payloads = '';
			}
		});
	
		var outerOrder = opts.outerOrder || defaultOuterOrder;
		var innerOrder = opts.innerOrder || defaultInnerOrder;
		var sdp = [];
	
		// loop through outerOrder for matching properties on session
		outerOrder.forEach(function (type) {
			grammar[type].forEach(function (obj) {
				if (obj.name in session && session[obj.name] != null) {
					sdp.push(makeLine(type, obj, session));
				}
				else if (obj.push in session && session[obj.push] != null) {
					session[obj.push].forEach(function (el) {
						sdp.push(makeLine(type, obj, el));
					});
				}
			});
		});
	
		// then for each media line, follow the innerOrder
		session.media.forEach(function (mLine) {
			sdp.push(makeLine('m', grammar.m[0], mLine));
	
			innerOrder.forEach(function (type) {
				grammar[type].forEach(function (obj) {
					if (obj.name in mLine && mLine[obj.name] != null) {
						sdp.push(makeLine(type, obj, mLine));
					}
					else if (obj.push in mLine && mLine[obj.push] != null) {
						mLine[obj.push].forEach(function (el) {
							sdp.push(makeLine(type, obj, el));
						});
					}
				});
			});
		});
	
		return sdp.join('\r\n') + '\r\n';
	};
	
	},{"./grammar":212}],216:[function(require,module,exports){
	(function (global){
	'use strict';
	
	var required = require('requires-port')
		, qs = require('querystringify')
		, protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
		, slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
	
	/**
	 * These are the parse rules for the URL parser, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var rules = [
		['#', 'hash'],                        // Extract from the back.
		['?', 'query'],                       // Extract from the back.
		['/', 'pathname'],                    // Extract from the back.
		['@', 'auth', 1],                     // Extract from the front.
		[NaN, 'host', undefined, 1, 1],       // Set left over value.
		[/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
		[NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];
	
	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 };
	
	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	function lolcation(loc) {
		loc = loc || global.location || {};
	
		var finaldestination = {}
			, type = typeof loc
			, key;
	
		if ('blob:' === loc.protocol) {
			finaldestination = new URL(unescape(loc.pathname), {});
		} else if ('string' === type) {
			finaldestination = new URL(loc, {});
			for (key in ignore) delete finaldestination[key];
		} else if ('object' === type) {
			for (key in loc) {
				if (key in ignore) continue;
				finaldestination[key] = loc[key];
			}
	
			if (finaldestination.slashes === undefined) {
				finaldestination.slashes = slashes.test(loc.href);
			}
		}
	
		return finaldestination;
	}
	
	/**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase.
	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
	 * @property {String} rest Rest of the URL that is not part of the protocol.
	 */
	
	/**
	 * Extract protocol information from a URL with/without double slash ("//").
	 *
	 * @param {String} address URL we want to extract from.
	 * @return {ProtocolExtract} Extracted information.
	 * @api private
	 */
	function extractProtocol(address) {
		var match = protocolre.exec(address);
	
		return {
			protocol: match[1] ? match[1].toLowerCase() : '',
			slashes: !!match[2],
			rest: match[3]
		};
	}
	
	/**
	 * Resolve a relative URL pathname against a base URL pathname.
	 *
	 * @param {String} relative Pathname of the relative URL.
	 * @param {String} base Pathname of the base URL.
	 * @return {String} Resolved pathname.
	 * @api private
	 */
	function resolve(relative, base) {
		var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
			, i = path.length
			, last = path[i - 1]
			, unshift = false
			, up = 0;
	
		while (i--) {
			if (path[i] === '.') {
				path.splice(i, 1);
			} else if (path[i] === '..') {
				path.splice(i, 1);
				up++;
			} else if (up) {
				if (i === 0) unshift = true;
				path.splice(i, 1);
				up--;
			}
		}
	
		if (unshift) path.unshift('');
		if (last === '.' || last === '..') path.push('');
	
		return path.join('/');
	}
	
	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} location Location defaults for relative paths.
	 * @param {Boolean|Function} parser Parser for the query string.
	 * @api public
	 */
	function URL(address, location, parser) {
		if (!(this instanceof URL)) {
			return new URL(address, location, parser);
		}
	
		var relative, extracted, parse, instruction, index, key
			, instructions = rules.slice()
			, type = typeof location
			, url = this
			, i = 0;
	
		//
		// The following if statements allows this module two have compatibility with
		// 2 different API:
		//
		// 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
		//    where the boolean indicates that the query string should also be parsed.
		//
		// 2. The `URL` interface of the browser which accepts a URL, object as
		//    arguments. The supplied object will be used as default values / fall-back
		//    for relative paths.
		//
		if ('object' !== type && 'string' !== type) {
			parser = location;
			location = null;
		}
	
		if (parser && 'function' !== typeof parser) parser = qs.parse;
	
		location = lolcation(location);
	
		//
		// Extract protocol information before running the instructions.
		//
		extracted = extractProtocol(address || '');
		relative = !extracted.protocol && !extracted.slashes;
		url.slashes = extracted.slashes || relative && location.slashes;
		url.protocol = extracted.protocol || location.protocol || '';
		address = extracted.rest;
	
		//
		// When the authority component is absent the URL starts with a path
		// component.
		//
		if (!extracted.slashes) instructions[2] = [/(.*)/, 'pathname'];
	
		for (; i < instructions.length; i++) {
			instruction = instructions[i];
			parse = instruction[0];
			key = instruction[1];
	
			if (parse !== parse) {
				url[key] = address;
			} else if ('string' === typeof parse) {
				if (~(index = address.indexOf(parse))) {
					if ('number' === typeof instruction[2]) {
						url[key] = address.slice(0, index);
						address = address.slice(index + instruction[2]);
					} else {
						url[key] = address.slice(index);
						address = address.slice(0, index);
					}
				}
			} else if ((index = parse.exec(address))) {
				url[key] = index[1];
				address = address.slice(0, index.index);
			}
	
			url[key] = url[key] || (
				relative && instruction[3] ? location[key] || '' : ''
			);
	
			//
			// Hostname, host and protocol should be lowercased so they can be used to
			// create a proper `origin`.
			//
			if (instruction[4]) url[key] = url[key].toLowerCase();
		}
	
		//
		// Also parse the supplied query string in to an object. If we're supplied
		// with a custom parser as function use that instead of the default build-in
		// parser.
		//
		if (parser) url.query = parser(url.query);
	
		//
		// If the URL is relative, resolve the pathname against the base URL.
		//
		if (
				relative
			&& location.slashes
			&& url.pathname.charAt(0) !== '/'
			&& (url.pathname !== '' || location.pathname !== '')
		) {
			url.pathname = resolve(url.pathname, location.pathname);
		}
	
		//
		// We should not add port numbers if they are already the default port number
		// for a given protocol. As the host also contains the port number we're going
		// override it with the hostname which contains no port number.
		//
		if (!required(url.port, url.protocol)) {
			url.host = url.hostname;
			url.port = '';
		}
	
		//
		// Parse down the `auth` for the username and password.
		//
		url.username = url.password = '';
		if (url.auth) {
			instruction = url.auth.split(':');
			url.username = instruction[0] || '';
			url.password = instruction[1] || '';
		}
	
		url.origin = url.protocol && url.host && url.protocol !== 'file:'
			? url.protocol +'//'+ url.host
			: 'null';
	
		//
		// The href is just the compiled result.
		//
		url.href = url.toString();
	}
	
	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function
	 *                               used to parse the query.
	 *                               When setting the protocol, double slash will be
	 *                               removed from the final url if it is true.
	 * @returns {URL}
	 * @api public
	 */
	function set(part, value, fn) {
		var url = this;
	
		switch (part) {
			case 'query':
				if ('string' === typeof value && value.length) {
					value = (fn || qs.parse)(value);
				}
	
				url[part] = value;
				break;
	
			case 'port':
				url[part] = value;
	
				if (!required(value, url.protocol)) {
					url.host = url.hostname;
					url[part] = '';
				} else if (value) {
					url.host = url.hostname +':'+ value;
				}
	
				break;
	
			case 'hostname':
				url[part] = value;
	
				if (url.port) value += ':'+ url.port;
				url.host = value;
				break;
	
			case 'host':
				url[part] = value;
	
				if (/:\d+$/.test(value)) {
					value = value.split(':');
					url.port = value.pop();
					url.hostname = value.join(':');
				} else {
					url.hostname = value;
					url.port = '';
				}
	
				break;
	
			case 'protocol':
				url.protocol = value.toLowerCase();
				url.slashes = !fn;
				break;
	
			case 'pathname':
			case 'hash':
				if (value) {
					var char = part === 'pathname' ? '/' : '#';
					url[part] = value.charAt(0) !== char ? char + value : value;
				} else {
					url[part] = value;
				}
				break;
	
			default:
				url[part] = value;
		}
	
		for (var i = 0; i < rules.length; i++) {
			var ins = rules[i];
	
			if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
		}
	
		url.origin = url.protocol && url.host && url.protocol !== 'file:'
			? url.protocol +'//'+ url.host
			: 'null';
	
		url.href = url.toString();
	
		return url;
	}
	
	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	function toString(stringify) {
		if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
	
		var query
			, url = this
			, protocol = url.protocol;
	
		if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
	
		var result = protocol + (url.slashes ? '//' : '');
	
		if (url.username) {
			result += url.username;
			if (url.password) result += ':'+ url.password;
			result += '@';
		}
	
		result += url.host + url.pathname;
	
		query = 'object' === typeof url.query ? stringify(url.query) : url.query;
		if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;
	
		if (url.hash) result += url.hash;
	
		return result;
	}
	
	URL.prototype = { set: set, toString: toString };
	
	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	URL.extractProtocol = extractProtocol;
	URL.location = lolcation;
	URL.qs = qs;
	
	module.exports = URL;
	
	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	
	},{"querystringify":206,"requires-port":208}],217:[function(require,module,exports){
	// created by @HenrikJoreteg
	var prefix;
	var version;
	
	if (window.mozRTCPeerConnection || navigator.mozGetUserMedia) {
			prefix = 'moz';
			version = parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);
	} else if (window.webkitRTCPeerConnection || navigator.webkitGetUserMedia) {
			prefix = 'webkit';
			version = navigator.userAgent.match(/Chrom(e|ium)/) && parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);
	}
	
	var PC = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
	var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
	var MediaStream = window.webkitMediaStream || window.MediaStream;
	var screenSharing = window.location.protocol === 'https:' &&
			((prefix === 'webkit' && version >= 26) ||
			 (prefix === 'moz' && version >= 33))
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var videoEl = document.createElement('video');
	var supportVp8 = videoEl && videoEl.canPlayType && videoEl.canPlayType('video/webm; codecs="vp8", vorbis') === "probably";
	var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia;
	
	// export support flags and constructors.prototype && PC
	module.exports = {
			prefix: prefix,
			browserVersion: version,
			support: !!PC && supportVp8 && !!getUserMedia,
			// new support style
			supportRTCPeerConnection: !!PC,
			supportVp8: supportVp8,
			supportGetUserMedia: !!getUserMedia,
			supportDataChannel: !!(PC && PC.prototype && PC.prototype.createDataChannel),
			supportWebAudio: !!(AudioContext && AudioContext.prototype.createMediaStreamSource),
			supportMediaStream: !!(MediaStream && MediaStream.prototype.removeTrack),
			supportScreenSharing: !!screenSharing,
			// old deprecated style. Dont use this anymore
			dataChannel: !!(PC && PC.prototype && PC.prototype.createDataChannel),
			webAudio: !!(AudioContext && AudioContext.prototype.createMediaStreamSource),
			mediaStream: !!(MediaStream && MediaStream.prototype.removeTrack),
			screenSharing: !!screenSharing,
			// constructors
			AudioContext: AudioContext,
			PeerConnection: PC,
			SessionDescription: SessionDescription,
			IceCandidate: IceCandidate,
			MediaStream: MediaStream,
			getUserMedia: getUserMedia
	};
	
	},{}],218:[function(require,module,exports){
	var _global = (function() { return this; })();
	var NativeWebSocket = _global.WebSocket || _global.MozWebSocket;
	var websocket_version = require('./version');
	
	
	/**
	 * Expose a W3C WebSocket class with just one or two arguments.
	 */
	function W3CWebSocket(uri, protocols) {
		var native_instance;
	
		if (protocols) {
			native_instance = new NativeWebSocket(uri, protocols);
		}
		else {
			native_instance = new NativeWebSocket(uri);
		}
	
		/**
		 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
		 * class). Since it is an Object it will be returned as it is when creating an
		 * instance of W3CWebSocket via 'new W3CWebSocket()'.
		 *
		 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
		 */
		return native_instance;
	}
	if (NativeWebSocket) {
		['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
			Object.defineProperty(W3CWebSocket, prop, {
				get: function() { return NativeWebSocket[prop]; }
			});
		});
	}
	
	/**
	 * Module exports.
	 */
	module.exports = {
			'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
			'version'      : websocket_version
	};
	
	},{"./version":219}],219:[function(require,module,exports){
	module.exports = require('../package.json').version;
	
	},{"../package.json":220}],220:[function(require,module,exports){
	module.exports={
		"_args": [
			[
				"websocket@1.0.25",
				"/home/admin/voice/voice-chat/app"
			]
		],
		"_from": "websocket@1.0.25",
		"_id": "websocket@1.0.25",
		"_inBundle": false,
		"_integrity": "sha512-M58njvi6ZxVb5k7kpnHh2BvNKuBWiwIYvsToErBzWhvBZYwlEiLcyLrG41T1jRcrY9ettqPYEqduLI7ul54CVQ==",
		"_location": "/websocket",
		"_optional": true,
		"_phantomChildren": {
			"ms": "2.0.0"
		},
		"_requested": {
			"type": "version",
			"registry": true,
			"raw": "websocket@1.0.25",
			"name": "websocket",
			"escapedName": "websocket",
			"rawSpec": "1.0.25",
			"saveSpec": null,
			"fetchSpec": "1.0.25"
		},
		"_requiredBy": [
			"/protoo-client"
		],
		"_resolved": "https://registry.npmjs.org/websocket/-/websocket-1.0.25.tgz",
		"_spec": "1.0.25",
		"_where": "/home/admin/voice/voice-chat/app",
		"author": {
			"name": "Brian McKelvey",
			"email": "brian@worlize.com",
			"url": "https://www.worlize.com/"
		},
		"browser": "lib/browser.js",
		"bugs": {
			"url": "https://github.com/theturtle32/WebSocket-Node/issues"
		},
		"config": {
			"verbose": false
		},
		"contributors": [
			{
				"name": "IÃ±aki Baz Castillo",
				"email": "ibc@aliax.net",
				"url": "http://dev.sipdoc.net"
			}
		],
		"dependencies": {
			"debug": "^2.2.0",
			"nan": "^2.3.3",
			"typedarray-to-buffer": "^3.1.2",
			"yaeti": "^0.0.6"
		},
		"description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
		"devDependencies": {
			"buffer-equal": "^1.0.0",
			"faucet": "^0.0.1",
			"gulp": "git+https://github.com/gulpjs/gulp.git#4.0",
			"gulp-jshint": "^2.0.4",
			"jshint": "^2.0.0",
			"jshint-stylish": "^2.2.1",
			"tape": "^4.0.1"
		},
		"directories": {
			"lib": "./lib"
		},
		"engines": {
			"node": ">=0.10.0"
		},
		"homepage": "https://github.com/theturtle32/WebSocket-Node",
		"keywords": [
			"websocket",
			"websockets",
			"socket",
			"networking",
			"comet",
			"push",
			"RFC-6455",
			"realtime",
			"server",
			"client"
		],
		"license": "Apache-2.0",
		"main": "index",
		"name": "websocket",
		"repository": {
			"type": "git",
			"url": "git+https://github.com/theturtle32/WebSocket-Node.git"
		},
		"scripts": {
			"gulp": "gulp",
			"install": "(node-gyp rebuild 2> builderror.log) || (exit 0)",
			"test": "faucet test/unit"
		},
		"version": "1.0.25"
	}
	
	},{}],221:[function(require,module,exports){
	/*
	WildEmitter.js is a slim little event emitter by @henrikjoreteg largely based
	on @visionmedia's Emitter from UI Kit.
	
	Why? I wanted it standalone.
	
	I also wanted support for wildcard emitters like this:
	
	emitter.on('*', function (eventName, other, event, payloads) {
	
	});
	
	emitter.on('somenamespace*', function (eventName, payloads) {
	
	});
	
	Please note that callbacks triggered by wildcard registered events also get
	the event name as the first argument.
	*/
	
	module.exports = WildEmitter;
	
	function WildEmitter() { }
	
	WildEmitter.mixin = function (constructor) {
			var prototype = constructor.prototype || constructor;
	
			prototype.isWildEmitter= true;
	
			// Listen on the given `event` with `fn`. Store a group name if present.
			prototype.on = function (event, groupName, fn) {
					this.callbacks = this.callbacks || {};
					var hasGroup = (arguments.length === 3),
							group = hasGroup ? arguments[1] : undefined,
							func = hasGroup ? arguments[2] : arguments[1];
					func._groupName = group;
					(this.callbacks[event] = this.callbacks[event] || []).push(func);
					return this;
			};
	
			// Adds an `event` listener that will be invoked a single
			// time then automatically removed.
			prototype.once = function (event, groupName, fn) {
					var self = this,
							hasGroup = (arguments.length === 3),
							group = hasGroup ? arguments[1] : undefined,
							func = hasGroup ? arguments[2] : arguments[1];
					function on() {
							self.off(event, on);
							func.apply(this, arguments);
					}
					this.on(event, group, on);
					return this;
			};
	
			// Unbinds an entire group
			prototype.releaseGroup = function (groupName) {
					this.callbacks = this.callbacks || {};
					var item, i, len, handlers;
					for (item in this.callbacks) {
							handlers = this.callbacks[item];
							for (i = 0, len = handlers.length; i < len; i++) {
									if (handlers[i]._groupName === groupName) {
											//console.log('removing');
											// remove it and shorten the array we're looping through
											handlers.splice(i, 1);
											i--;
											len--;
									}
							}
					}
					return this;
			};
	
			// Remove the given callback for `event` or all
			// registered callbacks.
			prototype.off = function (event, fn) {
					this.callbacks = this.callbacks || {};
					var callbacks = this.callbacks[event],
							i;
	
					if (!callbacks) return this;
	
					// remove all handlers
					if (arguments.length === 1) {
							delete this.callbacks[event];
							return this;
					}
	
					// remove specific handler
					i = callbacks.indexOf(fn);
					callbacks.splice(i, 1);
					if (callbacks.length === 0) {
							delete this.callbacks[event];
					}
					return this;
			};
	
			/// Emit `event` with the given args.
			// also calls any `*` handlers
			prototype.emit = function (event) {
					this.callbacks = this.callbacks || {};
					var args = [].slice.call(arguments, 1),
							callbacks = this.callbacks[event],
							specialCallbacks = this.getWildcardCallbacks(event),
							i,
							len,
							item,
							listeners;
	
					if (callbacks) {
							listeners = callbacks.slice();
							for (i = 0, len = listeners.length; i < len; ++i) {
									if (!listeners[i]) {
											break;
									}
									listeners[i].apply(this, args);
							}
					}
	
					if (specialCallbacks) {
							len = specialCallbacks.length;
							listeners = specialCallbacks.slice();
							for (i = 0, len = listeners.length; i < len; ++i) {
									if (!listeners[i]) {
											break;
									}
									listeners[i].apply(this, [event].concat(args));
							}
					}
	
					return this;
			};
	
			// Helper for for finding special wildcard event handlers that match the event
			prototype.getWildcardCallbacks = function (eventName) {
					this.callbacks = this.callbacks || {};
					var item,
							split,
							result = [];
	
					for (item in this.callbacks) {
							split = item.split('*');
							if (item === '*' || (split.length === 2 && eventName.slice(0, split[0].length) === split[0])) {
									result = result.concat(this.callbacks[item]);
							}
					}
					return result;
			};
	
	};
	
	WildEmitter.mixin(WildEmitter);
	
	},{}]},{},[5])