import moment from 'moment';
import Color from 'color';
//android独有
import FilesAndroid from '../NativeModules/FilesAndroid';
import {
	PermissionsAndroid,
} from 'react-native';
// 全局配置
import cfg from '../config';
import { mathPwd, mathPwdV1 } from './crypto';

const getStorage = (key) => new Promise(resolve => {
	global.storage
		.load({ key })
		.then(res => {
			resolve(res);
		})
		.catch(err => {
			resolve(undefined);
		});
});

const setStorage = (key, data) => new Promise(resolve => {
	global.storage.save({
		key,
		data,
	})
		.then(res => {
			resolve();
		});
});

const delStorage = (key) => new Promise(resolve => {
	global.storage
		.remove({ key })
		.then(res => {
			resolve();
		});
});

const initMkdir = (dirName) => new Promise((resolve, reject) => {
	let rootFile = `${FilesAndroid.ROOT_PATH}/kumaPwd`;
	let saveFile = `${rootFile}/${dirName}`;
	// 记得询问用户索要存储空间权限
	fileIsExists(saveFile)
		.then(d => {
			if (!d.data) {
				FilesAndroid.mkdir(saveFile, d => {
					if (d.data) {
						resolve({ ...d, rootFile, saveFile });
					} else {
						reject('文件夹创建失败，检查相关权限是否已经获取');
					}
				});
			} else {
				//后修改 尚不知道是否会引发bug
				resolve({ ...d, rootFile: d.data ? rootFile : FilesAndroid.ROOT_PATH, saveFile });
			}
		});
});

const fileIsExists = (path = '') => new Promise(resolve => {
	FilesAndroid.isExists(path, d => {
		resolve(d);
	});
});

const writeFile = (path, name, context) => new Promise(resolve => {
	FilesAndroid.writeFile(`${path}/`, name, context, false, d => {
		resolve(d);
	});
});

const getLockInfo = () => new Promise(async (resolve) => {
	await storage
		.load({ key: 'pwdTryTimer' })
		.then(async pwdTryTimer => {
			if (pwdTryTimer < getPwdTryMaxTimer()) {
				resolve({
					pwdTryTimer,
					lockStartAt: null,
				});
			} else {
				await storage
					.load({ key: 'lockStartAt' })
					.then(lockStartAt => {
						resolve({
							pwdTryTimer,
							lockStartAt,
						});
					})
					.catch(async err => {
						let lockStartAt = new Date().getTime();
						await storage.save({
							key: 'lockStartAt',
							data: lockStartAt,
						});
						resolve({
							pwdTryTimer,
							lockStartAt,
						});
					});
			}
		})
		.catch(err => {
			resolve({
				pwdTryTimer: 0,
				lockStartAt: null,
			});
		});
});

const initTheme = () => new Promise(function(resolve) {
	storage.load({
		key: 'theme'
	})
		.then(data => {
			resolve(JSON.parse(data));
		})
		.catch(err => {
			const saveData = {
				backgroundColor: cfg.defaultColor,
				fontSize: cfg.fontSize,
			};
			storage.save({
				key: 'theme',
				data: JSON.stringify(saveData),
			})
				.then(() => {
					resolve(saveData);
				})
				;
		})
		;
});

const setTheme = (key, val) => new Promise(function(resolve) {
	// storage.remove({
	// 	key: 'fontSize'
	// });
	storage.load({
		key: 'theme'
	})
		.then(data => {
			const saveData = JSON.parse(data);
			saveData[key] = val;
			storage.save({
				key: 'theme',
				data: JSON.stringify(saveData),
			})
				.then(() => {
					resolve(saveData);
				})
				;
		})
		;
});

function editPwd(pwd) {
	const savePwd = mathPwd(pwd);
	storage.save({
		key: 'Password',
		data: savePwd,
	});
	return savePwd;
}

function login(pwd, savePwd) {
	if (mathPwd(pwd) === savePwd) {
		return true;
	} else {
		return false;
	}
}

// 下个版本删除 ~~~~~~~~
function loginV1(pwd, savePwd) {
	if (mathPwdV1(pwd) === savePwd) {
		return true;
	} else {
		return false;
	}
}
// 下个版本删除 ~~~~~~~~

function sleep(timer, cb = () => { }) {
	return new Promise(resolve => {
		setTimeout(() => resolve(cb()), timer);
	});
}

