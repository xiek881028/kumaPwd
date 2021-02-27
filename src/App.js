import React from 'react';
import { Platform } from 'react-native';
import Nav from './routers.js';
import Tips from './components/tips';
import Loading from './components/loading';
import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Provider, { CtxTheme, CtxUser, CtxTips, CtxList, CtxLoading, CtxWebdav, CtxEgg } from './components/context';

let storage = new Storage({
	size: 5000,
	storageBackend: AsyncStorage,
	defaultExpires: null,
});

global.storage = storage;
global.OS = Platform.OS;
global.CTX_THEME = CtxTheme;
global.CTX_USER = CtxUser;
global.CTX_TIPS = CtxTips;
global.CTX_LIST = CtxList;
global.CTX_LOADING = CtxLoading;
global.CTX_WEBDAV = CtxWebdav;
global.CTX_EGG = CtxEgg;

export default () => {
	return (
		<Provider>
			<Nav />
			<Tips />
			<Loading />
		</Provider>
	);
};
