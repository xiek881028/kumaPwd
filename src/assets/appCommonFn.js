//加密组件 crypto-js
import CryptoJS from 'crypto-js';

import { initFontSize } from '../actions';
//android独有
import FilesAndroid from '../NativeModules/FilesAndroid';
import BackHoldAndroid from '../NativeModules/BackHoldAndroid';

let isLogin = false;
let loginSavePwd = '';
let dataSavePwd = '';
let firstInit = true;

function mathLoginPwd(str) {
	//对用户输入的登录密码进行加密保存
	//因涉及安全性 加密代码不予展示 请自行实现
	return str;
}

function mathDataPwd(str) {
	//对用户输入的登录密码进行另一种加密作为数据加密时的key
	//因涉及安全性 加密代码不予展示 请自行实现
	return str;
}

function loginState(props, freePage = false) {
	return new Promise(function loginState(resolve) {
		firstInit && init(props);
		if (!(freePage || isLogin)) {
			props.navigation.navigate('login');
			resolve(false);
		}
		resolve(true);
	});
}

const init = async props => {
	fontInit(props);
	mkdirInit();
	//进行后台留存设置task
	BackHoldAndroid.setBackHoldTime(await getBackHoldFlag() ? +await getBackHoldTime() : 10);
	firstInit = false;
}

const mkdirInit = () => new Promise(function (resolve, reject) {
	let rootFile = `${FilesAndroid.ROOT_PATH}/kumaPwd`;
	let saveFile = `${rootFile}/beifen`;
	fileIsExists(rootFile)
		.then((d) => {
			if (d.flag) {
				if (!d.data) {
					FilesAndroid.mkdir(saveFile, d => {
						resolve({...d, fileTree: saveFile});
					});
				} else {
					//后修改 尚不知道是否会引发bug
					resolve({ ...d, rootFile: d.data ? rootFile : FilesAndroid.ROOT_PATH });
				}
			} else {
				reject(d.message);
			}
		});
});

const getPwdErr = () => new Promise(async (resolve) => {
	try {
		let errPwdIndex = await storage.load({ key: 'saveErrorPwdNum' });
		if (errPwdIndex < getErrorPwdNum()) {
			resolve({
				errPwdIndex,
				saveErrorPwdTime: null,
			});
		} else {
			try {
				let saveErrorPwdTime = await storage.load({ key: 'saveErrorPwdTime' });
				resolve({
					errPwdIndex,
					saveErrorPwdTime,
				});
			} catch (err) {
				let saveErrorPwdTime = new Date().getTime();
				await storage.save({
					key: 'saveErrorPwdTime',
					data: saveErrorPwdTime,
				});
				resolve({
					errPwdIndex,
					saveErrorPwdTime,
				});
			}
		}
	} catch (err) {
		resolve({
			errPwdIndex: 0,
			saveErrorPwdTime: null,
		});
	}
})

const fileIsExists = (path = '') => new Promise(function (resolve) {
	FilesAndroid.isExists(path, d => {
		resolve(d);
	});
});

const fontInit = props => new Promise(function (resolve) {
	// storage.remove({
	// 	key: 'fontSize'
	// });
	storage.load({
		key: 'fontSize'
	})
		.then(data => {
			props.dispatch(initFontSize(data));
			resolve();
		})
		.catch(err => {
			let baseFont = 16;
			// let defaultFont = baseFont*1.25;
			let defaultFont = baseFont;
			storage.save({
				key: 'fontSize',
				data: defaultFont,
			})
				.then(() => {
					props.dispatch(initFontSize(defaultFont));
					resolve();
				})
				;
		})
		;
});

function addLoginPwd(pwd) {
	storage.save({
		key: 'loginPwd',
		data: mathLoginPwd(pwd),
	});
	dataSavePwd = mathDataPwd(pwd);
	isLogin = true;
}

function setLoginPwd(pwd) {
	loginSavePwd = pwd;
}

function getDataPwd(pwd) {
	if (pwd) {
		return mathDataPwd(pwd);
	} else {
		return dataSavePwd;
	}
}

function tryLogin(pwd) {
	if (mathLoginPwd(pwd) === loginSavePwd) {
		dataSavePwd = mathDataPwd(pwd);
		isLogin = true;
		return true;
	} else {
		return false;
	}
}

function _constructor(key, defaultVal) {
	return () => new Promise(function (resolve, reject) {
		storage.load({
			key,
		})
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				storage.save({
					key,
					data: defaultVal,
				})
					.then(() => {
						resolve(defaultVal);
					}).catch(() => {
						reject();
					});
			})
			;
	});
}

const getTimerFileName = (prefix='备份') => {
	let data = new Date();
	let year = data.getFullYear();
	let month = data.getMonth();
	let day = data.getDate();
	return `${prefix}_${year}${month < 9 ? '0' : ''}${month + 1}${day < 9 ? `0${day}` : day}_${('00000000' + (data.getTime() - new Date(year, month, day).getTime()).toString()).slice(-8)}`;
}

//自动备份flag
const getAutoBeiFlag = _constructor('autoBeiFlag', false);
//后台留存flag
const getBackHoldFlag = _constructor('backHoldFlag', true);
//后台留存时间长度
const getBackHoldTime = _constructor('backHoldTime', `${1000 * 30}`);
//密码错误锁定flag
const getErrorPwdFlag = _constructor('errorPwdFlag', true);
//密码错误锁定次数
const getErrorPwdNum = _constructor('errorPwdNum', 10);
//密码错误锁定时间
const getErrorPwdTime = _constructor('errorPwdTime', `${1000 * 60 * 60}`);

module.exports = {
	loginState,
	addLoginPwd,
	setLoginPwd,
	getDataPwd,
	tryLogin,
	mkdirInit,
	fileIsExists,
	getPwdErr,
	getAutoBeiFlag,
	getBackHoldFlag,
	getBackHoldTime,
	getErrorPwdFlag,
	getErrorPwdNum,
	getErrorPwdTime,
	getTimerFileName,
}
