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
} from 'react-native';
import { connect } from 'react-redux';
import {
	editAccountList,
	initAccountList,
} from '../actions';
import {
	loginState,
	addLoginPwd,
	setLoginPwd,
	tryLogin,
	getDataPwd,
	getPwdErr,
	getErrorPwdFlag,
	getErrorPwdNum,
	getErrorPwdTime,
	mkdirInit,
	getTimerFileName,
	fileIsExists,
} from '../assets/appCommonFn';

import FilesAndroid from '../NativeModules/FilesAndroid';
import ShareAndroid from '../NativeModules/ShareAndroid';

import Feather from 'react-native-vector-icons/Feather';

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
						<Text style={[styles.InputKeyboardText, { fontSize: this.props.baseFontSize * 1.6 }]}>{
							this.keyboardArr[i] == 'del' ?
								<Feather name='delete' style={[styles.InputKeyboardText, { fontSize: this.props.baseFontSize * 1.6 }]} />
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
	//适当加入延时 获得更好的视觉体验
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
	async componentWillMount() {
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
				this.errPwdFlag = await getErrorPwdFlag();
				let data = await storage.load({ key: 'loginPwd' });
				let errPwdIndex;
				let saveErrorPwdTime;
				if (this.errPwdFlag) {
					let pwdErr = await getPwdErr();
					errPwdIndex = pwdErr.errPwdIndex;
					saveErrorPwdTime = pwdErr.saveErrorPwdTime;
				}
				if (!this.errPwdFlag || errPwdIndex < this.pwdMaxTry) {
					setLoginPwd(data);
					this.setState({
						readly,
						mode: (state.params && state.params._mode) && state.params._mode || 'login',
						titleText: '请输入密码',
					});
				} else {
					let { unlock, timerStr } = await this.mathUnlockTime(saveErrorPwdTime);
					if (unlock) {
						storage.remove({
							key: 'saveErrorPwdTime',
						}).then(() => {
							storage.save({
								key: 'saveErrorPwdNum',
								data: 0,
							}).then(() => {
								setLoginPwd(data);
								this.setState({
									readly,
									mode: (state.params && state.params._mode) && state.params._mode || 'login',
									titleText: '请输入密码',
								});
							});
						});
					} else {
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
	componentWillUnmount() {
		console.log('销毁login');
		this.passFlag = false;
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: null,
	});
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
				addLoginPwd(this.state.secondPwd.join(''));
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
						let prevDataPwd = getDataPwd();
						this.setPwd(_pwd, () => {
							this.setState({
								titleText: '密码设置成功',
								titleTextMode: 'success',
								titleSubText: '正在用新密码对账号重新加密，请勿操作，否则您将有可能失去您所有的账号！',
							}, () => {
								let nowDataPwd = getDataPwd();
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
					let dataPwd = getDataPwd(_pwd.join(''));
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
			if (this.state.mode == 'login' || this.state.mode == 'importCover' || this.state.mode == 'importAppend') {
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
			let nowDataPwd = getDataPwd();
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
		if (!this.state.readly || this.props.baseFontSize == null) return null;
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
							<Text style={[styles.titleText, this.state.titleTextMode == 'success' ? styles.titleTextSuccess : this.state.titleTextMode == 'error' ? styles.titleTextErr : '', { fontSize: this.props.baseFontSize * 1.25 }]}>
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
													style={[styles.forgotPwdIcon, { fontSize: this.props.baseFontSize * 1.125 }]}
												/>
												<Text style={[styles.forgotPwdText, { fontSize: this.props.baseFontSize }]}>我有备份文件</Text>
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
														style={[styles.forgotPwdIcon, { fontSize: this.props.baseFontSize * 1.125 }]}
													/>
													<Text style={[styles.forgotPwdText, { fontSize: this.props.baseFontSize }]}>忘记密码</Text>
												</View>
											</TouchableHighlight>
										</View>
										: null
							}
							{
								this.state.titleSubText ?
									<Text style={[styles.titleSubText, this.state.titleSubTextMode == 'success' ? styles.titleTextSuccess : '', { fontSize: this.props.baseFontSize }]}>{this.state.titleSubText}</Text>
									: null
							}
						</View>
						<InputKeyboard
							style={styles.InputKeyboard}
							getKeybordVal={this.getKeybordVal.bind(this)}
							baseFontSize={this.props.baseFontSize}
						/>
						{this.state.mode == 'register' ?
							<ModalBase
								ref='importModal'
								visible={false}
							>
								<View
									style={style.modalBox}
								>
									<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>提示</Text>
									<ScrollView style={[style.modalContent]}>
										<Text style={[{ fontSize: this.props.baseFontSize }]}>如果您有{APP_NAME}的备份文件，请在设置密码后，在设置→数据备份中选择备份文件进行导入。</Text>
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
												style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
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
								cloesModal={()=>{
									this.setState({
										hasPermission: null,
									});
								}}
							>
								<View
									style={style.modalBox}
								>
									<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>提示</Text>
									{
										this.state.isExportList ?
											<ScrollView contentContainerStyle={[style.modalContent]}>
												<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>账号列表已成功导出到 {this.state.isExportListPath} 。</Text>
												<Text style={[styles.warningText, { fontSize: this.props.baseFontSize }]}>您可以点击发送按钮发送列表文件到其它应用中查看。</Text>
											</ScrollView>
											:
											this.state.hasPermission == false ?
												<ScrollView contentContainerStyle={[style.modalContent]}>
													<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>应用未能成功获取相应权限，导出失败。</Text>
												</ScrollView>
												:
												<ScrollView contentContainerStyle={[style.modalContent]}>
													<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>十分抱歉，应用无法提供密码找回功能。</Text>
													<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>但我们可以帮您导出一份账号列表，您可以根据列表手动找回密码。</Text>
													<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>导出列表功能需要获取您设备的存储权限。如果弹出权限申请，请同意。</Text>
													<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>确定导出列表吗？</Text>
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
														style={[style.modalFooterBtn, style.btnSubColor, { fontSize: this.props.baseFontSize }]}
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
														style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
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
															style={[style.modalFooterBtn, style.btnSubColor, { fontSize: this.props.baseFontSize }]}
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
															style={[style.modalFooterBtn, style.btnSubColor, { fontSize: this.props.baseFontSize }]}
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
																if(permission['android.permission.READ_EXTERNAL_STORAGE'] == 'denied' || permission['android.permission.WRITE_EXTERNAL_STORAGE'] == 'denied'){
																	this.setState({
																		hasPermission: false,
																	});
																}else{
																	this.exportList();
																}
															}
														}}
													>
														<Text
															style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
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
		baseFontSize: state.AppFontSize.size,
	}
}

export default connect(setProps)(Login);

const styles = StyleSheet.create({
	loginBox: {
		justifyContent: 'space-between',
	},
	topHalfBox: {
		alignItems: 'center',
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
