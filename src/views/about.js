import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	TouchableWithoutFeedback,
	BackHandler,
	View,
	ScrollView,
	Image,
} from 'react-native';
import { connect } from 'react-redux';

import {
	loginState,
} from '../assets/appCommonFn';

import ModalBase from '../components/ModalBase';
import Tips from '../components/Tips';

//Css
import style from '../css/common.js';

class About extends Component {
	constructor(props) {
		super(props);
		this.state = {
			readly: false,
			tipsIsShow: false,
			tipsText: '',
			eggIndex: 0,
			eggShowIndex: 8,
			tipTurnOff: false,
		};
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	egg() {
		let index = this.state.eggIndex + 1;
		let state = {};
		if(index >= 3 || index == this.state.eggShowIndex){
			state.tipsIsShow = true;
			state.tipsText = `离彩蛋还有${this.state.eggShowIndex - index}下`;
		}
		state.eggIndex = index;
		if(index >= this.state.eggShowIndex){
			state.tipTurnOff = true;
			this.refs.eggImg.setModal(true);
		}
		this.setState(state);
	}
	async componentWillMount() {
		let readly = await loginState(this.props);
		this.setState({ readly });
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁about');
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '关于';
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
	});
	render() {
		if (!this.state.readly) return null;
		return (
			<View
				style={[style.container, styles.aboutBox]}
			>
				<ScrollView>
					<View style={styles.iconBox}>
						<TouchableWithoutFeedback
							onPress={() => {
								this.egg();
							}}
						>
							<Image
								source={require('../images/Icon.png')}
								style={styles.kumaIcon}
							/>
						</TouchableWithoutFeedback>
						<Text
							style={[styles.appName, { fontSize: style.baseFontSize * 1.2 }]}
						>{APP_NAME}</Text>
						<Text
							style={[styles.version, { fontSize: style.baseFontSize * .9 }]}
						>{VERSION}</Text>
					</View>
					<View style={styles.listBox}>
						<TouchableHighlight
							style={styles.listLine}
							underlayColor={style.btnSubHeightBg.backgroundColor}
							onPress={() => {
								this.refs.service.setModal(true);
							}}
						>
							<Text style={[styles.listLineText, { fontSize: style.baseFontSize }]}>免责声明</Text>
						</TouchableHighlight>
						<View style={styles.border}></View>
						<TouchableHighlight
							style={styles.listLine}
							underlayColor={style.btnSubHeightBg.backgroundColor}
							onPress={() => {
								this.refs.saySomething.setModal(true);
							}}
						>
							<Text style={[styles.listLineText, { fontSize: style.baseFontSize }]}>作者的碎碎念</Text>
						</TouchableHighlight>
						<View style={styles.border}></View>
						<TouchableHighlight
							style={styles.listLine}
							underlayColor={style.btnSubHeightBg.backgroundColor}
							onPress={() => {
								this.refs.thanks.setModal(true);
							}}
						>
							<Text style={[styles.listLineText, { fontSize: style.baseFontSize }]}>感谢</Text>
						</TouchableHighlight>
					</View>
					<View style={styles.appInfo}>
						<Text
							style={[styles.infoText, { fontSize: style.baseFontSize * .9 }]}
						>
							{APP_NAME}是一款账号记录工具
						</Text>
						<Text
							style={[styles.infoText, { fontSize: style.baseFontSize * .9 }]}
						>
							简单、安全、好用，是它的追求
						</Text>
					</View>
				</ScrollView>
				<View style={styles.powerBox}>
					<Text
						style={[styles.poweredText, { fontSize: style.baseFontSize * .9 }]}
					>
						Powered by XieK
					</Text>
				</View>
				<ModalBase
					ref='service'
					visible={false}
					cloesModal={() => {
					}}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>免责声明</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>在使用《{APP_NAME}》前，请您务必仔细阅读并透彻理解本声明。您可以选择不使用《{APP_NAME}》，但如果您使用《{APP_NAME}》，您的使用行为将被视为对本声明全部内容的认可。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>您拥有《{APP_NAME}》的免费使用权。但不得对《{APP_NAME}》软件进行反向工程、反向汇编、反向编译。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>您应该对使用《{APP_NAME}》的结果自行承担风险。《{APP_NAME}》是作者学习制作的软件。由于作者技术水平有限，并且软件技术更新速度快，《{APP_NAME}》无法保证是完全安全的。在使用过程中发生的任何意外或损失，作者概不负责。但作者会努力采取积极的措施保护您帐号、密码的安全。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>本声明未涉及的问题请参见国家有关法律法规，当本声明与国家有关法律法规冲突时，以国家法律法规为准。</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.service.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
								>关闭</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='saySomething'
					visible={false}
					cloesModal={() => {
					}}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>作者的碎碎念</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>《{APP_NAME}》是我的第一个APP作品。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>它基于react-native技术开发。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>相对于传统原生应用，react-native开发的APP运行速度与流畅性都有待提高，并且安装包体积也更大。所以打开应用时，会有1~3秒（视手机性能）的白屏时间，目前react-native还未修复。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>当然，react-native也有它自己的优势，有兴趣的童鞋可以自行度娘。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>源码已经放在github上，网址为https://github.com/xiek881028/kumaPwd。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>由于是第一次开发APP，一定会有非常多欠考虑的地方，所以还请大家多多包涵。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>如果在使用过程中遇到什么问题，或是发现了bug，或者有什么改进的意见和建议，都可以给作者发邮件。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>邮箱： xk285985285@qq.com</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>最后，希望您能喜欢《{APP_NAME}》。</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.saySomething.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
								>关闭</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='thanks'
					visible={false}
					cloesModal={() => {
					}}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>感谢</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>首先，感谢打开《{APP_NAME}》的您。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 chenxx 童鞋支持了巨额开发资金~</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 谢武龙 童鞋在技术方面提供的帮助。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 Skeleton 童鞋在UI风格、产品逻辑、文案润色方面提供的帮助。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 Hyde 童鞋在产品逻辑方面提供的帮助。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 父母 做为产品体验师提出的宝贵意见。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 《账号本子》 给了本作品诸多灵感。</Text>
							<Text style={[styles.modalText, { fontSize: style.baseFontSize }]}>感谢 react-native、redux、WeUI、crypto-js等众多开源技术。</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.btnSubBg, style.modalFooterBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.thanks.setModal(false);
								}}
							>
								<Text
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: style.baseFontSize }]}
								>关闭</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<ModalBase
					ref='eggImg'
					visible={false}
				>
					<View
						style={styles.eggPhotoBox}
					>
						<Image
							source={require('../images/egg.jpg')}
							resizeMode='cover'
							style={styles.eggPhoto}
						></Image>
					</View>
					<TouchableHighlight
						onPress={() => {
							this.refs.eggImg.setModal(false);
						}}
						underlayColor={style.btnSubHeightBg.backgroundColor}
						style={[styles.btnBox, style.btnSubBg]}
					>
						<Text style={[styles.btn, style.btnSubColor, { fontSize: style.baseFontSize * 1.125 }]}>关闭</Text>
					</TouchableHighlight>
				</ModalBase>
				<Tips
					isShow={this.state.tipsIsShow}
					clear={this.state.tipTurnOff}
					text={this.state.tipsText}
					timer={2000}
					baseFontSize={style.baseFontSize}
					callState={() => {
						this.setState({
							tipsIsShow: false,
							tipTurnOff: false,
							tipsText: '',
							eggIndex: 0,
						});
					}}
				/>
			</View>
		);
	}
}

