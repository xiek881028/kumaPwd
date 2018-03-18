import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
	TouchableWithoutFeedback,
	ScrollView,
	PermissionsAndroid,
} from 'react-native';
import { connect } from 'react-redux';

import {
	loginState,
	getPwd,
	getTimerFileName,
} from '../assets/appCommonFn';
import File from '../components/FilesTree';
import Tips from '../components/Tips';
import ModalBase from '../components/ModalBase';
import InputView from '../components/InputView';

import FilesAndroid from '../NativeModules/FilesAndroid';
import ShareAndroid from '../NativeModules/ShareAndroid';

//加密组件 crypto-js
import CryptoJS from 'crypto-js';
//生成唯一id uuid
import uuid from 'uuid/v1';

//Css
import style from '../css/common.js';

class dataBackUp extends Component {
	constructor(props) {
		super(props);
		//activePath包括文件名
		//filePath只有路径名
		this.state = {
			readly: false,
			isRoot: true,
			tipIsShow: false,
			tipText: '',
			activePath: '',
			fileName: '选择操作',
			filePath: '',
			renameDisabled: false,
			hasPermission: true,
		};
	}
	async componentWillMount() {
			this.readly = await loginState(this.props);
			let canRead = false;
			let canWrite = false;
			if(OS == 'android'){
				canRead = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
				canWrite = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
			}
			if(canRead && canWrite){
				this.setState({
					readly: this.readly,
					hasPermission: true,
				});
			}else{
				this.setState({
					hasPermission: false,
				});
			}
	}
	componentWillUnmount() {
		console.log('销毁dataBackUp');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '数据备份';
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
	isRoot(bool) {
		this.setState({
			isRoot: bool
		});
	}
	frontTest(successCb = () => { }) {
		FilesAndroid.isBackupFile(this.state.activePath, d => {
			if (d.flag) {
				successCb();
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
				this.refs.modal2.setModal(false);
				this.setState({
					tipIsShow: true,
					tipText: errMsg,
				});
			}
		});
	}
	renameText = '';
	getText(text) {
		if (!!text.length == this.state.renameDisabled) {
			this.setState({
				renameDisabled: !text.length
			});
		}
		this.renameText = text;
	}
	render() {
		if(!this.state.hasPermission){
			return (
				<ModalBase
					ref='getPermission'
					visible={true}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>申请权限</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>为了能够正常的导入导出，应用需要获取您设备的存储权限。请同意应用获取相关权限。</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.getPermission.setModal(false);
									this.props.navigation.goBack();
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
								underlayColor={style.btnHeightBg.backgroundColor}
								disabled={this.state.resetAppBtnDisabled}
								onPress={async () => {
									let permission = await PermissionsAndroid.requestMultiple([
										PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
										PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
									]);
									if(permission['android.permission.READ_EXTERNAL_STORAGE'] == 'denied' || permission['android.permission.WRITE_EXTERNAL_STORAGE'] == 'denied'){
										this.refs.getPermission.setModal(false);
										this.props.navigation.goBack();
									}else{
										this.setState({
											hasPermission: true,
											readly: this.readly,
										});
									}
								}}
							>
								<Text
									style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>确定</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
			);
		}
		if (this.props.baseFontSize == null || !this.state.readly) return null;
		return (
			<View style={[style.container, styles.fileBox]}>
				<File
					baseFontSize={this.props.baseFontSize}
					navigation={this.props.navigation}
					ref="file"
					isRoot={this.isRoot.bind(this)}
					fileCb={(d) => {
						this.refs.modal2.setModal(true);
						this.setState({
							activePath: d.path,
							fileName: d.fileName,
							filePath: d.filePath,
						});
					}}
				/>
				<View style={styles.bottomOperating}>
					<TouchableHighlight
						style={[style.btnBg, styles.bottomBtnBox]}
						underlayColor={style.btnHeightBg.backgroundColor}
						onPress={() => {
							this.refs.modal.setModal(true);
						}}
					>
						<Text
							style={[style.btnColor, styles.bottomBtnText, { fontSize: this.props.baseFontSize * .8 }]}
						>导出到这里</Text>
					</TouchableHighlight>
					<TouchableHighlight
						style={[styles.bottomBtnBox, this.state.isRoot ? style.btnSubDisabledBg : style.btnSubBg]}
						underlayColor={style.btnSubHeightBg.backgroundColor}
						disabled={this.state.isRoot}
						onPress={() => {
							let _file = this.refs.file;
							this.isRoot(_file.state.parentPath == _file.state.rootPath);
							_file.state.parentPath.length && _file.getFileTree(_file.state.parentPath);
						}}
					>
						<Text
							style={[this.state.isRoot ? style.btnSubDisabledColor : style.btnSubColor, styles.bottomBtnText, { fontSize: this.props.baseFontSize * .8 }]}
						>返回上一层</Text>
					</TouchableHighlight>
				</View>
				<ModalBase
					ref='modal'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>导出数据</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.warningText, { fontSize: this.props.baseFontSize }]}>请牢记登录密码，否则导出的备份文件无法解密。</Text>
							<Text style={[{ fontSize: this.props.baseFontSize }]}>确定导出数据吗？</Text>
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
								style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
								underlayColor={style.btnHeightBg.backgroundColor}
								onPress={() => {
									let _file = this.refs.file;
									storage.getAllDataForKey('accountList').then(accounts => {
										FilesAndroid.writeFile(_file.state.path, `/${getTimerFileName()}.kuma`, CryptoJS.AES.encrypt(JSON.stringify(accounts), getPwd()).toString(), true, d => {
											if (d.flag) {
												_file.getFileTree(_file.state.path);
												this.setState({
													tipIsShow: true,
													tipText: '备份文件导出成功',
												});
											} else {
												this.setState({
													tipIsShow: true,
													tipText: '备份文件导出失败',
												});

											}
											this.refs.modal.setModal(false);
										});
									});
								}}
							>
								<Text
									style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>确定</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<Tips
					isShow={this.state.tipIsShow}
					text={this.state.tipText}
					timer={2000}
					baseFontSize={this.props.baseFontSize}
					callState={state => {
						this.setState({
							tipIsShow: false,
							tipText: '',
						});
					}}
				/>
				<ModalBase
					ref='modal2'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<Text
							style={[style.modalTitle, styles.modalTitle2, { fontSize: this.props.baseFontSize * 1.1 }]}
						>{this.state.fileName}</Text>
						<ScrollView>
							<TouchableHighlight
								style={[styles.modalBtnBox]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.frontTest(() => {
										FilesAndroid.readFile(this.state.activePath, d => {
											this.refs.modal2.setModal(false, () => {
												this.props.navigation.navigate('login', { _mode: 'importCover', data: d.data });
											});
										});
									});
								}}
							>
								<Text
									style={[styles.modalBtnText, style.btnSubColor, { fontSize: this.props.baseFontSize * .9 }]}
								>全部导入</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[styles.modalBtnBox]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.frontTest(() => {
										FilesAndroid.readFile(this.state.activePath, d => {
											this.refs.modal2.setModal(false, () => {
												this.props.navigation.navigate('login', { _mode: 'importAppend', data: d.data });
											});
										});
									});
								}}
							>
								<Text
									style={[styles.modalBtnText, style.btnSubColor, { fontSize: this.props.baseFontSize * .9 }]}
								>仅导入缺失的账号</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[styles.modalBtnBox]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.frontTest(() => {
										this.refs.modal2.setModal(false);
										this.refs.modal4.setModal(true);
									});
								}}
							>
								<Text
									style={[styles.modalBtnText, style.btnSubColor, { fontSize: this.props.baseFontSize * .9 }]}
								>重命名文件</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[styles.modalBtnBox]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.frontTest(() => {
										ShareAndroid.shareFile(`发送备份文件`, this.state.activePath);
										this.refs.modal2.setModal(false);
									});
								}}
							>
								<Text
									style={[styles.modalBtnText, style.btnSubColor, { fontSize: this.props.baseFontSize * .9 }]}
								>发送文件</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[styles.modalBtnBox]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.frontTest(() => {
										this.refs.modal2.setModal(false);
										this.refs.modal3.setModal(true);
									});
								}}
							>
								<Text
									style={[styles.modalBtnText, style.btnSubColor, { fontSize: this.props.baseFontSize * .9 }]}
								>删除文件</Text>
							</TouchableHighlight>
						</ScrollView>
					</View>
				</ModalBase>
				<ModalBase
					ref='modal3'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>删除文件</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[{ fontSize: this.props.baseFontSize }]}>确定删除数据备份文件 “{this.state.fileName}” 吗？</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modal3.setModal(false);
								}}
							>
								<Text
									style={[style.modalFooterBtn, style.btnSubColor, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
								underlayColor={style.btnHeightBg.backgroundColor}
								onPress={() => {
									let _file = this.refs.file;
									this.frontTest(() => {
										FilesAndroid.delFile(this.state.activePath, d => {
											this.refs.modal2.setModal(false);
											this.setState({
												tipIsShow: true,
												tipText: '备份文件删除成功',
											});
											_file.getFileTree(_file.state.path);
											this.refs.modal3.setModal(false);
										});
									});
								}}
							>
								<Text
									style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>确定</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='modal4'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>重命名文件</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<InputView
								placeholder='点这里输入文件名称'
								getText={this.getText.bind(this)}
								value={this.state.fileName}
								autoFocus={true}
								fontSize={this.props.baseFontSize}
							/>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modal4.setModal(false);
								}}
							>
								<Text
									style={[style.modalFooterBtn, style.btnSubColor, { fontSize: this.props.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[this.state.renameDisabled ? style.btnDisabledBg : style.btnBg, style.modalFooterBtnbox, { borderTopColor: style.btnBg.borderColor }]}
								underlayColor={style.btnHeightBg.backgroundColor}
								disabled={this.state.renameDisabled}
								onPress={() => {
									FilesAndroid.rename(this.state.activePath, `${this.state.filePath}/${this.renameText}`, d => {
										let _file = this.refs.file;
										let errMsg = '';
										/*
										code:
										00: 重命名文件成功
										01: 重命名文件失败
										02: 重命名文件已存在同名文件
										 */
										switch (d.code) {
											case '00':
												errMsg = '重命名文件成功';
												break;
											case '01':
												errMsg = '重命名文件失败';
												break;
											case '02':
												errMsg = '文件名和已有文件重复';
												break;
										}
										errMsg.length && this.setState({
											tipIsShow: true,
											tipText: errMsg,
										});
										this.refs.modal4.setModal(false);
										_file.getFileTree(_file.state.path);
									});
								}}
							>
								<Text
									style={[this.state.renameDisabled ? style.btnDisabledColor : style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>确定</Text>
							</TouchableHighlight>
						</View>
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

export default connect(setProps)(dataBackUp);

const styles = StyleSheet.create({
	fileBox: {
		justifyContent: 'flex-end',
		backgroundColor: '#fff',
	},
	bottomOperating: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: '#d9d9d9',
		backgroundColor: '#ebebeb',
	},
	bottomBtnBox: {
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 3,
		width: '38%',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
	},
	bottomBtnText: {
		textAlign: 'center',
	},
	warningText: {
		color: '#E64340',
	},
	modalTitle2: {
		paddingVertical: 15,
	},
	modalBtnBox: {
		justifyContent: 'center',
		// alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: '#ebebeb',
	},
});
