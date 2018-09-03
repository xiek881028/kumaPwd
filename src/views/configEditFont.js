import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	ScrollView,
	Slider,
} from 'react-native';
import { connect } from 'react-redux';

import {
	loginState,
	setFontSize,
} from '../assets/appCommonFn';
import { editFontSize } from '../actions';

//Css
import style from '../css/common.js';

let _this;

class configEditFont extends Component {
	baseFont = 16;
	fontRate = [.875, 1, 1.25, 1.625];
	constructor(props) {
		super(props);
		this.state = {
			readly: false,
			settingFont: props.baseFontSize,
			valIndex: this.mathValIndex(props.baseFontSize),
		};
		_this = this;
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	mathValIndex(fontSize) {
		let nowFontRate = fontSize / 16;
		let nowValIndex = 0;
		for (let i = 0, max = this.fontRate.length; i < max; i++) {
			if (nowFontRate == this.fontRate[i]) {
				nowValIndex = i;
				break;
			}
		}
		return nowValIndex;
	}
	// componentWillReceiveProps(props) {
	// 	this.setState({
	// 		settingFont: props.baseFontSize,
	// 		valIndex: this.mathValIndex(props.baseFontSize),
	// 	});
	// }
	async componentWillMount() {
		let readly = await loginState(this.props);
		this.setState({
			readly,
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁editFont');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	save() {
		let { goBack } = this.props.navigation;
		setFontSize(this.state.settingFont, style);
		this.props.dispatch(editFontSize(this.state.settingFont));
		goBack();
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '字体大小';
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
		headerRight: (() => {
			const { state } = navigation;
			return (
				<TouchableHighlight
					style={[styles.headRight, style.btnBg]}
					underlayColor={style.btnHeightBg.backgroundColor}
					activeOpacity={.6}
					onPress={() => {
						_this.save();
					}}
				>
					<Text
						style={[styles.headRigthText]}
					>完成</Text>
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
	render() {
		if (this.props.baseFontSize == null || !this.state.readly) return null;
		return (
			<View style={[style.container, styles.configEditFontBox]}>
				<ScrollView style={styles.scrollList}>
					<View style={{ marginBottom: 20 }}>
						<View style={styles.headBox}>
							<Text style={[styles.headItem, { fontSize: this.state.settingFont * .7 }]}>L</Text>
						</View>
						<View style={styles.box}>
							<Text
								style={[styles.item, { fontSize: this.state.settingFont }]}
								numberOfLines={1}
							>
								列表样例
							</Text>
							<Text
								style={[styles.account, { fontSize: this.state.settingFont }]}
								numberOfLines={1}
							>
								字体大小样例
							</Text>
						</View>
					</View>

					<View>
						<View style={[styles.contentBox, styles.topContent]}>
							<View style={styles.datailsTitle}>
								<Text style={[styles.detailsTitleText, { fontSize: this.state.settingFont * 1.8 }]}>
									详情样例
								</Text>
							</View>
							<View
								style={styles.detailsLine}
							>
								<View style={styles.LineHead}>
									<Text style={[styles.detailsLineLabel, { fontSize: this.state.settingFont }]}>账号：</Text>
									<Text
										style={[styles.copy, { fontSize: this.state.settingFont * .9 }]}
									>点我复制账号</Text>
								</View>
								<Text style={[styles.detailsLineVal, { fontSize: this.state.settingFont * 1.2 }]}>字体大小样例</Text>
							</View>
							<View style={styles.detailsBorder}></View>
							<View
								style={styles.detailsLine}
							>
								<View style={styles.LineHead}>
									<Text style={[styles.detailsLineLabel, { fontSize: this.state.settingFont }]}>密码：</Text>
									<Text
										style={[styles.copy, { fontSize: this.state.settingFont * .9 }]}
									>点我复制密码</Text>
								</View>
								<Text style={[styles.detailsLineVal, { fontSize: this.state.settingFont * 1.2 }]}>123456</Text>
							</View>
						</View>
					</View>

					<View>
						<View style={[styles.btnBox, style.btnBg]}>
							<Text style={[styles.btn, style.btnColor, { fontSize: this.state.settingFont * 1.125 }]}>按钮样例</Text>
						</View>
					</View>
				</ScrollView>
				<View style={styles.bottomBox}>
					<View style={styles.bottomFontList}>
						<Text style={[styles.bottomFont, styles.bottomFontFirst, styles.fontSmall]}>小</Text>
						<Text style={[styles.bottomFont, styles.fontNormal]}>标准</Text>
						<Text style={[styles.bottomFont, styles.fontBig]}>偏大</Text>
						<Text style={[styles.bottomFont, styles.bottomFontLast, styles.fontBigger]}>大</Text>
					</View>
					<Slider
						maximumTrackTintColor={style.btnBg.backgroundColor}
						minimumTrackTintColor={style.btnBg.backgroundColor}
						thumbTintColor={style.btnBg.backgroundColor}
						maximumValue={3}
						value={this.state.valIndex}
						step={1}
						onValueChange={(val) => {
							this.setState({
								settingFont: this.baseFont * this.fontRate[val],
							});
						}}
					/>
				</View>
			</View>
		);
	}
}

const setProps = (state) => {
	return {
		baseFontSize: state.AppFontSize.size,
	}
}

export default connect(setProps)(configEditFont);

const styles = StyleSheet.create({
	headRight: {
		marginRight: 10,
		borderRadius: 3,
		paddingHorizontal: 15,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headRigthText: {
		color: '#fff',
	},
	configEditFontBox: {
		justifyContent: 'space-between',
	},
	scrollList: {
		flex: 1,
	},
	bottomBox: {
		paddingVertical: 20,
		paddingHorizontal: 15,
		backgroundColor: '#fff',
	},
	bottomFontList: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		// paddingHorizontal: 10,
		paddingBottom: 10,
	},
	bottomFont: {
		// backgroundColor: '#c00',
		width: 50,
		textAlign: 'center',
	},
	bottomFontFirst: {
		width: 30,
	},
	bottomFontLast: {
		width: 30,
	},
	box: {
		flexDirection: 'row',
		// justifyContent: 'space-around',
		height: 60,
		backgroundColor: '#fff',
	},
	item: {
		textAlignVertical: 'center',
		// borderWidth: 1,
		width: 120,
		paddingLeft: 15,
		color: '#353535',
	},
	account: {
		textAlignVertical: 'center',
		color: '#666',
		paddingHorizontal: 20,
		width: 200,
	},
	headBox: {
		backgroundColor: '#ebebeb',
	},
	headItem: {
		textAlignVertical: 'center',
		// borderWidth: 1,
		height: 24,
		paddingHorizontal: 15,
		color: '#888',
	},
	contentBox: {
		backgroundColor: '#fff',
		marginHorizontal: 10,
		marginBottom: 25,
		paddingHorizontal: 10,
		borderRadius: 3,
	},
	datailsTitle: {
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	detailsTitleText: {
		lineHeight: 50,
		paddingTop: 10,
		paddingBottom: 5,
		paddingHorizontal: 10,
		color: '#353535',
	},
	detailsLine: {
		// flexDirection: 'row',
		padding: 10,
	},
	LineHead: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 10,
	},
	copy: {
		color: '#586C94',
	},
	detailsLineLabel: {
		color: '#353535',
		paddingRight: 5,
	},
	detailsLineVal: {
		color: '#888',
		flex: 1,
	},
	detailsBorder: {
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	btnBox: {
		marginHorizontal: 10,
		marginBottom: 25,
		alignItems: 'center',
		borderRadius: 3,
		borderWidth: 1,
	},
	btn: {
		lineHeight: 46,
	},

	fontSmall: {
		fontSize: 14,
	},
	fontNormal: {
		fontSize: 16,
	},
	fontBig: {
		fontSize: 20,
	},
	fontBigger: {
		fontSize: 26,
	},
});