const setProps = (state) => {
	return {
	}
}

export default connect(setProps)(About);

const styles = StyleSheet.create({
	aboutBox: {
		justifyContent: 'space-between',
	},
	appInfo: {
		marginTop: 20,
		alignItems: 'center',
		paddingVertical: 12,
		backgroundColor: '#fff',
	},
	iconBox: {
		alignItems: 'center',
		marginTop: 36,
	},
	infoText: {
		paddingVertical: 2,
	},
	powerBox: {
		alignItems: 'center',
		marginBottom: 5,
	},
	poweredText: {
		color: '#999',
	},
	version: {
		color: '#999',
	},
	appName: {
		marginTop: 15,
	},
	listBox: {
		marginTop: 30,
		backgroundColor: '#fff',
	},
	border: {
		marginHorizontal: 10,
		height: 1,
		backgroundColor: '#eee',
	},
	listLine: {
		paddingHorizontal: 10,
		paddingVertical: 12,
	},
	listLineText: {
		color: '#333',
	},
	modalText: {
		paddingVertical: 3,
	},
	kumaIcon: {
		width: 50,
		height: 50,
	},
	btnBox: {
		alignItems: 'center',
		borderRadius: 3,
		borderWidth: 1,
	},
	btn: {
		lineHeight: 36,
	},
	eggPhotoBox: {
		marginBottom: 15,
	},
	eggPhoto: {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		borderRadius: 3,
		overlayColor: 'rgba(0, 0, 0, 0)',
	},
});
