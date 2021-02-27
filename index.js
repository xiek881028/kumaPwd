import './shim';
import React from 'react';
import {
	AppRegistry,
} from 'react-native';
import App from './src/App.js';

if (!__DEV__) {
	global.console = {
		info: () => { },
		log: () => { },
		warn: () => { },
		debug: () => { },
		error: () => { },
	}
}

AppRegistry.registerComponent('kumaPwd', () => App);
