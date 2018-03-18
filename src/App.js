import React, { Component } from 'react';
import {Platform} from 'react-native';
import Nav from './components/Routers.js';

import { Provider } from 'react-redux';
import store from './store';

import Storage from 'react-native-storage';
import {
	AsyncStorage,
} from 'react-native';

let storage = new Storage({
	size: 5000,
	storageBackend: AsyncStorage,
	defaultExpires: null,
});

global.storage = storage;
global.APP_NAME = '账号匣';
global.VERSION = 'v1.1.0';
global.OS = Platform.OS;

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Nav />
			</Provider>
		);
	}
}
