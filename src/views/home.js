import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
	StatusBar,
	BackHandler,
	PermissionsAndroid,
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { initAccountList } from '../actions';
import {
	loginState,
	getAutoBeiFlag,
	mkdirInit,
	getTimerFileName,
	getPwd,
	setColor,
} from '../assets/appCommonFn';

//加密组件 crypto-js
import CryptoJS from 'crypto-js';

import FilesAndroid from '../NativeModules/FilesAndroid';

import List from '../components/List.js';
import Tips from '../components/Tips';
import ModalBase from '../components/ModalBase';

//Css
import style from '../css/common.js';

let _this = this;

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			configDoubleClick: false,
			searchDoubleClick: false,
			addDoubleClick: false,
			returnTipsIsShow: false,
			returnTipsText: '',
			readly: false,
		};
		_this = this;
	}
	autoBeiFlag = false;
	readly = false;
	autoSave = async (readly) => {
		let dirInit = (await mkdirInit());
		let fileFile = `${dirInit.rootFile}/beifen`;
		storage.getAllDataForKey('accountList').then(accounts => {
			this.props.dispatch(initAccountList(accounts));
			FilesAndroid.writeFile(fileFile, `/${getTimerFileName()}.kuma`, CryptoJS.AES.encrypt(JSON.stringify(accounts), getPwd()).toString(), true, d => {
				this.setState({
					readly,
					hasPermission: true,
					returnTipsIsShow: true,
					returnTipsText: d.flag ? '自动备份成功' : '自动备份失败',
				});
				storage.save({
					key: 'todayIsSave',
					data: new Date().getTime(),
				});
			});
		});
	}
	async componentWillMount() {
		// await storage.save({
		// 	key: 'todayIsSave',
		// 	data: 0,
		// });
		let readly = await loginState(this.props);
		this.readly = readly;
		this.autoBeiFlag = await getAutoBeiFlag();
		let todayIsSave;
		if (this.autoBeiFlag) {
			try {
				todayIsSave = new Date(new Date().toLocaleDateString()).getTime() < await storage.load({ key: 'todayIsSave' });
			} catch (err) {
				todayIsSave = false;
			}
		}
		if (this.autoBeiFlag && !todayIsSave) {
			let canRead = false;
			let canWrite = false;
			if (OS == 'android') {
				canRead = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
				canWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
			}
			if (canRead && canWrite) {
				this.autoSave(readly);
			} else {
				this.setState({
					hasPermission: false,
				});
			}
		} else {
			storage.getAllDataForKey('accountList').then(accounts => {
				this.props.dispatch(initAccountList(accounts));
				this.setState({
					readly,
				});
			});
		}
		// storage.clearMapForKey('accountList');
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		this._isMounted = true;
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	exitOnOff = false;
	btnGoBack = () => {
		console.log('root页面');
		if (!this.exitOnOff) {
			this.exitOnOff = true;
			this.setState({
				returnTipsIsShow: true,
				returnTipsText: '再按一次退出',
			});
		} else {
			BackHandler.exitApp();
		}
		setTimeout(() => {
			this.exitOnOff = false;
		}, 2000);
		return true;
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return APP_NAME;
		})(),
		headerLeft: null,
		headerTitleStyle: style.headerTitleStyle,
		headerStyle: [style.headerStyle],
		headerRight: (() => {
			const { state, navigate, setParams } = navigation;
			return (
				<View
					style={style.headerRightBox}
				>
					<TouchableHighlight
						activeOpacity={0.6}
						underlayColor='transparent'
						style={styles.headerBtn}
						onPress={() => {
							!_this.state.configDoubleClick && navigate('search', {
								callSetBtn: _this.callSetBtn.bind(_this),
							});
							_this.setState({
								configDoubleClick: true,
							});
						}}
					>
						<Feather
							name="search"
							size={20}
							color={style.headerTitleIcon.color}
						/>
					</TouchableHighlight>
					<TouchableHighlight
						activeOpacity={0.6}
						underlayColor='transparent'
						style={styles.headerBtn}
						onPress={() => {
							!_this.state.configDoubleClick && navigate('config', {
								callSetBtn: _this.callSetBtn.bind(_this),
							});
							_this.setState({
								configDoubleClick: true,
							});
						}}
					>
						<Entypo
							name="dots-three-vertical"
							size={20}
							color={style.headerTitleIcon.color}
						/>
					</TouchableHighlight>
				</View>
			);
		})(),
	});
	_isMounted = false;
	callSetBtn() {
		!this._isMounted && this.setState({
			configDoubleClick: false,
			searchDoubleClick: false,
			addDoubleClick: false,
		});
	}
	render() {
		if (this.autoBeiFlag && this.state.hasPermission == false) {
			return (
				<ModalBase
					ref='getPermission'
					visible={true}
					emptyClose={false}
					cloesModal={() => {
						if (!this.getPermissionInfo) {
							storage.save({
								key: 'autoBeiFlag',
								data: false,
							}).then(() => {
								this.autoBeiFlag = false;
								storage.getAllDataForKey('accountList').then(accounts => {
									this.props.dispatch(initAccountList(accounts));
									this.setState({
										readly: this.readly,
										returnTipsIsShow: true,
										returnTipsText: '自动备份已关闭',
									});
								});
							});
						} else {
							this.autoSave(this.readly);
						}
					}}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>申请权限</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>自动备份功能当前已开启。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>该功能需要获取您设备的存储权限。请同意应用获取相关权限。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>点击取消或拒绝所需权限将会关闭自动备份功能。</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.getPermission.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
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
										this.refs.getPermission.setModal(false);
									} else {
										this.getPermissionInfo = true;
										this.refs.getPermission.setModal(false);
									}
								}}
							>
								<Text
									style={[style.btnColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
								>确定</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
			);
		}
		if (!this.state.readly) return null;
		const { navigate } = this.props.navigation;
		// let sections = [
		// 		{key: 'A', data: [
		// 			{name: '淘宝淘宝淘宝淘宝淘宝淘宝', account: 'aaa123456'},
		// 			{name: '淘宝2', account: 'aaa123456aaa123456aaa123456', star: true},
		// 		]},
		// 	];
		return (
			<View style={style.absoluteBox}>
				<StatusBar
					// translucent={true}
					backgroundColor={style.headerStyle.backgroundColor}
					barStyle='dark-content'
				>
				</StatusBar>
				<List
					sections={this.props.account.data}
					// sections={sections}
					navigation={this.props.navigation}
					callSetBtn={this.callSetBtn.bind(this)}
					baseFontSize={style.baseFontSize}
				/>
				<TouchableHighlight
					style={[styles.addBox, style.btnBg]}
					activeOpacity={.85}
					underlayColor={style.btnHeightBg.backgroundColor}
					onPress={() => {
						!this.state.addDoubleClick && navigate('editAcount', {
							callSetBtn: this.callSetBtn.bind(this),
							mode: 'add',
						});
						this.setState({
							addDoubleClick: true,
						});
					}}
				>
					<Entypo
						name="plus"
						style={[styles.add, style.btnColor]}
					/>
				</TouchableHighlight>
				<Tips
					isShow={this.state.returnTipsIsShow}
					text={this.state.returnTipsText}
					timer={2000}
					baseFontSize={style.baseFontSize}
					callState={(state) => {
						this.setState({
							returnTipsIsShow: false,
							returnTipsText: '',
						});
					}}
				/>
			</View>
		);
	}
}

const setProps = (state) => {
	return {
		account: state.AccountList,
	}
}

export default connect(setProps)(Home);

const styles = StyleSheet.create({
	headerBtn: {
		marginRight: 12,
		padding: 5,
		// backgroundColor: '#c00',
		// borderWidth: 1,
	},
	addBox: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 56,
		height: 56,
		borderRadius: 28,
		position: 'absolute',
		right: 24,
		bottom: 24,
		elevation: 3,
		shadowColor: '#ddd',
		shadowOffset: { width: 3, height: 3 },
		shadowRadius: 5,
		shadowOpacity: .85,
	},
	add: {
		fontSize: 26,
	},
});
