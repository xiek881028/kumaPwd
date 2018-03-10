import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	SectionList,
	TouchableHighlight,
	Dimensions,
	Keyboard,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

import ListScrollFather from './ListScrollFather';

//Css
import style from '../css/common.js';

class ListItem extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.state.detailsDoubleClick = false;
	}
	_isMounted = false;
	callSetBtn() {
		this.props.callSetBtn && this.props.callSetBtn();
		!this._isMounted && this.setState({
			detailsDoubleClick: false,
		});
	}
	componentWillUnmount() {
		this._isMounted = true;
	}
	renderSearch(str, styles = {}, key) {
		if (!key) {
			return (
				<Text
					{...styles}
				>
					{str}
				</Text>
			);
		} else {
			let items = [];
			let split = str.split(key);
			for (let i = 0, max = split.length; i < max; i++) {
				split[i] != '' && items.push(split[i]);
				i != max - 1 && items.push(
					<Text key={i} style={{ color: '#c00' }}>{key}</Text>
				);
			}
			return (
				<Text
					{...styles}
				>
					{items}
				</Text>
			);
		}
	}
	render() {
		return (
			<TouchableHighlight
				onPress={() => {
					Keyboard.dismiss();
					!this.state.detailsDoubleClick && this.props.navigation.navigate('details', {
						callSetBtn: this.callSetBtn.bind(this),
						item: this.props.item,
					});
					this.setState({
						detailsDoubleClick: true,
					});
				}}
				underlayColor='#d9d9d9'
			>
				<View style={styles.box}>
					{this.renderSearch(this.props.item.name, { style: [styles.item, { fontSize: this.props.baseFontSize }], numberOfLines: 1 }, this.props.searchKey)}
					{this.props.isSearch ?
						this.renderSearch(this.props.item.account, { style: [styles.account, { fontSize: this.props.baseFontSize }], numberOfLines: 1 }, this.props.searchKey)
						: null
					}
				</View>
			</TouchableHighlight>
		);
	}
}

class ListItemHead extends Component {
	render() {
		return (
			<View style={styles.headBox}>
				{this.props.section.key == 'like' ?
					<FontAwesome
						style={[styles.headItem, { fontSize: this.props.baseFontSize * .7 }]}
						name='star'
					/>
					:
					<Text style={[styles.headItem, { fontSize: this.props.baseFontSize * .7 }]}>{this.props.section.key}</Text>
				}
			</View>
		);
	}
}

