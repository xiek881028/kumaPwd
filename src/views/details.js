import React, { Component } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	FlatList,
	ScrollView,
	Clipboard,
} from 'react-native';

import { connect } from 'react-redux';
import {
	delAccountList,
	searchAccountById,
	accountToTop,
} from '../actions';
import {
	loginState,
	getPwd,
} from '../assets/appCommonFn';

//Css
import style from '../css/common.js';

//加密组件 crypto-js
import CryptoJS from 'crypto-js';

import Tips from '../components/Tips';
import ModalBase from '../components/ModalBase';

class DetailsItem extends Component {
	constructor(props) {
		super(props);
		this.state = { ...props };
	}
	render() {
		return this.props.item.value.length ? (
			<TouchableHighlight
				underlayColor='#d9d9d9'
				onPress={() => {
					this.props.copyStr(this.props.item.value, `${this.props.item.key}复制成功`);
				}}
			>
				<View
					style={styles.tipsLine}
				>
					<View style={styles.LineHead}>
						<Text style={[styles.tipsLineLabel, { fontSize: style.baseFontSize }]}>{this.props.item.key}：</Text>
						<Text
							style={[styles.copy, { fontSize: style.baseFontSize * .9 }]}
						>点我复制{this.props.item.key}</Text>
					</View>
					<Text style={[styles.tipsLineVal, { fontSize: style.baseFontSize * 1.2 }]}>{this.props.item.value}</Text>
				</View>
			</TouchableHighlight>
		)
		: null;
	}
}

