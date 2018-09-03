import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	ScrollView,
} from 'react-native';
import { connect } from 'react-redux';

import {
	loginState,
	setColor,
} from '../assets/appCommonFn';

import colorList from '../assets/color';
import { editColor } from '../actions';

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
			settingColor: props.baseColor,
		};
		_this = this;
	}
	mathColorIndex(color) {
		let list = Object.keys(colorList);
		for(let i = 0, max = list.length; i < max; i++){
			if(color == list[i]){
				return i;
			}
		}
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	async componentWillMount() {
		let readly = await loginState(this.props, true);
		this.setState({
			readly,
			settingColor: this.props.baseColor,
			colorIndex: this.mathColorIndex(this.props.baseColor),
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁editColor');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	// save() {
	// 	let { goBack } = this.props.navigation;
	// 	goBack();
	// }
	activeColor(color) {
		// this.props.navigation.setParams({
		// 	color,
		// });
		this.setState({
			settingColor: color,//"#68605d"
			colorIndex: this.mathColorIndex(color),
		});
		setColor(color, style);
		this.props.dispatch(editColor(color));
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '主题色';
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
		// headerRight: (() => {
		// 	const { state } = navigation;
		// 	let _style = {};
		// 	if (state.params && state.params.color) {
		// 		_style.backgroundColor = state.params.color;
		// 		_style.borderColor = state.params.color;
		// 	}
		// 	// let _this = state.params && state.params._this || undefined;
		// 	return (
		// 		<TouchableHighlight
		// 			style={[styles.headRight, style.btnBg, { ..._style }]}
		// 			underlayColor={style.btnHeightBg.backgroundColor}
		// 			activeOpacity={.6}
		// 			onPress={function () {
		// 				_this.save();
		// 			}}
		// 		>
		// 			<Text
		// 				style={[styles.headRigthText]}
		// 			>完成</Text>
		// 		</TouchableHighlight>
		// 	);
		// })(),
		// headerTitleStyle: {
		// 	// borderWidth: 1,
		// 	marginLeft: 0,
		// 	paddingLeft: 0,
		// 	fontWeight: '100',
		// 	fontFamily: 'monospace',
		// },
	});
	list = [
		{ name: 'kuma色', color: '#68605d' },
		{ name: '中二黑', color: '#24252c' },
		{ name: '中年少女粉', color: '#ffb8b8' },
		{ name: '姨妈红', color: '#ff5053' },
		{ name: '粑粑黄', color: '#eacf36' },
		{ name: '帽子绿', color: '#2fb3a4' },//436a3e
		{ name: '忧郁蓝', color: '#308fdf' },
		{ name: '基佬紫', color: '#795dde' },
	];
	render() {
		if (!this.state.readly) return null;
		return (
			<View style={[style.container, styles.configColorBox]}>
				<ScrollView style={styles.scrollList}>
					<View style={styles.colorBox}>
						{this.list.map((item, index) => {
							return (
								<TouchableHighlight
									style={[styles.colorBlock, { height: style.baseFontSize * 4, backgroundColor: item.color }]}
									key={index}
									underlayColor={colorList[item.color].heightColor}
									onPress={() => {
										this.activeColor(item.color);
									}}
								>
									<View
										style={[styles.colorViewBox]}
									>
										<Text
											style={[styles.colorText, { fontSize: style.baseFontSize * 1.2 }]}
											numberOfLines={1}
										>{item.name}</Text>
										<Feather
											name={this.state.colorIndex == index ? "check-circle" : "circle"}
											size={style.baseFontSize * 1.2}
											color={'#fff'}
										/>
									</View>
								</TouchableHighlight>
							);
						})}
					</View>
				</ScrollView>
			</View>
		);
	}
}

const setProps = (state) => {
	return {
		baseColor: state.AppColor.color,
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
	configColorBox: {
		justifyContent: 'space-between',
	},
	scrollList: {
		flex: 1,
	},
	colorBox: {
		// flexDirection: 'row',
		// justifyContent: 'space-around',
		// flexWrap: 'wrap',
		margin: 5,
		flex: 0,
	},
	colorViewBox: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
	},
	colorBlock: {
		marginHorizontal: 8,
		marginVertical: 6,
		borderRadius: 3,
		justifyContent: 'center',
	},
	colorText: {
		marginRight: 15,
		color: '#fff',
		flex: 1,
	},
});