export default class List extends Component {
	constructor(props) {
		super(props);
		let _winHeight = Dimensions.get('window').height;
		this.state = {
			layoutHeight: Dimensions.get('window').height - 56 - 20,
			catchShu: null,
			catchHeng: null,
			_winHeight,
		};
	}
	offsetArray = [];
	scrollTo(index = 0) {
		this.refs.sectionList.scrollToLocation({
			itemIndex: 0,
			sectionIndex: index,
			viewOffset: this.offsetArray[index],
			animated: false,
		});
	}
	findArrIndex(val, arr) {
		for (let i = 0, max = arr.length; i < max; i++) {
			if (val == arr[i]) {
				return i;
			}
		}
		return null;
	}
	getNowIndex(index) {
		let _index = this.findArrIndex(index, this.ListArr);
		_index != null && this.scrollTo(_index);
	}
	componentDidUpdate() {
		this.mathOffsetArray();
	}
	mathOffsetArray() {
		this.offsetArray = [];
		this.ListArr = [];
		Object.keys(this.props.sections).map((item) => {
			this.ListArr[item] = this.props.sections[item].key;
			if (item == 0) {
				this.offsetArray.push(60);
			} else if (item == 1) {
				this.offsetArray.push(130 - (this.props.sections[item - 1].data.length * 10));
			} else {
				let _length = this.props.sections[item - 1].data.length;
				this.offsetArray.push(this.offsetArray[item - 1] + 77 - (_length * (9 + _length * .1)));
			}
		});
	}
	componentDidMount() {
		this.mathOffsetArray();
	}
	Listempty() {
		if (!!this.props.isSearch) {
			if (this.props.isSearchEmpty) {
				return (
					<View style={styles.searchEmptyBox}>
						<Text style={[styles.searchEmptyTxt, { fontSize: this.props.baseFontSize }]}>搜索不到相关结果</Text>
					</View>
				);
			} else {
				return (
					<View style={styles.searchEmptyBox}>
						<Text style={[styles.searchEmptyTxt, { fontSize: this.props.baseFontSize }]}>搜索关键词可以是名称或账号</Text>
					</View>
				);
			}
		} else {
			return (
				<View style={[styles.emptyBox, { height: this.state.layoutHeight }]}>
					<Text style={[styles.emptyYan, { fontSize: this.props.baseFontSize * .9 }]}>(｡・`ω´･)</Text>
					<Text style={[styles.emptyTxt, { fontSize: this.props.baseFontSize * 1.2 }]}>万事皆空</Text>
				</View>
			);
		}
	}
	render() {
		return (
			<View
				style={style.absoluteBox}
			>
				<SectionList
					style={styles.list}
					keyboardDismissMode='on-drag'
					keyboardShouldPersistTaps='handled'
					renderItem={({ item, index }) => {
						return <ListItem
							item={item}
							index={index}
							navigation={this.props.navigation}
							callSetBtn={this.props.callSetBtn}
							isSearch={!!this.props.isSearch}
							searchKey={this.props.searchKey}
							baseFontSize={this.props.baseFontSize}
						/>
					}}
					renderSectionHeader={({ section }) => <ListItemHead section={section} baseFontSize={this.props.baseFontSize} />}
					ItemSeparatorComponent={() => <View style={styles.border}></View>}
					ListEmptyComponent={this.Listempty.bind(this)}
					initialNumToRender={50}
					ref='sectionList'
					keyExtractor={(item, index) => {
						return index;
					}}
					//-20以后在首次添加账号时会出现高度错乱的bug 但-20目前效果很好 所以暂时不修复
					// onLayout={this.mathHeight.bind(this)}
					sections={this.props.sections}
					stickySectionHeadersEnabled={true}
					getItemLayout={(data, index) => {
						//此偏移量与侧边定位有关联 慎改
						return ({
							length: 50,
							offset: (50 + 1) * index,
							index,
						});
					}}
					ListFooterComponent={() => {
						return (
							this.props.sections.length ?
								<View style={styles.bottomPad}>
									<Text
										style={[styles.bottomPadText, { fontSize: this.props.baseFontSize * .9 }]}
									>我是有底线的</Text>
									<View
										style={styles.bottomPadBorder}
									></View>
								</View>
								: null
						);
					}}
				></SectionList>
				{
					this.props.sections.length ?
						<ListScrollFather
							getNowIndex={this.getNowIndex.bind(this)}
							appHeight={this.state.layoutHeight}
						/>
						: null
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	box: {
		flexDirection: 'row',
		height: 60,
		backgroundColor: '#fff',
	},
	item: {
		textAlignVertical: 'center',
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
		height: 24,
		paddingHorizontal: 15,
		color: '#888',
	},
	list: {
		backgroundColor: '#ebebeb',
	},
	border: {
		marginHorizontal: 10,
		height: 1,
		backgroundColor: '#eee',
	},
	emptyBox: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	searchEmptyBox: {
		alignItems: 'center',
	},
	searchEmptyTxt: {
		marginTop: 15,
		marginHorizontal: 20,
		color: '#999',
	},
	emptyYan: {
		color: '#333',
		marginBottom: 10,
		marginHorizontal: 10,
	},
	emptyTxt: {
		color: '#333',
		marginHorizontal: 10,
	},
	bottomPad: {
		alignItems: 'center',
	},
	bottomPadText: {
		lineHeight: 40,
		paddingTop: 10,
		paddingHorizontal: 10,
		zIndex: 2,
		backgroundColor: '#ebebeb',
	},
	bottomPadBorder: {
		height: 1,
		backgroundColor: '#999',
		position: 'absolute',
		top: 30,
		left: 25,
		right: 25,
	},
});