class Deatils extends Component {
	constructor(props) {
		super(props);
		this.state = {
			...props,
			data: props.navigation.state.params.item,
			copyModalIsShow: false,
			copyModalTxt: '',
			editDoubleClick: false,
			readly: false,
		};
		this.props.dispatch(searchAccountById(this.state.data.id, this.state.data.pinyin));
		// this.props.data.data && Object.keys(this.props.data.data).map((item)=>{
		// 	console.log(item);
		// });
		// this.state.star = this.props.data.star;
	}
	btnGoBack = () => {
		this.props.navigation.goBack();
		return true;
	}
	async componentWillMount() {
		let readly = await loginState(this.props);
		this.setState({
			readly,
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁details');
		let urlData = this.state.data;
		let sqlData = this.props.accountDetails.returnData;
		this._isMounted = true;
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			return '账号详情';
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
	delAccount() {
		this.refs.modal.setModal(true);
		this.setState({
			overDel: true,
		});
		//redux
		this.props.dispatch(delAccountList(this.props.accountDetails.returnData.id, this.props.accountDetails.returnData.pinyin));
		this.props.navigation.goBack();
	}
	pruneStr(str, length) {
		if (str.length <= length) {
			return str;
		} else {
			return `${str.substr(0, length)}...`;
		}
	}
	timeout;
	copyStr(str, text = '') {
		Clipboard.setString(str);
		this.setState({
			copyModalIsShow: true,
			copyModalTxt: text,
		});
	}
	_isMounted = false;
	callSetBtn() {
		!this._isMounted && this.setState({
			editDoubleClick: false,
		});
	}
	render() {
		if (!this.state.readly || !this.props.accountDetails.returnData.id || this.state.data.id != this.props.accountDetails.returnData.id) return null;
		const { navigate } = this.props.navigation;
		let data = this.props.accountDetails.returnData;
		let _data = [];
		_data.push({
			key: '账号',
			value: data.account || '',
		});
		_data.push({
			key: '密码',
			value: CryptoJS.AES.decrypt(data.pwd, getPwd()).toString(CryptoJS.enc.Utf8) || '',
		});
		return (
			<View
				style={style.absoluteBox}
			>
				<ScrollView style={style.container}>
					<View style={[styles.contentBox, styles.topContent]}>
						<View style={styles.detailsTitle}>
							<Text style={[styles.detailsTitleText, { fontSize: style.baseFontSize * 1.8 }]}>
								{data.name}
							</Text>
						</View>
						<FlatList
							renderItem={({ item, index }) => <DetailsItem
								item={item}
								index={index}
								copyStr={this.copyStr.bind(this)}
								baseFontSize={style.baseFontSize}
							/>}
							keyExtractor={(item, index) => {
								return index.toString();
							}}
							ItemSeparatorComponent={() => <View style={styles.detailsBorder}></View>}
							data={_data}
						/>
					</View>
					<TouchableHighlight
						style={styles.contentBox}
						underlayColor='#d9d9d9'
						onPress={() => {
							this.props.dispatch(accountToTop(data.id, data.pinyin));
						}}
					>
						<View style={styles.collection}>
							<View
								style={styles.collectionTxtBox}
							>
								<Text style={[styles.collectionTitle, { fontSize: style.baseFontSize }]}>{data.star ? '已收藏' : '收藏'}</Text>
								<Text style={[styles.collectionCaption, { fontSize: style.baseFontSize * .8 }]}>收藏的账号会在列表中置顶显示</Text>
							</View>
							<FontAwesome
								name={data.star ? 'star' : 'star-o'}
								style={[styles.collectionIcon, { fontSize: style.baseFontSize * 1.6 }]}
							/>
						</View>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => {
							!this.state.editDoubleClick && navigate('editAcount', {
								callSetBtn: this.callSetBtn.bind(this),
								mode: 'edit',
								data,
							});
							this.setState({
								editDoubleClick: true,
							});
						}}
						underlayColor={style.btnHeightBg.backgroundColor}
						style={[styles.btnBox, style.btnBg]}
					>
						<Text style={[styles.btn, style.btnColor, { fontSize: style.baseFontSize * 1.125 }]}>编辑</Text>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => {
							this.refs.modal.setModal(true);
						}}
						underlayColor={style.btnSubHeightBg.backgroundColor}
						style={[styles.btnBox, style.btnSubBg]}
					>
						<Text style={[styles.btn, style.btnSubColor, { fontSize: style.baseFontSize * 1.125 }]}>删除</Text>
					</TouchableHighlight>
				</ScrollView>
				<ModalBase
					ref='modal'
					visible={false}
				>
					<View
						style={style.modalBox}
					>
						<Text style={[style.modalTitle, { fontSize: style.baseFontSize * 1.2 }]}>删除账号</Text>
						<ScrollView contentContainerStyle={[style.modalContent]}>
							<Text style={[{ fontSize: style.baseFontSize }]}>{`账号删除后将无法找回，确定要删除“${this.pruneStr(data.name, 10)}”吗？`}</Text>
						</ScrollView>
						<View style={style.modalFooter}>
							<TouchableHighlight
								style={[style.modalFooterBtnbox, style.btnSubBg]}
								underlayColor={style.btnSubHeightBg.backgroundColor}
								onPress={() => {
									this.refs.modal.setModal(false);
								}}
							>
								<Text
									style={[style.modalFooterBtn, style.btnSubColor, { fontSize: style.baseFontSize }]}
								>取消</Text>
							</TouchableHighlight>
							<TouchableHighlight
								style={[style.modalFooterBtnbox, styles.delFooterBtnRightbox]}
								underlayColor='#CE3C39'
								onPress={this.delAccount.bind(this)}
							>
								<Text
									style={[style.modalFooterBtn, styles.delFooterBtnRight, { fontSize: style.baseFontSize }]}
								>删除</Text>
							</TouchableHighlight>
						</View>
					</View>
				</ModalBase>
				<Tips
					isShow={this.state.copyModalIsShow}
					text={this.state.copyModalTxt}
					timer={2500}
					baseFontSize={style.baseFontSize}
					callState={(state) => {
						this.setState({
							copyModalIsShow: false,
							copyModalTxt: '',
						});
					}}
				/>
			</View>
		);
	}
}

const setProps = (state) => {
	return {
		accountDetails: state.SearchAccountById,
	}
}

export default connect(setProps)(Deatils);

const styles = StyleSheet.create({
	contentBox: {
		backgroundColor: '#fff',
		marginHorizontal: 10,
		marginBottom: 15,
		paddingHorizontal: 10,
		borderRadius: 3,
	},
	collection: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingVertical: 10,
	},
	collectionTxtBox: {
		flex: 1,
		marginRight: 10,
		paddingLeft: 10,
	},
	collectionTitle: {
		paddingBottom: 5,
		color: '#353535',
	},
	collectionCaption: {
		color: '#999',
	},
	collectionIcon: {
		paddingRight: 10,
		color: '#ec971f',
	},
	topContent: {
		marginTop: 15,
		paddingTop: 15,
	},
	detailsTitle: {
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
	detailsBorder: {
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	tipsLine: {
		// flexDirection: 'row',
		padding: 10,
	},
	tipsLineLabel: {
		color: '#353535',
		paddingRight: 5,
	},
	tipsLineVal: {
		color: '#888',
		flex: 1,
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
	btnBox: {
		marginHorizontal: 10,
		marginBottom: 16,
		alignItems: 'center',
		borderRadius: 3,
		borderWidth: 1,
	},
	// btnSuccess: {
	// 	backgroundColor: '#1AAD19',
	// 	borderColor: '#179B16',
	// },
	btn: {
		lineHeight: 46,
	},
	delFooterBtnRightbox: {
		backgroundColor: '#E64340',
		borderTopColor: '#CE3C39',
	},
	delFooterBtnRight: {
		color: '#fff',
	},
});
