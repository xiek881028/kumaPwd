import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	BackHandler,
	View,
	StatusBar,
	TouchableHighlight,
	ScrollView,
	PermissionsAndroid,
	DeviceEventEmitter,
	AppState,
} from 'react-native';
import { connect } from 'react-redux';
import {
	editAccountList,
	initAccountList,
} from '../actions';
import {
	loginState,
	addPwd,
	tryLogin,
	getPwd,
	getPwdErr,
	getErrorPwdFlag,
	getErrorPwdNum,
	getErrorPwdTime,
	mkdirInit,
	getTimerFileName,
	fileIsExists,
	getFingerprintFlag,
	setLoginState,
	getFirst,
} from '../assets/appCommonFn';

import FilesAndroid from '../NativeModules/FilesAndroid';
import ShareAndroid from '../NativeModules/ShareAndroid';
import FingerprintAndroid from '../NativeModules/FingerprintAndroid';

import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';

import ModalBase from '../components/ModalBase';

//Css
import style from '../css/common.js';
//加密组件 crypto-js
import CryptoJS from 'crypto-js';

class InputPwd extends Component {
	render() {
		let items = [];
		for (let i = 0, max = this.props.number; i < max; i++) {
			items.push(
				<View key={i} style={[styles.inputPwdItem, i == max - 1 ? styles.inputPwdItemLast : '']}>
					<Text style={this.props.pwd[i] != undefined ? styles.inputPwdItemText : ''}></Text>
				</View>
			);
		}
		return (
			<View style={[styles.inputPwdBox, this.props.style]}>
				{items}
			</View>
		);
	}
}

