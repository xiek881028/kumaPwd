import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	StatusBar,
	Image,
} from 'react-native';
import { connect } from 'react-redux';

import Swiper from 'react-native-swiper';

import {
	loginState,
} from '../assets/appCommonFn';

//Css
import style from '../css/common.js';

class Config extends Component {
	constructor(props) {
		super(props);
		this.state = {
			readly: false,
		};
		let params = this.props.navigation.state.params;
		if (params && params._mode) {
			this.state.mode = params._mode;
		} else {
			this.state.mode = 'first';
		}
	}
	btnGoBack = () => {
		if (this.state.mode == 'learnAgain') {
			this.props.navigation.goBack();
		} else {
			BackHandler.exitApp();
		}
		return true;
	}
	async componentWillMount() {
		let readly = await loginState(this.props);
		this.setState({
			readly,
			canReturn: this.state.mode == 'learnAgain',
			canJump: this.state.mode == 'first',
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁helpFirst');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: null,
	});
	render() {
		if (this.props.baseFontSize == null || !this.state.readly) return null;
		return (
			<View
				style={style.container}
			>
				<StatusBar
					// translucent={true}
					backgroundColor='#ebebeb'
					barStyle='dark-content'
				>
				</StatusBar>
				<Swiper
					style={styles.SwiperBox}
					loop={false}
					dotStyle={{
						width: 10,
						height: 10,
						borderRadius: 10,
						marginHorizontal: 10,
					}}
					activeDotStyle={{
						width: 16,
						height: 10,
						borderRadius: 10,
						marginHorizontal: 10,
						backgroundColor: style.btnBg.backgroundColor,
					}}
				>
					<View
						style={style.container}
					>
						<Image
							style={styles.img}
							resizeMode='center'
							source={require('../images/setp_1.png')}
						/>
					</View>
					<View
						style={style.container}
					>
						<Image
							style={styles.img}
							resizeMode='center'
							source={require('../images/setp_2.png')}
						/>
					</View>
				</Swiper>
				{
					this.state.canReturn ?
						<TouchableHighlight
							activeOpacity={0.6}
							underlayColor='transparent'
							style={styles.headerLeftBtn}
							onPress={() => {
								this.btnGoBack();
							}}
						>
							<Feather
								name="arrow-left"
								size={26}
								color={style.headerTitleIcon.color}
							/>
						</TouchableHighlight>
						: null
				}
				{
					this.state.canJump ?
						<TouchableHighlight
							onPress={() => {
								this.props.navigation.replace('home');
							}}
							activeOpacity={0.6}
							underlayColor='transparent'
							style={styles.btnBox}
						>
							<Text style={[styles.btn, { fontSize: this.props.baseFontSize * 1 }]}>点我直接进入</Text>
						</TouchableHighlight>
						: null
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

export default connect(setProps)(Config);

const styles = StyleSheet.create({
	SwiperBox: {
		// backgroundColor: '#ebebeb',
		flex: 1,
	},
	headerLeftBtn: {
		position: 'absolute',
		top: 10,
		left: 10,
	},
	img: {
		width: '100%',
		height: '100%',
	},
	btnBox: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		// borderRadius: 3,
		// borderWidth: 1,
		paddingHorizontal: 5,
		paddingVertical: 3,
		overflow: 'hidden',
		bottom: 15,
		right: 15,
	},
	btn: {
		color: '#333',
	},
});
