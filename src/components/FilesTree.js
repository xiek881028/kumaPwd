import React, { useState, useEffect, useContext } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ScrollView,
	PermissionsAndroid,
} from 'react-native';
import { CtxTheme } from './context';
import Button from './button';
import {
	checkPermissionAndroid,
} from '../helper';

export default ({ permissionCb, paths, onClick, ignorePermission, title='当前路径：' }) => {
	const { fontSize, backgroundColor } = useContext(CtxTheme);
	const [hasPermission, setHasPermission] = useState(null);
	useEffect(() => {
		hasPermission === null && !ignorePermission && (async () => {
			const permission = await checkPermissionAndroid([
				PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
			]);
			setHasPermission(permission);
			(permissionCb ?? (() => { }))(permission);
		})();
	}, [hasPermission]);
	return paths.fileTree === undefined || (hasPermission === null && !ignorePermission) ? null : (
		<View style={styles.fileTreeBox}>
			<View style={styles.pathBox}>
				<Text
					style={[styles.pathText, { fontSize: fontSize * .85 }]}
				>
					{title}
				</Text>
				<ScrollView
					horizontal={true}
					showsHorizontalScrollIndicator={false}
				>
					<Text
						style={[styles.pathText, { fontSize: fontSize * .85 }]}
					>
						{paths.path}
					</Text>
				</ScrollView>
			</View>
			<FlatList
				data={paths.fileTree}
				style={styles.list}
				// legacyImplementation={true}
				// enableEmptySections={true}
				ItemSeparatorComponent={() => <View style={styles.border}></View>}
				ListEmptyComponent={() => {
					return (
						<View style={styles.emptyBox}>
							<Feather
								name="folder"
								style={[styles.emptyIcon, { fontSize: fontSize * 2 }]}
							/>
							<Text
								style={[styles.emptyText, { fontSize }]}
							>没有文件</Text>
						</View>
					);
				}}
				renderItem={({ item, index }) => {
					return (
						<Button
							mode='android'
							onPress={async () => {
								(onClick ?? (() => { }))({ ...item, parentPath: paths.path });
							}}
							disabled={!!item.disabled}
							androidColor={backgroundColor}
							underlayColor='#d9d9d9'
							style={styles.itemTouchBox}
						>
							<View style={styles.itemBox}>
								<FontAwesome
									name={item.mode == 'folder' ? 'folder' : 'file'}
									style={[styles.fileIcon, { fontSize: fontSize * 2, color: item.mode == 'folder' ? '#fcba48' : '#a3b8cb' }]}
								/>
								<View style={styles.itemFileBox}>
									<Text
										style={[styles.itemFileName, { fontSize }]}
										numberOfLines={2}
									>{item.name}</Text>
									<Text
										style={[styles.timeText, { fontSize: fontSize * .8 }]}
									>{item.lastTime}</Text>
								</View>
								{
									item.mode == 'folder' ?
										<Feather
											name='chevron-right'
											style={[styles.icon, { fontSize }]}
										/>
										: <Text style={styles.icon}></Text>
								}
							</View>
						</Button>
					);
				}}
				keyExtractor={(item, index) => {
					return index.toString();
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
};

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
	timeText: {
		color: '#888',
	},
});
