import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View
} from 'react-native';
import { connect } from 'react-redux';

import { loginState } from '../assets/appCommonFn';

//Css
import style from '../css/common.js';

import InputView from '../components/InputView';
import List from '../components/List.js';

class Config extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchArr: [],
			isSearchEmpty: false,
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
		});
		this.props.navigation.setParams({
			_this: this,
		});
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
	}
	componentWillUnmount() {
		console.log('销毁search');
		this.searchDelay && clearTimeout(this.searchDelay);
		this.props.navigation.state.params && this.props.navigation.state.params.callSetBtn && this.props.navigation.state.params.callSetBtn();
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
	}
	toSearchArr(text = '', arr = this.props.account.data) {
		if (!text.length) {
			this.setState({
				searchArr: [],
				isSearchEmpty: false,
			});
			return;
		}
		let ghostArr = [];
		let index = 0;
		for (let i = 0, max = arr.length; i < max; i++) {
			if(arr[i].key == 'like')continue;
			ghostArr.push({
				key: arr[i].key,
				data: [],
			});
			for (let j = 0, max2 = arr[i].data.length; j < max2; j++) {
				let data = arr[i].data[j];
				if (data.name.indexOf(text) != -1 || data.account.indexOf(text) != -1) {
					ghostArr[index].data.push(data);
				}
			}
			if (!ghostArr[ghostArr.length - 1].data.length) {
				ghostArr.splice(index, 1);
			}
			index = ghostArr.length;
		}
		let setJson = { searchArr: ghostArr };
		if (!ghostArr.length) setJson.isSearchEmpty = true;
		this.setState(setJson);
	}
	searchDelay;
	getText(text) {
		clearTimeout(this.searchDelay);
		this.searchDelay = setTimeout(() => {
			this.setState({
				searchKey: text,
			}, () => {
				this.toSearchArr(text);
			});
		}, 300);
	}
	componentWillReceiveProps(props) {
		this.toSearchArr(this.state.searchKey, props.account.data);
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		headerTitle: (() => {
			let _this = navigation.state.params._this;
			if (!_this) return null;
			return (
				<View
					style={[style.absoluteBox, styles.headerSearchBox]}
				>
					<View style={styles.headerSearchInputBox}>
						<InputView
							placeholder='搜索'
							autoFocus={true}
							fontSize={style.baseFontSize}
							getText={(text) => {
								_this.getText(text);
							}}
						/>
					</View>
				</View>
			);
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
	render() {
		// let sections = [
		// 		{key: 'A', data: [
		// 			{account: 'tjvhj', id: "cb8df2c0-0c98-11e8-bd79-c7b92b886400", name: "acFun", pinyin: "A", pwd: "U2FsdGVkX19HE260UyMhdvvhTaDWzipvzg3j4vqpUoY=", star: false, type: "EDIT_ACCOUNT_LIST"},
		// 		]},
		// 	];
		if (!this.state.readly) return null;
		return (
			<View style={style.container}>
				<List
					// sections={sections}
					sections={this.state.searchArr}
					navigation={this.props.navigation}
					isSearch={true}
					isSearchEmpty={this.state.isSearchEmpty}
					searchKey={this.state.searchKey}
					baseFontSize={style.baseFontSize}
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

export default connect(setProps)(Config);

const styles = StyleSheet.create({
	headerSearchBox: {
		// backgroundColor: '#c00',
		flexDirection: 'row',
		// justifyContent: 'center',
		alignItems: 'center',
	},
	headerSearchInputBox: {
		marginRight: 30,
		flex: 1,
	}
});
