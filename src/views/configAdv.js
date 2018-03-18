import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	SectionList,
	AsyncStorage,
	Switch,
	ScrollView,
	PermissionsAndroid,
} from 'react-native';
import { connect } from 'react-redux';

import {
	loginState,
	getAutoBeiFlag,
	getBackHoldFlag,
	getBackHoldTime,
	getErrorPwdFlag,
	getErrorPwdNum,
	getErrorPwdTime,
	getFingerprintFlag,
} from '../assets/appCommonFn';

import ExitAndroid from '../NativeModules/ExitAndroid';
import BackHoldAndroid from '../NativeModules/BackHoldAndroid';
import FingerprintAndroid from '../NativeModules/FingerprintAndroid';

//Css
import style from '../css/common.js';

import ModalBase from '../components/ModalBase';

class ConfigAdv extends Component {
	constructor(props) {
		super(props);
		this.state = {
			resetAppBtnText: '',
			resetAppBtnDisabled: true,
			readly: false,
		};
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	fingerprint = () => new Promise(function (resolve, reject) {
		FingerprintAndroid.isReady(data => {
			if (data.flag) {
				resolve(true);
			} else {
				reject();
			}
		});
	})
	async componentWillMount() {
		let readly = await loginState(this.props);
		let autoBeiVal = await getAutoBeiFlag();
		let backHoldFlag = await getBackHoldFlag();
		let backHoldTime = await getBackHoldTime();
		let errFlag = await getErrorPwdFlag();
		let errNum = await getErrorPwdNum();
		let errTime = await getErrorPwdTime();
		let fingerprintFlag = await getFingerprintFlag();
		let hasFingerprint;
		try {
			hasFingerprint = await this.fingerprint();
		} catch (err) {
			hasFingerprint = false;
		}
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
		let fingerprintFn = {
			key: '', data: [
				{
					children: () => {
						return (
							<View>
								<View style={[styles.box]}>
									<Text
										style={[styles.item, { fontSize: this.props.baseFontSize }]}
										numberOfLines={1}
									>
										指纹登录
									</Text>
									<Switch
										style={styles.autoBeiSwitch}
										thumbTintColor={style.btnBg.backgroundColor}
										tintColor={style.btnSubDisabledBg.backgroundColor}
										onTintColor={style.btnDisabledBg.backgroundColor}
										value={this.state.fingerprintFlag}
										onValueChange={async newVal => {
											storage.save({
												key: 'fingerprintFlag',
												data: newVal,
											}).then(() => {
												this.setState({
													fingerprintFlag: newVal,
												});
											});
										}}
									/>
								</View>
							</View>
						);
					}, disabledOnPress: true,
				},
			]
		};
		let sections = [
			{
				key: '', data: [
					{
						children: () => {
							return (
								<View>
									<View style={[styles.box, styles.hasSubBox]}>
										<Text
											style={[styles.item, { fontSize: this.props.baseFontSize }]}
											numberOfLines={1}
										>
											自动备份
										</Text>
										<Switch
											style={styles.autoBeiSwitch}
											thumbTintColor={style.btnBg.backgroundColor}
											tintColor={style.btnSubDisabledBg.backgroundColor}
											onTintColor={style.btnDisabledBg.backgroundColor}
											value={this.state.autoBeiVal}
											onValueChange={async newVal => {
												if (newVal) {
													let canRead = false;
													let canWrite = false;
													if (OS == 'android') {
														canRead = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
														canWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
													}
													if (canRead && canWrite) {
														storage.save({
															key: 'autoBeiFlag',
															data: newVal,
														}).then(() => {
															this.setState({
																autoBeiVal: newVal,
															});
														});
													} else {
														this.refs.getPermission.setModal(true);
													}
												} else {
													storage.save({
														key: 'autoBeiFlag',
														data: newVal,
													}).then(() => {
														this.setState({
															autoBeiVal: newVal,
														});
													});
												}
											}}
										/>
									</View>
									<View>
										<Text style={[styles.itemSub, { fontSize: this.props.baseFontSize * .9 }]}>自动备份会在每天第一次成功登录应用后进行。</Text>
									</View>
								</View>
							);
						}, disabledOnPress: true,
					},
				]
			},
			{
				key: '', data: [
					{
						children: () => {
							return (
								<View>
									<View>
										<View style={[styles.box, styles.hasSubBox]}>
											<Text
												style={[styles.item, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												后台留存
											</Text>
											<Switch
												style={styles.autoBeiSwitch}
												thumbTintColor={style.btnBg.backgroundColor}
												tintColor={style.btnSubDisabledBg.backgroundColor}
												onTintColor={style.btnDisabledBg.backgroundColor}
												value={this.state.backHoldFlag}
												onValueChange={newVal => {
													storage.save({
														key: 'backHoldFlag',
														data: newVal,
													})
														.then(() => {
															BackHoldAndroid.setBackHoldTime(newVal ? +this.state.backHoldTime : 10);
															this.setState({
																backHoldFlag: newVal,
															});
														})
														;
												}}
											/>
										</View>
										<View>
											<Text style={[styles.itemSub, { fontSize: this.props.baseFontSize * .9 }]}>应用进入后台的保留时间。出于安全考虑时间不建议设置太长。</Text>
										</View>
									</View>
								</View>
							);
						}, disabledOnPress: true,
					},
					{
						children: () => {
							return (
								this.state.backHoldFlag ?
									<View>
										<View style={styles.border}></View>
										<View style={[styles.box]}>
											<Text
												style={[styles.item, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												后台留存时间
											</Text>
											<Text
												style={[styles.item, styles.itemRight, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{this.backHoldTimeText[this.state.backHoldTime / 1000]}
											</Text>
										</View>
									</View>
									: <View></View>
							);
						},
						fn: () => {
							this.refs.modalBackHold.setModal(true);
						}
					},
				]
			},
			{
				key: '', data: [
					{
						children: () => {
							return (
								<View>
									<View>
										<View style={[styles.box, styles.hasSubBox]}>
											<Text
												style={[styles.item, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												密码锁定
											</Text>
											<Switch
												style={styles.autoBeiSwitch}
												thumbTintColor={style.btnBg.backgroundColor}
												tintColor={style.btnSubDisabledBg.backgroundColor}
												onTintColor={style.btnDisabledBg.backgroundColor}
												value={this.state.errFlag}
												onValueChange={(newVal) => {
													storage.save({
														key: 'errorPwdFlag',
														data: newVal,
													})
														.then(() => {
															this.setState({
																errFlag: newVal,
															});
														})
														;
												}}
											/>
										</View>
										<View>
											<Text style={[styles.itemSub, { fontSize: this.props.baseFontSize * .9 }]}>当登录密码连续输错时，锁定应用。出于安全考虑建议开启。</Text>
										</View>
									</View>
								</View>
							);
						}, disabledOnPress: true,
					},
					{
						children: () => {
							return (
								this.state.errFlag ?
									<View>
										<View style={styles.border}></View>
										<View style={[styles.box]}>
											<Text
												style={[styles.item, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												试错次数
											</Text>
											<Text
												style={[styles.item, styles.itemRight, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{this.state.errNum}次
											</Text>
										</View>
									</View>
									: <View></View>
							);
						},
						fn: () => {
							this.refs.modalLockNum.setModal(true);
						}
					},
					{
						children: () => {
							return (
								this.state.errFlag ?
									<View>
										<View style={styles.border}></View>
										<View style={[styles.box]}>
											<Text
												style={[styles.item, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												锁定时长
											</Text>
											<Text
												style={[styles.item, styles.itemRight, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{this.lockTimeText[+this.state.errTime / (1000 * 60 * 60)]}
											</Text>
										</View>
									</View>
									: <View></View>
							);
						},
						fn: () => {
							this.refs.modalLockTime.setModal(true);
						}
					},
				]
			},
			{
				key: '', data: [
					{
						children: () => {
							return (
								<View>
									<View style={[styles.box, styles.hasSubBox]}>
										<Text
											style={[styles.item, { fontSize: this.props.baseFontSize }]}
											numberOfLines={1}
										>
											应用初始化
										</Text>
									</View>
									<View>
										<Text style={[styles.itemSub, { fontSize: this.props.baseFontSize * .9 }]}>删除所有数据及配置。</Text>
									</View>
								</View>
							);
						}, fn: this.resetApp,
					},
				]
			},
		];
		if(hasFingerprint){
			sections.unshift(fingerprintFn);
		}
		this.setState({
			readly,
			autoBeiVal,
			backHoldFlag,
			backHoldTime,
			errFlag,
			errNum,
			errTime,
			fingerprintFlag,
			sections,
		});
	}
	componentWillUnmount() {
		console.log('销毁config');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '高级设置';
		})(),
		headerLeft: (() => {
			const { state, goBack } = navigation;
			return (
				<TouchableHighlight
					activeOpacity={0.6}
					underlayColor='transparent'
					style={style.headerLeftBtn}
					onPress={() => {
						goBack();
					}}
				>
					<Feather
						name="arrow-left"
						size={26}
						color={style.headerTitleIcon.color}
					/>
				</TouchableHighlight>
			);
		})(),
		// headerTitleStyle: {
		// 	// borderWidth: 1,
		// 	marginLeft: 0,
		// 	paddingLeft: 0,
		// 	fontWeight: '100',
		// 	fontFamily: 'monospace',
		// },
	});
	//倒计时秒速
	disabledBtnIndex = 5;
	//防应用初始化多次计时flag
	resetAppModalFlag = true;
	disabledBtn(index) {
		if (index > 0) {
			this.disabledBtnTimer = setTimeout(() => {
				this.setState({
					resetAppBtnText: `确定（${index - 1}）`,
					resetAppBtnDisabled: true,
				}, () => {
					this.disabledBtn(index - 1);
				});
			}, 1000);
		} else {
			this.setState({
				resetAppBtnText: `确定`,
				resetAppBtnDisabled: false,
			});
		}
	}
	resetApp(_this) {
		if (!_this.resetAppModalFlag) return;
		_this.resetAppModalFlag = false;
		_this.refs.modal.setModal(true);
		_this.setState({
			resetAppBtnText: `确定（${_this.disabledBtnIndex}）`,
			resetAppBtnDisabled: true,
		}, () => {
			_this.disabledBtn(_this.disabledBtnIndex);
		});
	}
	lockTimeText = {
		'0.5': '30分钟',
		'1': '1小时',
		'3': '3小时',
		'6': '6小时',
		'12': '12小时',
		'24': '1天',
	};
	backHoldTimeText = {
		'10': '10秒',
		'30': '30秒',
		'60': '1分钟',
		'180': '3分钟',
		'300': '5分钟',
		'600': '10分钟',
	};
	lockTimeArr = ['0.5', '1', '3', '6', '12', '24'];
	lockNumArr = [3, 5, 10, 30, 50];
	backHoldTimeArr = [10, 30, 60, 180, 300, 600];
	render() {
		if (this.props.baseFontSize == null || !this.state.readly) return null;
		return (
			<View style={style.container}>
				<View>
					<SectionList
						style={styles.list}
						keyboardDismissMode='on-drag'
						keyboardShouldPersistTaps='handled'
						renderItem={({ item, index }) => {
							return (
								<TouchableHighlight
									// onPress={this.touchItem.bind(this)}
									onPress={() => {
										if (item.fn) {
											item.fn(this);
										} else if (item.href) {
											this.props.navigation.navigate(item.href, item.data ? item.data : null);
										}
									}}
									disabled={!!item.disabledOnPress}
									underlayColor='#d9d9d9'
								>
									{item.children ?
										item.children() :
										<View style={styles.box}>
											<Text
												style={[styles.item, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{item.name}
											</Text>
										</View>
									}
								</TouchableHighlight>
							)
						}}
						renderSectionHeader={({ section }) => {
							return (
								<View style={styles.headBox}></View>
							)
						}
						}
						initialNumToRender={20}
						keyExtractor={(item, index) => {
							return index;
						}}
						sections={this.state.sections}
						getItemLayout={(data, index) => {
							return ({
								length: 50,
								offset: (60 + 1) * index,
								index,
							});
						}}
						ListFooterComponent={() => {
							return (
								<View
									style={styles.bottomPad}
								></View>
							);
						}}
					></SectionList>
				</View>
				<ModalBase
					ref='modal'
					visible={false}
					cloesModal={() => {
						clearTimeout(this.disabledBtnTimer);
						this.resetAppModalFlag = true;
					}}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>应用初始化</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.warningText, { fontSize: this.props.baseFontSize }]}>应用初始化后，除了导出的备份文件会保留，其他数据将会全部清除且无法恢复。</Text>
							<Text style={[{ fontSize: this.props.baseFontSize }]}>确定要将应用初始化吗？</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modal.setModal(false);
								}}
							>
								<Text
									style={[style.modalFooterBtn, style.btnSubColor, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[this.state.resetAppBtnDisabled ? style.btnDisabledBg : style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
								underlayColor={style.btnHeightBg.backgroundColor}
								disabled={this.state.resetAppBtnDisabled}
								onPress={() => {
									this.refs.modal.setModal(false);
									AsyncStorage.clear(async err => {
										if (!err) {
											await storage.save({ key: 'isInstall', data: false });
											this.refs.modal2.setModal(true);
										}
									});
								}}
							>
								<Text
									style={[this.state.resetAppBtnDisabled ? style.btnDisabledColor : style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>{this.state.resetAppBtnText}</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='modal2'
					visible={false}
					cloesModal={() => {
						ExitAndroid.exit();
					}}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>应用初始化成功</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[{ fontSize: this.props.baseFontSize }]}>点击确定按钮后应用将会关闭，请重新启动应用。</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
								underlayColor={style.btnHeightBg.backgroundColor}
								disabled={this.state.resetAppBtnDisabled}
								onPress={() => {
									ExitAndroid.exit();
								}}
							>
								<Text
									style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>{this.state.resetAppBtnText}</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='modalBackHold'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<ScrollView>
							{this.backHoldTimeArr.map((val, index) => {
								let isCheck = val == +this.state.backHoldTime / 1000;
								return (
									<TouchableHighlight
										key={index}
										underlayColor='#d9d9d9'
										onPress={() => {
											let activeVal = val * 1000;
											storage.save({
												key: 'backHoldTime',
												data: activeVal,
											})
												.then(() => {
													this.setState({
														backHoldTime: activeVal,
													});
													BackHoldAndroid.setBackHoldTime(activeVal);
													this.refs.modalBackHold.setModal(false);
												})
												;
										}}
									>
										<View style={styles.modalItemBox}>
											<Feather
												name={isCheck ? 'check-circle' : 'circle'}
												size={20}
												style={[styles.radioDefault, isCheck ? styles.radioCheck : '']}
											/>
											<Text
												style={[styles.radioText, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{this.backHoldTimeText[val]}
											</Text>
										</View>
									</TouchableHighlight>
								);
							})}
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modalBackHold.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='modalLockNum'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<ScrollView>
							{this.lockNumArr.map((val, index) => {
								let isCheck = val == +this.state.errNum;
								return (
									<TouchableHighlight
										key={index}
										underlayColor='#d9d9d9'
										onPress={async () => {
											await storage.save({
												key: 'errorPwdNum',
												data: val,
											});
											this.setState({
												errNum: val,
											});
											this.refs.modalLockNum.setModal(false);
										}}
									>
										<View style={styles.modalItemBox}>
											<Feather
												name={isCheck ? 'check-circle' : 'circle'}
												size={20}
												style={[styles.radioDefault, isCheck ? styles.radioCheck : '']}
											/>
											<Text
												style={[styles.radioText, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{val}次
										</Text>
										</View>
									</TouchableHighlight>
								);
							})}
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modalLockNum.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='modalLockTime'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<ScrollView>
							{this.lockTimeArr.map((val, index) => {
								let isCheck = val == +this.state.errTime / (1000 * 60 * 60);
								return (
									<TouchableHighlight
										key={index}
										underlayColor='#d9d9d9'
										onPress={() => {
											let activeVal = val * 60 * 60 * 1000;
											storage.save({
												key: 'errorPwdTime',
												data: activeVal,
											})
												.then(() => {
													this.setState({
														errTime: activeVal,
													});
													this.refs.modalLockTime.setModal(false);
												})
												;
										}}
									>
										<View style={styles.modalItemBox}>
											<Feather
												name={isCheck ? 'check-circle' : 'circle'}
												size={20}
												style={[styles.radioDefault, isCheck ? styles.radioCheck : '']}
											/>
											<Text
												style={[styles.radioText, { fontSize: this.props.baseFontSize }]}
												numberOfLines={1}
											>
												{this.lockTimeText[val]}
											</Text>
										</View>
									</TouchableHighlight>
								);
							})}
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modalLockTime.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='getPermission'
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
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>申请权限</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							{this.state.hasPermission == false ?
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>获取权限失败，自动备份无法开启。</Text>
								:
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>自动备份功能需要获取您设备的存储权限。请同意应用获取相关权限。</Text>
							}
						</ScrollView>
						{
							this.state.hasPermission == false ?
								<View style={style.modalFooter}>
									<TouchableHighlight
										style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
										underlayColor={style.btnSubHeightBg.backgroundColor}
										onPress={() => {
											this.refs.getPermission.setModal(false);
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
											this.refs.getPermission.setModal(false);
										}}
									>
										<Text
											style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
										>取消</Text>
									</TouchableHighlight>
									<TouchableHighlight
										style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
										underlayColor={style.btnHeightBg.backgroundColor}
										onPress={async () => {
											let permission = await PermissionsAndroid.requestMultiple([
												PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
												PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
											]);
											if (permission['android.permission.READ_EXTERNAL_STORAGE'] == 'denied' || permission['android.permission.WRITE_EXTERNAL_STORAGE'] == 'denied') {
												this.setState({
													hasPermission: false,
												});
											} else {
												await this.refs.getPermission.setModal(false);
												storage.save({
													key: 'autoBeiFlag',
													data: true,
												}).then(() => {
													this.setState({
														autoBeiVal: true,
													});
												});
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
			</View>
		);
	}
}

const setProps = (state) => {
	return {
		baseFontSize: state.AppFontSize.size,
	}
}

export default connect(setProps)(ConfigAdv);

const styles = StyleSheet.create({
	list: {
		backgroundColor: '#fff',
	},
	box: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		height: 60,
	},
	hasSubBox: {
		height: 'auto',
		paddingTop: 10,
		paddingBottom: 6,
	},
	itemSub: {
		paddingBottom: 10,
		paddingHorizontal: 15,
	},
	headBox: {
		backgroundColor: '#ebebeb',
		height: 24,
	},
	border: {
		marginHorizontal: 10,
		height: 1,
		backgroundColor: '#eee',
	},
	item: {
		textAlignVertical: 'center',
		// borderWidth: 1,
		paddingHorizontal: 15,
		color: '#353535',
	},
	radioText: {
		color: '#353535',
	},
	itemRight: {
		color: '#999',
	},
	bottomPad: {
		height: 50,
		backgroundColor: '#ebebeb',
	},
	warningText: {
		color: '#E64340',
	},
	autoBeiSwitch: {
		marginHorizontal: 10,
	},
	modalItemBox: {
		flexDirection: 'row',
		paddingVertical: 16,
		alignItems: 'center',
	},
	radioDefault: {
		color: '#999',
		paddingLeft: 15,
		paddingRight: 10,
	},
	radioCheck: {
		color: '#1AAD19',
	},
});
