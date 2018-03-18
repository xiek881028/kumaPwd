import React, { Component } from 'react';
import {
	AppRegistry,
	AppState,
} from 'react-native';
import App from './src/App.js';

import ExitAndroid from './src/NativeModules/ExitAndroid';

if(!__DEV__){
	global.console = {
		info: ()=>{},
		log: ()=>{},
		warn: ()=>{},
		debug: ()=>{},
		error: ()=>{},
	}
}

export default class root extends Component {
	async componentWillMount() {
		try {
			await storage.load({
				key: 'isInstall'
			});
		} catch (err) {
			storage.save({
				key: 'isInstall',
				data: false,
			});
			AppState.addEventListener('change', state=>{
				if(state == 'background'){
					ExitAndroid.exit();
				}
			});
		}
	}
	render() {
		return (
			<App />
		);
	}
}

AppRegistry.registerComponent('kumaPwd', () => root);
