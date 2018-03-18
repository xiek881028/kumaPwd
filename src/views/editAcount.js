import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	ScrollView,
	Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import {
	addAccountList,
	editAccountList,
} from '../actions';
import {
	loginState,
	getPwd,
} from '../assets/appCommonFn';

//生成唯一id uuid
import uuid from 'uuid/v1';
//加密组件 crypto-js
import CryptoJS from 'crypto-js';

//Css
import style from '../css/common.js';
import InputView from '../components/InputView';
import PinYin from '../assets/pinyin/pinyin';

let _this;

class AddAconut extends Component {
	_name = '';
	_account = '';
	_pwd = '';
	constructor(props) {
		super(props);
		const { state } = props.navigation;
		this.state = {
			readly: false,
		};
		this.state.moreList = [];
		this.defaultId = state.params.data ? state.params.data.id : '';
		this.defaultName = state.params.data ? state.params.data.name : '';
		this.defaultAccount = state.params.data ? state.params.data.account : '';
		this.defaultPwd = state.params.data ? CryptoJS.AES.decrypt(state.params.data.pwd, getPwd()).toString(CryptoJS.enc.Utf8) : '';
		_this = this;
	}
	async componentWillMount() {
		let readly = await loginState(this.props);
		this.setState({
			readly,
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁editAccount');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
		Keyboard.removeAllListeners('keyboardDidHide');
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return `${navigation.state.params.mode == 'add' ? '新增' : '编辑'}账号`;
		})(),
		headerStyle: [style.headerStyle],
		headerLeft: (() => {
			const { state, goBack } = navigation;
			// console.log(state);
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
		headerRight: (() => {
			const { state } = navigation;
			return (
				<TouchableHighlight
					style={[styles.headRight, style.btnBg, state.params && state.params.btnRemoveDisabled ? '' : style.btnDisabledBg]}
					underlayColor={style.btnHeightBg.backgroundColor}
					activeOpacity={.6}
					onPress={state.params && state.params.btnRemoveDisabled ? () => {
						_this.save();
					} : null}
				>
					<Text
						style={[styles.headRigthText, state.params && state.params.btnRemoveDisabled ? '' : styles.disabledText]}
					>完成</Text>
				</TouchableHighlight>
			);
		})(),
	});
	// renderItem(item, index) {
	// 	return (
	// 		<View style={styles.moreGroup} key={index}>
	// 			<View style={styles.moreGroupName}>
	// 				<InputView
	// 					maxLength={30}
	// 					placeholder='点击输入名称，例如备注、手机号、邮箱'
	// 				/>
	// 			</View>
	// 			<View style={styles.moreGroupVal}>
	// 				<InputView
	// 					maxLength={30}
	// 					placeholder='点击输入自定义值'
	// 				/>
	// 			</View>
	// 		</View>
	// 	);
	// }
	save() {
		let { goBack, setParams, state } = this.props.navigation;
		setParams({
			btnRemoveDisabled: false,
		});
		let data = {
			name: this._name,
			account: this._account,
			pwd: this._pwd === '' ? '' : CryptoJS.AES.encrypt(this._pwd, getPwd()).toString(),
			pinyin: PinYin(this._name),
			id: this.defaultId.length ? this.defaultId : uuid(),
		};
		//redux
		if (this.defaultId.length) {
			data.star = state.params.data.star;
			this.props.dispatch(editAccountList(data));
		} else {
			this.props.dispatch(addAccountList(data));
		}
		Keyboard.dismiss();
		Keyboard.addListener('keyboardDidHide', () => {
		});
		goBack();
	}
	// addItem() {
	// 	this.state.moreList.push('1');
	// 	this.setState({
	// 		moreList: this.state.moreList,
	// 	});
	// }
	getText(name, val) {
		switch (name) {
			case 'name':
				this._name = val;
				break;
			case 'account':
				this._account = val;
				break;
			case 'pwd':
				this._pwd = val;
				break;
		}
		this.verificationData();
	}
	verificationData() {
		const { state, setParams } = this.props.navigation;
		let onOff = !!this._name.length && !!this._account.length;
		if (!state.params || state.params.btnRemoveDisabled != onOff) {
			setParams({
				btnRemoveDisabled: onOff,
			});
		}
	}
	render() {
		if (this.props.baseFontSize == null || !this.state.readly) return null;
		let { state } = this.props.navigation;
		return (
			<View style={style.container}>
				<ScrollView
					keyboardShouldPersistTaps='handled'
					onContentSizeChange={(width, height) => {
						this.refs.scrollView.scrollToEnd();
					}}
					ref="scrollView"
				>
					<View>
						<View style={styles.groupTitle}>
							<Text style={[styles.groupTitleText, { fontSize: this.props.baseFontSize }]}>名称</Text>
							<Text style={[styles.warning, { fontSize: this.props.baseFontSize * .8 }]}>(必填)</Text>
						</View>
						<View style={styles.groupInput}>
							<InputView
								placeholder='点这里输入名称，例如微信、淘宝'
								getText={this.getText.bind(this, 'name')}
								value={this.defaultName}
								autoFocus={state.params.mode == 'add'}
								fontSize={this.props.baseFontSize}
							/>
						</View>
					</View>
					<View>
						<View style={styles.groupTitle}>
							<Text style={[styles.groupTitleText, { fontSize: this.props.baseFontSize }]}>账号</Text>
							<Text style={[styles.warning, { fontSize: this.props.baseFontSize * .8 }]}>(必填)</Text>
						</View>
						<View style={styles.groupInput}>
							<InputView
								placeholder='点这里输入账号'
								getText={this.getText.bind(this, 'account')}
								value={this.defaultAccount}
								fontSize={this.props.baseFontSize}
							/>
						</View>
					</View>
					<View>
						<View style={styles.groupTitle}>
							<Text style={[styles.groupTitleText, { fontSize: this.props.baseFontSize }]}>密码</Text>
						</View>
						<View style={styles.groupInput}>
							<InputView
								placeholder='点这里输入密码'
								getText={this.getText.bind(this, 'pwd')}
								value={this.defaultPwd}
								fontSize={this.props.baseFontSize}
							/>
						</View>
					</View>
					{/* {this.state.moreList.length ?
						<View>
							<View style={styles.groupTitle}>
								<Text>自定义添加项</Text>
							</View>
							<View>
								{this.state.moreList.map((item, index)=>{
									return this.renderItem(item, index);
								})}
							</View>
						</View>
						: null
					}
					<TouchableHighlight
						style={styles.more}
						onPress={this.addItem.bind(this)}
						underlayColor='#DEDEDE'
					>
						<Text style={styles.moreText}>添加更多</Text>
					</TouchableHighlight> */}
				</ScrollView>
			</View>
		);
	}
}

const setProps = (state) => {
	return {
		baseFontSize: state.AppFontSize.size,
	}
}

export default connect(setProps)(AddAconut);

const styles = StyleSheet.create({
	groupTitle: {
		paddingVertical: 8,
		paddingHorizontal: 15,
		flexDirection: 'row',
		alignItems: 'center',
	},
	groupTitleText: {
		color: '#353535',
	},
	warning: {
		color: '#c00',
		marginLeft: 5,
	},
	groupInput: {
		backgroundColor: '#fff',
		paddingVertical: 15,
		paddingHorizontal: 15,
	},
	// more: {
	// 	marginTop: 20,
	// 	marginBottom: 25,
	// 	paddingHorizontal: 15,
	// 	backgroundColor: '#fff',
	// 	height: 40,
	// 	justifyContent: 'center',
	// 	// alignItems: 'center',
	// },
	// moreText: {
	// 	color: '#586C94',
	// },
	headRight: {
		marginRight: 10,
		borderRadius: 3,
		paddingHorizontal: 15,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	disabledText: {
		color: 'rgba(255, 255, 255, .6)',
	},
	headRigthText: {
		color: '#fff',
	},
	moreGroup: {
		marginBottom: 10,
		backgroundColor: '#fff',
	},
	moreGroupName: {
		paddingRight: 15,
		paddingLeft: 15,
		paddingVertical: 10,
	},
	moreGroupVal: {
		paddingLeft: 15,
		paddingRight: 15,
		paddingVertical: 10,
	},
});