function _constructor(key, defaultVal) {
	return () => new Promise(function(resolve, reject) {
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

const getTimerFileName = (prefix = '备份') => `${prefix}${moment().format('YYYYMMDDHHmmssSSS')}`;

const mathLockTime = time => {
	if (!time) return '';
	const timer = moment.duration(time);
	let out = '';
	if (time < 1000 * 60) {
		out = ` ${timer.seconds()} 秒`;
	} else if (time < 1000 * 60 * 60) {
		out = ` ${timer.minutes()} 分钟`;
	} else if (time < 1000 * 60 * 60 * 24) {
		out = ` ${timer.hours()} 小时`;
	} else {
		out = ` ${timer.days()} 天`;
	}
	return out;
};

const checkPermissionAndroid = async permission => {
	const isArray = Array.isArray(permission);
	let permissionArr = isArray ? permission : [permission];
	let hasAllPerission = true;
	for (let i = 0, max = permissionArr.length; i < max; i++) {
		const item = permissionArr[i];
		if (!await PermissionsAndroid.check(item)) {
			hasAllPerission = false;
		}
	}
	return hasAllPerission;
};

const checkAndRequestPermissionAndroid = async permission => {
	let out = true;
	if (!await checkPermissionAndroid(permission)) {
		const request = await PermissionsAndroid.requestMultiple(permission);
		for (const key in request) {
			if (request[key] !== 'granted') {
				out = false;
			}
		}
	}
	return out;
};

const checkFile = (path) => {
	return new Promise((resolve, reject) => {
		FilesAndroid.isBackupFile(path, d => {
			if (d.flag) {
				resolve(d);
			} else {
				/*
					00 成功
					01 文件前缀不符合
					02 没有读权限
					03 没有写权限
					04 文件不存在
				*/
				let errMsg = '';
				switch (d.code) {
					case '01':
						errMsg = '选中文件不是合法的备份文件';
						break;
					case '02':
						errMsg = '选中文件没有读取权限';
						break;
					case '03':
						errMsg = '选中文件没有写入权限';
						break;
					case '04':
						errMsg = '选中文件已被删除';
						break;
				}
				reject(errMsg);
			}
		});
	});
};

const getRGBA = (color, alpha = 1) => {
	const rgb = Color(color).rgb().array();
	return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
};

//自动备份flag
const getAutoBackupFlag = _constructor('autoBackupFlag', cfg.autoBackup);
//后台留存flag
const getBackHoldFlag = _constructor('backHoldFlag', cfg.backHold);
//后台留存时间长度
const getBackHoldTime = _constructor('backHoldTime', cfg.backHoldTime);
//密码错误锁定flag
const getErrorLockFlag = _constructor('errorPwdFlag', cfg.errorPwd);
//密码错误锁定次数
const getPwdTryMaxTimer = _constructor('errorPwdNum', cfg.errorPwdNum);
//密码错误锁定时间
const getErrorPwdTime = _constructor('errorPwdTime', cfg.errorPwdTime);
//指纹识别flag
const getFingerprintFlag = _constructor('fingerprintFlag', cfg.fingerprint);
// 开启webdav
const getWebdavFlag = _constructor('webdavFlag', cfg.webdav);
// 明文保存
const getBackup2Json = _constructor('backup2Json', cfg.backup2Json);
// 快速入口
const getFastEntry = _constructor('fastEntry', cfg.fastEntry);
// 差异提醒
const getAsyncTips = _constructor('asyncTips', cfg.asyncTips);
// 保留历史
const getAsyncHistory = _constructor('asyncHistory', cfg.asyncHistory);
// 账号改动列表
const getAccountChangeList = _constructor('accountChangeList', null);
// tag改动列表
const getTagChangeList = _constructor('tagChangeList', null);
// 彩蛋开关
const getEgg = _constructor('egg', cfg.egg);
// 彩蛋任务完成标识
const getEggDone = _constructor('eggDone', cfg.eggDone);

module.exports = {
	editPwd,
	fileIsExists,
	getAutoBackupFlag,
	getBackHoldFlag,
	getBackHoldTime,
	getErrorLockFlag,
	getPwdTryMaxTimer,
	getErrorPwdTime,
	getFingerprintFlag,
	getTimerFileName,
	getLockInfo,
	initMkdir,
	login,
	// 下个版本删除 ~~~~~~~~
	loginV1,
	// 下个版本删除 ~~~~~~~~
	getStorage,
	setStorage,
	delStorage,
	initTheme,
	setTheme,
	sleep,
	mathLockTime,
	checkAndRequestPermissionAndroid,
	checkPermissionAndroid,
	checkFile,
	writeFile,
	getRGBA,
	getWebdavFlag,
	getBackup2Json,
	getFastEntry,
	getAsyncTips,
	getAsyncHistory,
	getAccountChangeList,
	getTagChangeList,
	getEgg,
	getEggDone,
}
