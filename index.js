import React, { Component } from 'react';
import {
	AppRegistry,
	AppState,
	YellowBox,
} from 'react-native';
import App from './src/App.js';

import ExitAndroid from './src/NativeModules/ExitAndroid';

import {
	colorInit,
	fontInit,
	setColor,
	setFontSize,
} from './src/assets/appCommonFn';

//Css
import style from './src/css/common.js';

if (!__DEV__) {
	global.console = {
		info: () => { },
		log: () => { },
		warn: () => { },
		debug: () => { },
		error: () => { },
	}
}

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'], 'Module RCTImageLoader');

export default class root extends Component {
	constructor(props) {
		super(props);
		this.state = {
			color: null,
			fontSize: null,
		};
	}
	//修复react-native第一次运行时index重复渲染的bug
	//不确定react-native v0.55.2是否已经修复，暂且留着
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
			AppState.addEventListener('change', state => {
				if (state == 'background') {
					ExitAndroid.exit();
				}
			});
		}
		// await storage.remove({
		// 	key: 'color',
		// });
		//字体大小初始化
		fontInit()
			.then(data => {
				setFontSize(data.fontSize, style);
				this.setState({
					fontSize: data.fontSize,
				});
			})
			;
		//主题色初始化
		colorInit()
			.then(data => {
				setColor(data.color, style);
				this.setState({
					color: data.color,
				});
			})
			;
	}
	render() {
		return !!this.state.color && !!this.state.fontSize ? (
			<App />
		) : null;
	}
}

AppRegistry.registerComponent('kumaPwd', () => root);
