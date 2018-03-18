import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
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

//Css
import style from '../css/common.js';

class About extends Component {
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
		if (this.props.baseFontSize == null || !this.state.readly) return null;
		return (
			<View
				style={[style.container, styles.aboutBox]}
			>
				<ScrollView>
					<View style={styles.iconBox}>
						<Image
							source={require('../images/Icon.png')}
							style={styles.kumaIcon}
						/>
						<Text
							style={[styles.appName, { fontSize: this.props.baseFontSize * 1.2 }]}
						>{APP_NAME}</Text>
						<Text
							style={[styles.version, { fontSize: this.props.baseFontSize * .9 }]}
						>{VERSION}</Text>
					</View>
					<View style={styles.listBox}>
						<TouchableHighlight
							style={styles.listLine}
							underlayColor={style.btnSubHeightBg.backgroundColor}
							onPress={()=>{
								this.refs.service.setModal(true);
							}}
						>
							<Text style={[styles.listLineText, { fontSize: this.props.baseFontSize }]}>免责声明</Text>
						</TouchableHighlight>
						<View style={styles.border}></View>
						<TouchableHighlight
							style={styles.listLine}
							underlayColor={style.btnSubHeightBg.backgroundColor}
							onPress={()=>{
								this.refs.saySomething.setModal(true);
							}}
						>
							<Text style={[styles.listLineText, { fontSize: this.props.baseFontSize }]}>作者的碎碎念</Text>
						</TouchableHighlight>
						<View style={styles.border}></View>
						<TouchableHighlight
							style={styles.listLine}
							underlayColor={style.btnSubHeightBg.backgroundColor}
							onPress={()=>{
								this.refs.thanks.setModal(true);
							}}
						>
							<Text style={[styles.listLineText, { fontSize: this.props.baseFontSize }]}>感谢</Text>
						</TouchableHighlight>
					</View>
					<View style={styles.appInfo}>
						<Text
							style={[styles.infoText, { fontSize: this.props.baseFontSize * .9 }]}
						>
							{APP_NAME}是一款账号记录工具
						</Text>
						<Text
							style={[styles.infoText, { fontSize: this.props.baseFontSize * .9 }]}
						>
							简单、安全、好用，是它的追求
						</Text>
					</View>
				</ScrollView>
				<View style={styles.powerBox}>
					<Text
						style={[styles.poweredText, { fontSize: this.props.baseFontSize * .9 }]}
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
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>免责声明</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>在使用《{APP_NAME}》前，请您务必仔细阅读并透彻理解本声明。您可以选择不使用《{APP_NAME}》，但如果您使用《{APP_NAME}》，您的使用行为将被视为对本声明全部内容的认可。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>您拥有《{APP_NAME}》的免费使用权。但不得对《{APP_NAME}》软件进行反向工程、反向汇编、反向编译。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>您应该对使用《{APP_NAME}》的结果自行承担风险。《{APP_NAME}》是作者学习制作的软件。由于作者技术水平有限，并且软件技术更新速度快，《{APP_NAME}》无法保证是完全安全的。在使用过程中发生的任何意外或损失，作者概不负责。但作者会努力采取积极的措施保护您帐号、密码的安全。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>本声明未涉及的问题请参见国家有关法律法规，当本声明与国家有关法律法规冲突时，以国家法律法规为准。</Text>
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
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
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
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>作者的碎碎念</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>终于有地方可以说两句闲话了。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>《{APP_NAME}》是一个很偶然的作品。因为已经有前人做出了一个叫《账号本子》的应用。它非常的优秀，很多功能也比《{APP_NAME}》更丰富。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>但是当我想推荐《账号本子》给我父母用时，我发现它的字太小了，父母年迈老眼昏花很难看清那么小的字。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>于是，就有了《{APP_NAME}》。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>由于作者是前端工程师（不会写java的渣渣），所以《{APP_NAME}》是基于react-native技术开发的应用程序。它相对于传统原生应用，运行速度与流畅性都有所降低，安装包体积也更大。所以打开应用时，会有1~3秒（视手机性能）的白屏时间，作者真的无能为力。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>当然，react-native也有它自己的优势，有兴趣的童鞋可以自行度娘。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>之后有时间作者会把源码整理开源到github上，大家可以去github.com/xiek881028上查看。作者十分欢迎有兴趣的童鞋一起讨论共同进步。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>作者自己也是第一次写react-native应用，一定会有非常多欠考虑的地方，所以还请大家多多包涵。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>如果在使用过程中遇到什么问题，或是发现了bug，或者有什么改进的意见和建议，都可以给作者发邮件。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>邮箱： xk285985285@qq.com</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>最后，希望您能喜欢《{APP_NAME}》。</Text>
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
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
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
						<Text style={[style.modalTitle, { fontSize: this.props.baseFontSize * 1.2 }]}>感谢</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>首先，感谢打开《{APP_NAME}》的您。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>感谢 谢武龙 童鞋在技术方面提供的帮助。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>感谢 Skeleton 童鞋在UI风格、产品逻辑、文案润色方面提供的帮助。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>感谢 Hyde 童鞋在产品逻辑方面提供的帮助。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>感谢 父母 做为产品体验师提出的宝贵意见。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>感谢 《账号本子》 给了本作品诸多灵感。</Text>
							<Text style={[styles.modalText, { fontSize: this.props.baseFontSize }]}>感谢 react-native、redux、WeUI、crypto-js等众多开源技术提供的技术支持。</Text>
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
									style={[style.btnSubColor, style.modalFooterBtn, { fontSize: this.props.baseFontSize }]}
								>关闭</Text>
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
});
