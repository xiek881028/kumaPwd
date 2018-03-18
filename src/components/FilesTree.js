import React, { Component } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
	StyleSheet,
	Text,
	TouchableHighlight,
	BackHandler,
	View,
	FlatList,
	ScrollView,
	AppState,
} from 'react-native';

import {
	mkdirInit,
	fileIsExists,
} from '../assets/appCommonFn';

//android文件树获取组件
//android独有
import FilesAndroid from '../NativeModules/FilesAndroid';

export default class FilesTree extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rootPath: FilesAndroid.ROOT_PATH,
			parentPath: FilesAndroid.ROOT_PATH,
			path: FilesAndroid.ROOT_PATH,
		};
	}
	// tempJson = {};
	getFileTree = (path = '/storage/emulated/0', cb=()=>{}) => {
		// if(this.tempJson[path] == undefined){
		FilesAndroid.getFilesTree(path, (d) => {
			let _arr = [];
			if (d.flag) {
				// let homePath = path == `${this.state.rootPath}/kumaPwd`;
				for (let i = 0, max = d.sort.length; i < max; i++) {
					if (d.data[d.sort[i]].name.indexOf('.') != 0) {
						_arr.push(d.data[d.sort[i]]);
					}
				}
				this.setState({
					fileTree: _arr,
					parentPath: d.prev,
					path,
				}, cb());
				if(!_arr.length){
					console.log('is empty');
					this.props.emptyCb && this.props.emptyCb();
				}
				// this.tempJson[path] = {
				// 	parentPath: d.prev,
				// 	data: _arr,
				// };
			} else {
				if (d.message == 'is file') {
					console.log(d.message);
					this.props.fileCb && this.props.fileCb({path, ...d});
				}
			}
		});
		// }else{
		// 	this.setState({
		// 		fileTree: this.tempJson[path].data,
		// 		parentPath: this.tempJson[path].parentPath,
		// 	});
		// }
	}
	btnGoBack = () => {
		// if (!this.state.parentPath.length) {
			console.log('back');
			this.props.navigation.goBack();
		// } else {
		// 	this.props.isRoot(this.state.parentPath == this.state.rootPath);
		// 	this.getFileTree(this.state.parentPath);
		// }
		return true;
	}
	componentWillMount() {
		fileIsExists(`${FilesAndroid.ROOT_PATH}/kumaPwd/beifen`)
		.then(d=>{
			if(d.flag){
				if(d.flag && d.data){
					this.getFileTree(`${FilesAndroid.ROOT_PATH}/kumaPwd/beifen`);
					this.props.isRoot && this.props.isRoot(false);
				}else{
					mkdirInit()
					.then(_d=>{
						if(!_d.flag || (_d.flag && !_d.data)){
							this.getFileTree(FilesAndroid.ROOT_PATH);
							this.props.isRoot && this.props.isRoot(true);
						}else{
							this.getFileTree(`${FilesAndroid.ROOT_PATH}/kumaPwd/beifen`);
							this.props.isRoot && this.props.isRoot(false);
						}
					});
				}
			}
		})
		;
		BackHandler.addEventListener('hardwareBackPress', this.btnGoBack);
		AppState.addEventListener('change', this.appStateChange);
	}
	componentWillUnmount() {
		console.log('销毁fileTree');
		BackHandler.removeEventListener('hardwareBackPress', this.btnGoBack);
		AppState.removeEventListener('change', this.appStateChange);
	}
	appStateChange = ()=>{
		if(AppState.currentState == 'active'){
			this.getFileTree(this.state.path);
		};
	}
	shouldComponentUpdate(prop, state){
		return this.state != state;
	}
	render() {
		if (this.props.baseFontSize == null || this.state.fileTree == undefined) return null;
		return (
			<View style={styles.fileTreeBox}>
				<View style={styles.pathBox}>
					<Text
						style={[styles.pathText, { fontSize: this.props.baseFontSize * .85 }]}
					>
						当前路径：
					</Text>
					<ScrollView
						horizontal={true}
						showsHorizontalScrollIndicator={false}
					>
						<Text
							style={[styles.pathText, { fontSize: this.props.baseFontSize * .85 }]}
						>
							{this.state.path}
						</Text>
					</ScrollView>
				</View>
				<FlatList
					data={this.state.fileTree}
					style={styles.list}
					// legacyImplementation={true}
					// enableEmptySections={true}
					ItemSeparatorComponent={() => <View style={styles.border}></View>}
					ListEmptyComponent={() => {
						return (
							<View style={styles.emptyBox}>
								<Feather
									name="folder"
									style={[styles.emptyIcon, {fontSize: this.props.baseFontSize * 2}]}
								/>
								<Text
									style={[styles.emptyText, {fontSize: this.props.baseFontSize}]}
								>没有文件</Text>
							</View>
						);
					}}
					renderItem={({ item, index }) => {
						return (
							<TouchableHighlight
								onPress={() => {
									this.getFileTree(item.path, ()=>{
										this.props.isRoot(item.path == this.state.rootPath);
									});
								}}
								underlayColor='#d9d9d9'
								style={styles.itemTouchBox}
							>
								<View style={styles.itemBox}>
									<FontAwesome
										name={item.mode == 'folder' ? 'folder' : 'file'}
										style={[styles.fileIcon, { fontSize: this.props.baseFontSize * 2, color: item.mode == 'folder' ? '#fcba48' : '#a3b8cb' }]}
									/>
									<View style={styles.itemFileBox}>
										<Text
											style={[styles.itemFileName, { fontSize: this.props.baseFontSize }]}
											numberOfLines={2}
										>{item.name}</Text>
										<Text
											style={{ fontSize: this.props.baseFontSize * .8 }}
										>{item.lastTime}</Text>
									</View>
									{
										item.mode == 'folder' ?
											<Feather
												name='chevron-right'
												style={[styles.icon, { fontSize: this.props.baseFontSize }]}
											/>
											: <Text style={styles.icon}></Text>
									}
								</View>
							</TouchableHighlight>
						);
					}}
					keyExtractor={(item, index) => {
						return index;
					}}
					getItemLayout={(data, index) => {
						return ({
							length: 50,
							offset: (60) * index,
							index,
						});
					}}
					initialNumToRender={50}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	fileTreeBox: {
		backgroundColor: '#fff',
		flex: 1,
	},
	itemTouchBox: {
		backgroundColor: '#fff',
	},
	list: {
		flex: 1,
	},
	itemBox: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		minHeight: 60,
		alignItems: 'center',
		paddingHorizontal: 10,
	},
	border: {
		marginHorizontal: 10,
		height: 1,
		backgroundColor: '#eee',
	},
	itemFileBox: {
		flex: 1,
	},
	itemFileName: {
		color: '#333',
	},
	icon: {
		textAlignVertical: 'center',
		paddingRight: 5,
		paddingLeft: 20,
		color: '#ccc',
		minWidth: 35,
		minHeight: 20,
	},
	fileIcon: {
		marginRight: 20,
	},
	pathBox: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#d9d9d9',
	},
	pathText: {
		color: '#666',
	},
	emptyBox: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: '10%',
	},
	emptyIcon: {
		marginBottom: 10,
		color: '#999',
	},
	emptyText: {
		color: '#999',
	},
});
