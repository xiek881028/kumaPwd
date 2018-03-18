import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	SectionList,
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';

import {
	loginState,
	resetAppCommonFn,
} from '../assets/appCommonFn';

import ShareAndroid from '../NativeModules/ShareAndroid';
import AliPayAndroid from '../NativeModules/AliPayAndroid';

import ModalBase from '../components/ModalBase';

//Css
import style from '../css/common.js';

class Config extends Component {
	constructor(props) {
		super(props);
		this.state = {
			readly: false,
		};
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	async componentWillMount() {
		let readly = await loginState(this.props);
		this.setState({
			readly,
			doubleClick: false,
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁config');
		this._isMounted = true;
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	_isMounted = false;
	callSetBtn() {
		!this._isMounted && this.setState({
			doubleClick: false,
		});
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '设置';
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
	shareApp() {
		if (OS == 'android') {
			ShareAndroid.shareText('分享应用', '账号匣，简单、安全、好用的账号记录工具\nhttps://www.coolapk.com/apk/180130');
		}
	}
	sections = [
		// {
		// 	key: '', data: [
		// 		{ name: '重看新手引导', href: 'helpFirst', data: { _mode: 'learnAgain' } },
		// 	]
		// },
		{
			key: '', data: [
				{ name: '设置字体大小', href: 'configEditFont' },
			]
		},
		{
			key: '', data: [
				{ name: '修改密码', href: 'login', data: { _mode: 'editPwd' } },
			]
		},
		{
			key: '', data: [
				{ name: '数据备份', href: 'dataBackUp' },
			]
		},
		{
			key: '', data: [
				{ name: '高级设置', href: 'configAdv' },
			]
		},
		{
			key: '', data: [
				{ name: '关于', href: 'about' },
				{ name: '分享', fn: this.shareApp.bind(this) },
			]
		},
		{
			key: '', data: [
				{
					name: '捐助作者', fn: () => {
						if (OS == 'android') {
							this.setState({
								aliPayMode: 1,
							});
							this.refs.aliPay.setModal(true);
						}
					}
				},
			]
		},
	];
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
										this.setState({
											doubleClick: true,
										}, () => {
											if (item.fn) {
												item.fn(this);
												setTimeout(() => {
													this.setState({
														doubleClick: false,
													});
												}, 500);
											} else {
												this.props.navigation.navigate(item.href, item.data ? { ...item.data, callSetBtn: this.callSetBtn.bind(this) } : { callSetBtn: this.callSetBtn.bind(this) });
											}
										});
									}}
									underlayColor='#d9d9d9'
									disabled={this.state.doubleClick}
								>
									<View style={styles.box}>
										<Text
											style={[styles.item, { fontSize: this.props.baseFontSize }]}
											numberOfLines={1}
										>
											{item.name}
										</Text>
									</View>
								</TouchableHighlight>
							)
						}}
						renderSectionHeader={({ section }) => {
							return (
								<View style={styles.headBox}></View>
							)
						}
						}
						ItemSeparatorComponent={() => <View style={styles.border}></View>}
						initialNumToRender={20}
						keyExtractor={(item, index) => {
							return index;
						}}
						sections={this.sections}
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
					ref='aliPay'
					visible={false}
				>
					{this.state.aliPayMode == 1 ?
						<View
							style={style.modalBox}
						>
							<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>捐助作者</Text>
							<ScrollView contentContainerStyle={[style.modalContent]}>
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>人间有真情，人间有真爱。</Text>
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>好人一生平安。</Text>
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>您的一点小小支持将是作者前进的动力。</Text>
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>Ps：目前只支持用支付宝进行捐助。</Text>
							</ScrollView>
							<View style={style.modalFooter}>
								<TouchableHighlight
									style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
									underlayColor={style.btnSubHeightBg.backgroundColor}
									onPress={() => {
										this.refs.aliPay.setModal(false);
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
										AliPayAndroid.pay('HTTPS://QR.ALIPAY.COM/FKX01558R6UKNKBCBHOH83', d => {
											if (!d.flag) {
												this.setState({
													aliPayMode: 2,
												});
											}else{
												this.refs.aliPay.setModal(false);
											}
										});
									}}
								>
									<Text
										style={[style.btnColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
									>确定</Text>
								</TouchableHighlight>
							</View>
						</View>
						:
						<View
							style={style.modalBox}
						>
							<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>捐助失败</Text>
							<ScrollView contentContainerStyle={[style.modalContent]}>
								<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>QAQ...唤起支付宝失败了，可能是因为您的手机没有安装支付宝。您不能给作者小钱钱了。</Text>
							</ScrollView>
							<View style={style.modalFooter}>
								<TouchableHighlight
									style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
									underlayColor={style.btnSubHeightBg.backgroundColor}
									onPress={() => {
										this.refs.aliPay.setModal(false);
									}}
								>
									<Text
										style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
									>关闭</Text>
								</TouchableHighlight>
							</View>
						</View>
					}
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

export default connect(setProps)(Config);

const styles = StyleSheet.create({
	list: {
		backgroundColor: '#fff',
	},
	box: {
		flexDirection: 'row',
		// justifyContent: 'space-around',
		height: 60,
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
	bottomPad: {
		height: 50,
		backgroundColor: '#ebebeb',
	},
});