class InputKeyboard extends Component {
	keyboardArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'];
	getInput(index) {
		this.props.getKeybordVal(this.keyboardArr[index]);
	}
	shouldComponentUpdate() {
		return false;
	}
	render() {
		let items = [];
		for (let i = 0, max = this.keyboardArr.length; i < max; i++) {
			items.push(
				this.keyboardArr[i] === '' ?
					<View key={i} style={styles.InputKeyboardItem}></View>
					:
					<TouchableHighlight
						key={i}
						style={styles.InputKeyboardItem}
						underlayColor='rgba(0, 0, 0, .1)'
						onPress={this.getInput.bind(this, i)}
					>
						<Text style={[styles.InputKeyboardText, { fontSize: style.baseFontSize * 1.6 }]}>{
							this.keyboardArr[i] == 'del' ?
								<Feather name='delete' style={[styles.InputKeyboardText, { fontSize: style.baseFontSize * 1.6 }]} />
								: this.keyboardArr[i]
						}</Text>
					</TouchableHighlight>
			);
		}
		return (
			<View style={this.props.style}>
				<View style={[styles.InputKeyboardBox]}>
					{items}
				</View>
				<View style={styles.InputKeyboardBg}></View>
			</View>
		);
	}
}

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pwd: [],
			mode: 'wait',
			titleText: '',
			titleSubText: '',
			titleTextMode: 'info',
			titleSubTextMode: 'err',
			keylock: false,
			readly: false,
		};
	}
	delayKeylock = 50;
	delayInput = 50;
	delayHref = 200;
	// delayKeylock = 1;
	// delayInput = 1;
	// delayHref = 1;
	btnGoBack = () => {
		let { state, goBack } = this.props.navigation;
		if (state.params && !this.state.appLock && (state.params._mode == 'editPwd' || state.params._mode == 'importCover' || state.params._mode == 'importAppend')) {
			goBack();
		} else {
			BackHandler.exitApp();
		}
		return true;
	}
	pwdMaxTry;
	errPwdFlag;
	fingerprintOnOff = false;
	fingerprint = () => {
		let _this = this;
		if (!this.fingerprintOnOff) {
			FingerprintAndroid.cancel();
			FingerprintAndroid.toVerification();
			this.fingerprintOnOff = true;
		}
		AppState.addEventListener('change', this._handleAppStateChange);
		return new Promise(function (resolve, reject) {
			FingerprintAndroid.isReady(data => {
				if (data.flag) {
					// 验证成功
					DeviceEventEmitter.addListener('onSucceed', function () {
						setLoginState(true);
						_this.loginSuccess();
					});
					// 指纹不匹配，并返回可用剩余次数并自动继续验证
					DeviceEventEmitter.addListener('onNotMatch', function (data) {
						_this.setState({
							titleText: '指纹错误，请重新验证',
							titleTextMode: 'error',
						});
					});
					// 错误次数达到上限或者API报错停止了验证
					DeviceEventEmitter.addListener('onFailed', function (data) {
						_this.setState({
							titleText: '请输入密码',
							titleSubText: `指纹验证连续错误次数过多，指纹识别已被系统暂时锁定`,
							titleTextMode: 'info',
						});
					});
					// 第一次调用startIdentify失败，因为设备被暂时锁定
					DeviceEventEmitter.addListener('onStartFailedByDeviceLocked', function () {
						_this.setState({
							titleText: '请输入密码',
							titleSubText: `指纹验证连续错误次数过多，指纹识别已被系统暂时锁定`,
							titleTextMode: 'info',
						});
					});
					resolve(true);
				} else {
					reject();
				}
			});
		});
	}
	_handleAppStateChange = (_state) => {
		//开启关闭指纹验证
		let { state } = this.props.navigation;
		//login
		if (state.params == undefined) {
			if (_state != 'active') {
				FingerprintAndroid.cancel();
				this.fingerprintOnOff = false;
			} else {
				if (!this.fingerprintOnOff) {
					FingerprintAndroid.cancel();
					FingerprintAndroid.toVerification();
					this.fingerprintOnOff = true;
				}
			}
		}
	}
	async componentDidMount() {
		// storage.remove({
		// 	key: 'saveErrorPwdTime',
		// }).then(() => {
		// 	storage.save({
		// 		key: 'saveErrorPwdNum',
		// 		data: 0,
		// 	});
		// });
		let readly = await loginState(this.props, true);
		let { state } = this.props.navigation;
		if (state.params && (state.params._mode == 'importCover' || state.params._mode == 'importAppend')) {
			this.setState({
				readly,
				mode: state.params._mode,
				titleText: '请输入密码',
				titleSubText: '注意：请输入导出备份文件时的密码，而不是当前的密码',
				importData: state.params.data,
				appLock: false,
			});
		} else {
			this.appLockTime = await getErrorPwdTime();
			this.pwdMaxTry = await getErrorPwdNum();
			try {
				await storage.load({ key: 'Password' });
				this.errPwdFlag = await getErrorPwdFlag();
				let isLogin = state.params && state.params._mode ? false : true;
				let errPwdIndex;
				let saveErrorPwdTime;
				if (this.errPwdFlag) {
					let pwdErr = await getPwdErr();
					errPwdIndex = pwdErr.errPwdIndex;
					saveErrorPwdTime = pwdErr.saveErrorPwdTime;
				}
				//没开启密码锁定功能
				if (!this.errPwdFlag || errPwdIndex < this.pwdMaxTry) {
					let hasFingerprint;
					let fingerprintState;
					if (isLogin) {
						fingerprintState = await getFingerprintFlag();
						if (fingerprintState) {
							try {
								hasFingerprint = await this.fingerprint();
							} catch (err) {
								hasFingerprint = false;
							}
						}
					}
					this.setState({
						readly,
						mode: (state.params && state.params._mode) && state.params._mode || 'login',
						titleText: `${isLogin && fingerprintState && hasFingerprint ? `请验证指纹或输入密码` : `请输入密码`}`,
						canFingerprint: isLogin && fingerprintState && hasFingerprint,
					});
				} else {
					let { unlock, timerStr } = await this.mathUnlockTime(saveErrorPwdTime);
					//开启密码锁定功能 未达到错误次数
					if (unlock) {
						storage.remove({
							key: 'saveErrorPwdTime',
						}).then(() => {
							storage.save({
								key: 'saveErrorPwdNum',
								data: 0,
							}).then(async () => {
								let hasFingerprint;
								let fingerprintState;
								if (isLogin) {
									fingerprintState = await getFingerprintFlag();
									if (fingerprintState) {
										try {
											hasFingerprint = await this.fingerprint();
										} catch (err) {
											hasFingerprint = false;
										}
									}
								}
								this.setState({
									readly,
									mode: (state.params && state.params._mode) && state.params._mode || 'login',
									titleText: `${isLogin && fingerprintState && hasFingerprint ? `请验证指纹或输入密码` : `请输入密码`}`,
									canFingerprint: isLogin && fingerprintState && hasFingerprint,
								});
							});
						});
					} else {
						this.state.canFingerprint && this.offFingerprint();
						this.setState({
							readly,
							mode: (state.params && state.params._mode) && state.params._mode || 'login',
							titleText: '应用已经被锁定',
							keylock: true,
							titleTextMode: 'error',
							titleSubText: `将在 ${timerStr} 解锁`,
							appLock: true,
						});
					}
				}
			} catch (err) {
				this.setState({
					readly,
					mode: 'register',
					titleText: '首次使用，请设置密码',
				});
			}
		}
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	async mathUnlockTime(saveErrorPwdTime) {
		let date = new Date(saveErrorPwdTime + (+this.appLockTime));
		let timerStr = `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
		// return timer;
		function addZero(inTime) {
			return inTime < 10 ? `0${inTime}` : inTime;
		}
		let unlock = new Date().getTime() >= new Date(saveErrorPwdTime).getTime() + this.appLockTime;
		return {
			unlock,
			timerStr,
		};
	}
	offFingerprint() {
		this.fingerprintOnOff = false;
		FingerprintAndroid.cancel();
		AppState.removeEventListener('change', this._handleAppStateChange);
		DeviceEventEmitter.removeAllListeners('onSucceed');
		DeviceEventEmitter.removeAllListeners('onNotMatch');
		DeviceEventEmitter.removeAllListeners('onFailed');
		DeviceEventEmitter.removeAllListeners('onStartFailedByDeviceLocked');
	}
	componentWillUnmount() {
		console.log('销毁login');
		this.offFingerprint();
		this.passFlag = false;
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: null,
	});
	loginSuccess = () => {
		this.setState({
			titleText: '登录成功',
			titleTextMode: 'success',
			titleSubText: '',
		}, () => {
			storage.remove({
				key: 'saveErrorPwdTime',
			}).then(() => {
				storage.save({
					key: 'saveErrorPwdNum',
					data: 0,
				}).then(() => {
					setTimeout(() => {
						// this.props.navigation.replace('helpFirst', {_mode: 'first'});
						this.props.navigation.replace('home');
					}, this.delayHref);
				});
			});
		});
	}
	setPwd(_pwd, fn = () => { }) {
		if (!this.state.secondPwd) {
			this.setState({
				secondPwd: _pwd,
				pwd: [],
				titleText: '请再次设置密码',
				keylock: false,
			});
		} else {
			if (this.state.secondPwd.join('') === _pwd.join('')) {
				addPwd(this.state.secondPwd.join(''));
				fn();
			} else {
				this.setState({
					pwd: [],
					secondPwd: undefined,
					titleText: '两次输入不一致，请重新设置',
					titleTextMode: 'error',
				}, () => {
					setTimeout(() => {
						this.setState({
							keylock: false,
						});
					}, this.delayKeylock);
				});
			}
		}
	}
	passFlag = false;
	lockTimeText = {
		'0.5': '30分钟',
		'1': '1小时',
		'3': '3小时',
		'6': '6小时',
		'12': '12小时',
		'24': '1天',
	};
	async getKeybordVal(val) {
		if (this.state.keylock) return;
		let _pwd = [...this.state.pwd];
		if (val == 'del') {
			_pwd.pop();
		} else {
			_pwd.push(val);
		}
		if (_pwd.length > 6) return;
		if (_pwd.length == 6 && this.state.mode == 'register') {
			this.setState({
				pwd: _pwd,
			}, () => {
				setTimeout(() => {
					this.setPwd(_pwd, () => {
						this.setState({
							titleText: '密码设置成功',
							titleTextMode: 'success',
						}, () => {
							setTimeout(() => {
								// this.props.navigation.replace('helpFirst', {_mode: 'first'});
								this.props.navigation.replace('home');
							}, this.delayHref);
						});
					});
				}, this.delayInput);
			});
		} else if (_pwd.length == 6 && this.state.mode == 'login') {
			this.setState({
				pwd: _pwd,
				keylock: true,
			}, () => {
				setTimeout(async () => {
					if (tryLogin(_pwd.join(''))) {
						this.loginSuccess();
					} else {
						let errPwdIndex;
						if (this.errPwdFlag) {
							let pwdErr = await getPwdErr();
							errPwdIndex = +pwdErr.errPwdIndex;
							errPwdIndex++;
							await storage.save({
								key: 'saveErrorPwdNum',
								data: errPwdIndex,
							});
						}
						if (!this.errPwdFlag || errPwdIndex < this.pwdMaxTry) {
							let lockTime;
							if (this.errPwdFlag) lockTime = await getErrorPwdTime();
							this.setState({
								pwd: [],
								titleText: '密码错误，请重新输入',
								titleSubText: this.errPwdFlag ? `已经连续输错密码 ${errPwdIndex} 次，累计输错 ${this.pwdMaxTry} 次，应用将锁定${this.lockTimeText[+lockTime / (1000 * 60 * 60)]}。` : '',
								titleTextMode: 'error',
							}, () => {
								setTimeout(() => {
									this.setState({
										keylock: false,
									});
								}, this.delayKeylock);
							});
						} else {
							let { saveErrorPwdTime } = await getPwdErr();
							let { unlock, timerStr } = await this.mathUnlockTime(saveErrorPwdTime);
							this.state.canFingerprint && this.offFingerprint();
							this.setState({
								pwd: [],
								keylock: true,
								titleText: '应用已经被锁定',
								titleSubText: `将在 ${timerStr} 解锁`,
								titleTextMode: 'error',
								appLock: true,
							});
						}
					};
				}, this.delayInput);
			});
		} else if (_pwd.length == 6 && this.state.mode == 'editPwd') {
			this.setState({
				pwd: _pwd,
				keylock: true,
			}, () => {
				setTimeout(async () => {
					if (this.passFlag) {
						let prevDataPwd = getPwd();
						this.setPwd(_pwd, () => {
							this.setState({
								titleText: '密码设置成功',
								titleTextMode: 'success',
								titleSubText: '正在用新密码对账号重新加密，请勿操作，否则您将有可能失去您所有的账号！',
							}, () => {
								let nowDataPwd = getPwd();
								this.passFlag = false;
								storage.getAllDataForKey('accountList').then(accounts => {
									accounts.map((item) => {
										let warningPwd = CryptoJS.AES.decrypt(item.pwd, prevDataPwd).toString(CryptoJS.enc.Utf8);
										if (item.pwd) {
											item.pwd = CryptoJS.AES.encrypt(warningPwd, nowDataPwd).toString();
											this.props.dispatch(editAccountList(item));
										}
									});
									this.setState({
										titleSubText: '加密完成，密码修改成功',
										titleSubTextMode: 'success',
									}, () => {
										setTimeout(() => {
											this.props.navigation.goBack();
										}, this.delayHref);
									});
								});
							});
						});
					} else {
						if (tryLogin(_pwd.join(''))) {
							this.passFlag = true;
							this.setState({
								pwd: [],
								titleText: '请设置新密码',
								titleTextMode: 'info',
								titleSubText: '',
							}, () => {
								storage.remove({
									key: 'saveErrorPwdTime',
								}).then(() => {
									storage.save({
										key: 'saveErrorPwdNum',
										data: 0,
									}).then(() => {
										setTimeout(() => {
											this.setState({
												keylock: false,
											});
										}, this.delayKeylock);
									});
								});
							});
						} else {
							let errPwdIndex;
							if (this.errPwdFlag) {
								let pwdErr = await getPwdErr();
								errPwdIndex = +pwdErr.errPwdIndex;
								errPwdIndex++;
								await storage.save({
									key: 'saveErrorPwdNum',
									data: errPwdIndex,
								});
							}
							if (!this.errPwdFlag || errPwdIndex < this.pwdMaxTry) {
								let lockTime;
								if (this.errPwdFlag) lockTime = await getErrorPwdTime();
								this.setState({
									pwd: [],
									titleText: '密码错误，请重新输入',
									titleSubText: this.errPwdFlag ? `已经连续输错密码 ${errPwdIndex} 次，累计输错 ${this.pwdMaxTry} 次，应用将锁定${this.lockTimeText[+lockTime / (1000 * 60 * 60)]}。` : '',
									titleTextMode: 'error',
								}, () => {
									setTimeout(() => {
										this.setState({
											keylock: false,
										});
									}, this.delayKeylock);
								});
							} else {
								let { saveErrorPwdTime } = await getPwdErr();
								let { unlock, timerStr } = await this.mathUnlockTime(saveErrorPwdTime);
								this.setState({
									pwd: [],
									keylock: true,
									titleText: '应用已经被锁定',
									titleSubText: `将在 ${timerStr} 解锁`,
									titleTextMode: 'error',
									appLock: true,
								});
							}
						}
					}
				}, this.delayInput);
			});
		} else if (_pwd.length == 6 && (this.state.mode == 'importCover' || this.state.mode == 'importAppend')) {
			let importMode = this.state.mode;
			this.setState({
				pwd: _pwd,
				keylock: true,
			}, () => {
				setTimeout(() => {
					let dataPwd = getPwd(_pwd.join(''));
					let dataList = "";
					try {
						dataList = CryptoJS.AES.decrypt(this.state.importData, dataPwd).toString(CryptoJS.enc.Utf8);
					} catch (e) {
						dataList = "";
					}
					if (dataList.length) {
						let newData = JSON.parse(dataList);
						let pushArr = [];
						for (let i = 0, max = newData.length; i < max; i++) {
							if (importMode == 'importCover') {
								this.reSave(newData, i, max, dataPwd);
							} else if (importMode == 'importAppend') {
								storage.load({
									key: 'accountList',
									id: newData[i].id,
								}).catch(err => {
									pushArr.push(newData[i]);
								}).then(() => {
									if (i >= max - 1) {
										if (pushArr.length) {
											for (let j = 0, max2 = pushArr.length; j < max2; j++) {
												this.reSave(pushArr, j, max2, dataPwd);
											}
										} else {
											this.doneImport();
										}
									}
								});
							}
						};
					} else {
						this.setState({
							pwd: [],
							titleText: '密码错误，请重新输入',
							titleTextMode: 'error',
						}, () => {
							setTimeout(() => {
								this.setState({
									keylock: false,
								});
							}, this.delayKeylock);
						});
					}
				}, this.delayInput);
			});
		} else {
			let titleText = '';
			if (this.state.mode == 'login') {
				titleText = this.state.canFingerprint ? `请验证指纹或输入密码` : `请输入密码`;
			} else if (this.state.mode == 'importCover' || this.state.mode == 'importAppend') {
				titleText = '请输入密码'
			} else if (this.state.mode == 'register') {
				if (this.state.secondPwd) {
					titleText = '请再次设置密码'
				} else {
					titleText = '首次使用，请设置密码'
				}
			} else if (this.state.mode == 'editPwd') {
				if (this.passFlag) {
					if (this.state.secondPwd) {
						titleText = '请再次设置密码'
					} else {
						titleText = '请设置新密码'
					}
				} else {
					titleText = '请输入密码'
				}
			}
			this.setState({
				pwd: _pwd,
				titleTextMode: 'info',
				titleText,
			});
		}
	}
	doneImport() {
		storage.getAllDataForKey('accountList').then(data => {
			this.props.dispatch(initAccountList(data));
			this.setState({
				titleText: '导入文件成功',
				titleTextMode: 'success',
			}, () => {
				setTimeout(() => {
					this.props.navigation.popToTop();
				}, this.delayHref);
			});
		});
	}
	reSave(newData, index, max, dataPwd) {
		let decryptPwd = '';
		let newEncryptPwd = '';
		try {
			decryptPwd = CryptoJS.AES.decrypt(newData[index].pwd, dataPwd).toString(CryptoJS.enc.Utf8);
		} catch (e) {
			decryptPwd = "";
		}
		if (decryptPwd.length) {
			let nowDataPwd = getPwd();
			newEncryptPwd = CryptoJS.AES.encrypt(decryptPwd, nowDataPwd).toString();
		}
		newData[index].pwd = newEncryptPwd;
		storage.save({
			key: 'accountList',
			id: newData[index].id,
			data: newData[index],
		}).then(() => {
			if (index == max - 1) {
				this.doneImport();
			}
		});
	}
	async exportList() {
		let dirInit = (await mkdirInit());
		let rootFile = dirInit.rootFile;
		let arrList;
		let printStr = '';
		try {
			arrList = await storage.getAllDataForKey('accountList');
		} catch (err) {
			arrList = [];
		}
		arrList.map((item) => {
			printStr += `名称：${item.name}\r\n账号：${item.account}\r\n\r\n`;
		});
		let exportFile = `/${await getTimerFileName('账户列表')}.txt`;
		FilesAndroid.writeFile(rootFile, exportFile, printStr, false, d => {
			this.setState({
				isExportList: true,
				isExportListPath: rootFile + exportFile,
			});
		});
	}
	render() {
		if (!this.state.readly) return null;
		return (
			<View style={[style.container]}>
				<StatusBar
					// translucent={true}
					backgroundColor='#ebebeb'
					barStyle='dark-content'
				>
				</StatusBar>
				{this.state.mode == 'wait' ?
					null
					:
					<View style={[style.absoluteBox, styles.loginBox]}>
						<View style={styles.topHalfBox}>
							<View style={styles.topHalf}>
								<Text style={[styles.titleText, this.state.titleTextMode == 'success' ? styles.titleTextSuccess : this.state.titleTextMode == 'error' ? styles.titleTextErr : '', { fontSize: style.baseFontSize * 1.25 }]}>
									{this.state.titleText}
								</Text>
								<InputPwd
									style={styles.inputPwd}
									number={6}
									pwd={this.state.pwd}
								/>
								{
									this.state.mode == 'register' ?
										<View style={styles.forgotPwd}>
											<TouchableHighlight
												activeOpacity={0.6}
												underlayColor='transparent'
												onPress={() => {
													this.refs.importModal.setModal(true);
												}}
											>
												<View style={styles.forgotPwdBox}>
													<Feather
														name='help-circle'
														style={[styles.forgotPwdIcon, { fontSize: style.baseFontSize * 1.125 }]}
													/>
													<Text style={[styles.forgotPwdText, { fontSize: style.baseFontSize }]}>我有备份文件</Text>
												</View>
											</TouchableHighlight>
										</View>
										:
										this.state.mode == 'login' ?
											<View style={styles.forgotPwd}>
												<TouchableHighlight
													activeOpacity={0.6}
													underlayColor='transparent'
													onPress={() => {
														this.refs.forgotModal.setModal(true);
													}}
												>
													<View style={styles.forgotPwdBox}>
														<Feather
															name='help-circle'
															style={[styles.forgotPwdIcon, { fontSize: style.baseFontSize * 1.125 }]}
														/>
														<Text style={[styles.forgotPwdText, { fontSize: style.baseFontSize }]}>忘记密码</Text>
													</View>
												</TouchableHighlight>
											</View>
											: null
								}
								{
									this.state.titleSubText ?
										<Text style={[styles.titleSubText, this.state.titleSubTextMode == 'success' ? styles.titleTextSuccess : '', { fontSize: style.baseFontSize }]}>{this.state.titleSubText}</Text>
										: null
								}
							</View>
							{
								this.state.canFingerprint?
									<View
										style={[styles.fingerprintBox]}
									>
										<Entypo
											name='fingerprint'
											style={styles.fingerprintIcon}
										/>
										<Text
											style={{ fontSize: style.baseFontSize }}
										>
											指纹识别已开启
										</Text>
									</View>
									:null
							}
						</View>
						<InputKeyboard
							style={styles.InputKeyboard}
							getKeybordVal={this.getKeybordVal.bind(this)}
							baseFontSize={style.baseFontSize}
						/>
						{this.state.mode == 'register' ?
							<ModalBase
								ref='importModal'
								visible={false}
							>
								<View
									style={style.modalBox}
								>
									<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>提示</Text>
									<ScrollView style={[style.modalContent]}>
										<Text style={[{ fontSize: style.baseFontSize }]}>如果您有{APP_NAME}的备份文件，请在设置密码后，在设置→数据备份中选择备份文件进行导入。</Text>
									</ScrollView>
									<View style={style.modalFooter}>
										<TouchableHighlight
											style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
											underlayColor={style.btnHeightBg.backgroundColor}
											disabled={this.state.resetAppBtnDisabled}
											onPress={() => {
												this.refs.importModal.setModal(false);
											}}
										>
											<Text
												style={[style.btnColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
											>确定</Text>
										</TouchableHighlight>
									</View>
								</View>
							</ModalBase>
							: null}
						{this.state.mode == 'login' ?
							<ModalBase
								ref='forgotModal'
								visible={false}
								cloesModal={() => {
									this.setState({
										hasPermission: null,
									});
								}}
							>
								<View
									style={style.modalBox}
								>
									<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>提示</Text>
									{
										this.state.isExportList ?
											<ScrollView contentContainerStyle={[style.modalContent]}>
												<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>账号列表已成功导出到 {this.state.isExportListPath} 。</Text>
												<Text style={[styles.warningText, { fontSize: style.baseFontSize }]}>您可以点击发送按钮发送列表文件到其它应用中查看。</Text>
											</ScrollView>
											:
											this.state.hasPermission == false ?
												<ScrollView contentContainerStyle={[style.modalContent]}>
													<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>应用未能成功获取相应权限，导出失败。</Text>
												</ScrollView>
												:
												<ScrollView contentContainerStyle={[style.modalContent]}>
													<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>十分抱歉，应用无法提供密码找回功能。</Text>
													<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>但我们可以帮您导出一份账号列表，您可以根据列表手动找回密码。</Text>
													<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>导出列表功能需要获取您设备的存储权限。如果弹出权限申请，请同意。</Text>
													<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>确定导出列表吗？</Text>
												</ScrollView>
									}
									{
										this.state.isExportList ?
											<View style={style.modalFooter}>
												<TouchableHighlight
													style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
													underlayColor={style.btnSubHeightBg.backgroundColor}
													onPress={() => {
														this.refs.forgotModal.setModal(false);
													}}
												>
													<Text
														style={[style.modalFooterBtn, style.btnSubColor, { fontSize: style.baseFontSize }]}
													>取消</Text>
												</TouchableHighlight>
												<TouchableHighlight
													style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
													underlayColor={style.btnHeightBg.backgroundColor}
													disabled={this.state.resetAppBtnDisabled}
													onPress={async () => {
														if (await fileIsExists()) {
															ShareAndroid.shareFile(`发送账号列表`, this.state.isExportListPath);
															this.refs.forgotModal.setModal(false);
														}
													}}
												>
													<Text
														style={[style.btnColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
													>发送</Text>
												</TouchableHighlight>
											</View>
											:
											this.state.hasPermission == false ?
												<View style={style.modalFooter}>
													<TouchableHighlight
														style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
														underlayColor={style.btnSubHeightBg.backgroundColor}
														onPress={() => {
															this.refs.forgotModal.setModal(false);
														}}
													>
														<Text
															style={[style.modalFooterBtn, style.btnSubColor, { fontSize: style.baseFontSize }]}
														>关闭</Text>
													</TouchableHighlight>
												</View>
												:
												<View style={style.modalFooter}>
													<TouchableHighlight
														style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
														underlayColor={style.btnSubHeightBg.backgroundColor}
														onPress={() => {
															this.refs.forgotModal.setModal(false);
														}}
													>
														<Text
															style={[style.modalFooterBtn, style.btnSubColor, { fontSize: style.baseFontSize }]}
														>取消</Text>
													</TouchableHighlight>
													<TouchableHighlight
														style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
														underlayColor={style.btnHeightBg.backgroundColor}
														disabled={this.state.resetAppBtnDisabled}
														onPress={async () => {
															let canRead = false;
															let canWrite = false;
															if (OS == 'android') {
																canRead = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
																canWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
															}
															if (canRead && canWrite) {
																this.exportList();
															} else {
																let permission = await PermissionsAndroid.requestMultiple([
																	PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
																	PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
																]);
																if (permission['android.permission.READ_EXTERNAL_STORAGE'] == 'denied' || permission['android.permission.WRITE_EXTERNAL_STORAGE'] == 'denied') {
																	this.setState({
																		hasPermission: false,
																	});
																} else {
																	this.exportList();
																}
															}
														}}
													>
														<Text
															style={[style.btnColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
														>确定</Text>
													</TouchableHighlight>
												</View>
									}
								</View>
							</ModalBase>
							: null}
					</View>
				}
			</View>
		);
	}
}

const setProps = (state) => {
	return {
	}
}

export default connect(setProps)(Login);

const styles = StyleSheet.create({
	loginBox: {
		justifyContent: 'space-between',
	},
	topHalfBox: {
		height: '50%',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	topHalf: {
		alignItems: 'center',
	},
	fingerprintBox: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 5,
	},
	fingerprintIcon: {
		fontSize: 24,
		marginRight: 5,
	},
	forgotPwd: {
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingHorizontal: 25,
		width: '100%',
	},
	forgotPwdBox: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	forgotPwdText: {
		lineHeight: 26,
		color: '#333',
	},
	forgotPwdIcon: {
		marginRight: 3,
		color: '#333',
	},
	titleText: {
		color: '#333',
		lineHeight: 36,
		marginTop: 25,
	},
	titleSubText: {
		color: '#E64340',
		lineHeight: 30,
		marginTop: 15,
		marginHorizontal: 25,
	},
	titleTextSuccess: {
		color: '#1AAD19',
	},
	titleTextErr: {
		color: '#E64340',
	},
	inputPwd: {
		marginTop: 36,
		marginHorizontal: 25,
		height: 50,
	},
	InputKeyboard: {
		height: '50%',
		// paddingHorizontal: 15,
	},

	//InputPwd
	inputPwdBox: {
		flexDirection: 'row',
		justifyContent: 'center',
		borderTopWidth: 2,
		borderLeftWidth: 2,
		borderBottomWidth: 2,
		borderColor: '#333',
	},
	inputPwdItem: {
		flex: 1,
		borderRightWidth: 1,
		borderRightColor: '#ccc',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputPwdItemLast: {
		borderRightWidth: 2,
		borderRightColor: '#333',
	},
	inputPwdItemText: {
		width: 15,
		height: 15,
		borderRadius: 15,
		backgroundColor: '#333',
	},

	//InputKeyboard
	InputKeyboardBox: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		zIndex: 2,
		flex: 1,
	},
	InputKeyboardBg: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		// flex: 1,
		backgroundColor: 'rgba(0, 0, 0, .05)',
	},
	InputKeyboardItem: {
		width: '33.33333333%',
		alignItems: 'center',
		justifyContent: 'center',
		height: '25%',
	},
	InputKeyboardText: {
		color: '#333',
		fontSize: 26,
		lineHeight: 50,
		marginVertical: 5,
	},
	modalText: {
		paddingVertical: 5,
	},
	warningText: {
		color: '#E64340',
	},
});
