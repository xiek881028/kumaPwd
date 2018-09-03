import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';

import style from '../css/common';

//View
import home from '../views/home';
import search from '../views/search';
import config from '../views/config';
import editAcount from '../views/editAcount';
import details from '../views/details';
import login from '../views/login';
import configColor from '../views/configColor';
import configEditFont from '../views/configEditFont';
import dataBackUp from '../views/dataBackUp';
import helpFirst from '../views/helpFirst';
import configAdv from '../views/configAdv';
import about from '../views/about';

export default Routers = createStackNavigator(
	{
		home: {screen: home},
		config: {screen: config},
		search: {screen: search},
		editAcount: {screen: editAcount},
		details: {screen: details},
		login: {screen: login},
		configColor: {screen: configColor},
		configEditFont: {screen: configEditFont},
		dataBackUp: {screen: dataBackUp},
		helpFirst: {screen: helpFirst},
		configAdv: {screen: configAdv},
		about: {screen: about},
	},
	{
		navigationOptions: ({navigation}) => ({
			headerStyle: style.headerStyle,
			headerTitleStyle: [style.headerTitleStyle, {marginHorizontal: 0, marginLeft: 0, paddingLeft: 0,}],
		}),
		headerMode: 'float',
		initialRouteName: 'login',
	},
);
