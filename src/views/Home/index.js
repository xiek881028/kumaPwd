import React, { useState, useEffect, useContext, useCallback } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import {
	View,
	PermissionsAndroid,
	StyleSheet,
	Text,
	Keyboard,
	Image,
} from 'react-native';
import {
	getAutoBackupFlag,
	initMkdir,
	getTimerFileName,
	checkPermissionAndroid,
	checkAndRequestPermissionAndroid,
	setStorage,
	getStorage,
	delStorage,
	getAsyncTips,
	getWebdavFlag,
} from '../../helper';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import { title } from '../../config';
import { encrypt, decrypt } from '../../helper/crypto';
import FilesAndroid from '../../NativeModules/FilesAndroid';
import List from '../../components/list.js';
import ModalAutoBackup from './component/modalAutoBackup';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import style from '../../css/common.js';
import ModalDownload from './component/modalDownload';
import ModalUpload from './component/modalUpload';
import ModalDiffCheck from './component/modalDiffCheck';

export default observer(props => {
	const { navigation, route } = props;
	const { navigate } = navigation;
	const { fontSize, backgroundColor } = useContext(CTX_THEME);
	const { setLoadingFn } = useContext(CTX_LOADING);
	const { cls, list, setListFn, setTagFn } = useContext(CTX_LIST);
	const { flag: eggFlag } = useContext(CTX_EGG);
	const { pwd } = useContext(CTX_USER);
	const { setTipsFn } = useContext(CTX_TIPS);
	const { cls: webdavCls, fastEntry, webdavFlag, comp, backup2Json, asyncHistory } = useContext(CTX_WEBDAV);
	const [homeList, setHomeList] = useState([]);
	const [modalFlag, setModalFlag] = useState(false);
	const [downloadModalFlag, setDownloadModalFlag] = useState(false);
	const [uploadModalFlag, setUploadModalFlag] = useState(false);
	const [diffCheckModalFlag, setDiffCheckModalFlag] = useState(false);
	const [changeData, setChangeData] = useState({ data: {} });
	const [asyncReady, setAsyncReady] = useState(false);
	// 列表初始化
	useEffect(() => {
		list && (async () => {
			const _list = toJS(list);
			const opsObj = {
				key: '__options',
				data: [],
			};
			opsObj.data.push({
				name: '标签',
				icon: (
					<View style={[styles.opsIconWrap, { width: fontSize * 2, height: fontSize * 2, backgroundColor: '#f1c40f' }]}>
						<Feather
							name='tag'
							style={[styles.opsIcon, { fontSize: fontSize * 1.2 }]}
						/>
					</View>
				),
				onPress: () => {
					navigate('TagSearch');
				},
			});
			if (asyncReady) {
				opsObj.data.push({
					name: '备份',
					icon: (
						<View style={[styles.opsIconWrap, { width: fontSize * 2, height: fontSize * 2, backgroundColor: '#308fdf' }]}>
							<Feather
								name='upload-cloud'
								style={[styles.opsIcon, { fontSize: fontSize * 1.2 }]}
							/>
						</View>
					),
					onPress: () => setUploadModalFlag(true),
				}, {
					name: '同步',
					icon: (
						<View style={[styles.opsIconWrap, { width: fontSize * 2, height: fontSize * 2, backgroundColor: '#ff5053' }]}>
							<Feather
								name='download-cloud'
								style={[styles.opsIcon, { fontSize: fontSize * 1.2 }]}
							/>
						</View>
					),
					onPress: () => setDownloadModalFlag(true),
				});
			}
			_list.length && _list.unshift(opsObj);
			setHomeList(_list);
		})();
	}, [list, asyncReady]);
	// 因为账号列表更新昂贵，精确判断减少不必要的渲染
	useEffect(() => {
		const ready = !!(webdavFlag && comp && fastEntry && !backup2Json);
		asyncReady !== ready && setAsyncReady(ready);
	}, [comp, webdavFlag, fastEntry, backup2Json]);
	// 未同步提醒
	useEffect(() => {
		cls !== undefined && (async () => {
			const flag = await getWebdavFlag();
			const asyncTips = await getAsyncTips();
			if(flag && asyncTips && !backup2Json) {
				const { flag: hasChange, ...other } = await cls.getAllChange();
				if (hasChange) {
					setDiffCheckModalFlag(true);
					setChangeData(other);
				}
			}
		})();
	}, [cls]);
	// 自动备份
	useEffect(() => {
		cls !== undefined && (async () => {
			const backupFlag = await getAutoBackupFlag();
			const todaySave = (await getStorage('todayIsSave')) ?? 0;
			const todayFlag = +(moment().format('YYYYMMDD')) > +todaySave;
			if (backupFlag && todayFlag) {
				const hasPermission = await checkPermissionAndroid([
					PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				]);
				setModalFlag(backupFlag && hasPermission === false);
				if (backupFlag && hasPermission && todayFlag) {
					autoSave();
				}
			}
		})();
	}, [cls]);
	// 顶部title
	useEffect(() => {
		const ops = ({
			headerTitle: '',
			headerLeft: () => {
				return (
					<View style={[styles.eggIconWrap]}>
						<Image
							source={require('../../images/egg-home-title.png')}
							style={styles.kumaIcon}
						/>
					</View>
				);
			},
			headerRight: () => {
				return (
					<View
						style={style.headerRightBox}
					>
						<Button
							mode='android'
							androidColor='#999'
							borderless={true}
							rippleRadius={16}
							style={styles.headerBtn}
							onPress={() => {
								navigate('Search');
							}}
						>
							<Feather
								name="search"
								size={20}
								color={style.headerTitleIcon.color}
							/>
						</Button>
						<Button
							mode='android'
							androidColor='#999'
							borderless={true}
							rippleRadius={16}
							style={styles.headerBtn}
							onPress={() => {
								navigate('Config');
							}}
						>
							<Entypo
								name="dots-three-vertical"
								size={20}
								color={style.headerTitleIcon.color}
							/>
						</Button>
					</View>
				);
			},
		});
		if (!eggFlag) {
			ops.headerTitle = (<Text>{title[route.name]}</Text>),
				ops.headerLeft = undefined;
		}
		navigation.setOptions(ops);
	}, [eggFlag]);
	const autoSave = async () => {
		await initMkdir('beifen')
			.then(async ({ saveFile }) => {
				await cls.cleanTag();
				const list = await cls.getOriginList();
				const tags = await cls.getOriginTag();
				const exportObj = {};
				exportObj.accountList = list;
				exportObj.tags = tags;
				FilesAndroid.writeFile(saveFile, `/${getTimerFileName('自动备份')}.kuma`, encrypt(JSON.stringify(exportObj), pwd), true, async d => {
					await setStorage('todayIsSave', moment().format('YYYYMMDD'));
					setTipsFn('text', `自动备份${d.flag ? '成功' : '失败'}`);
				});
			}).catch(err => {
				setTipsFn('text', `自动备份失败`);
			});
	};
	const cloudSave = useCallback(async () => {
		if (webdavCls != undefined && cls != undefined) {
			setUploadModalFlag(false);
			setDiffCheckModalFlag(false);
			setLoadingFn(true, '正在备份...');
			try {
				const { homeDir } = webdavCls.getConfig();
				await cls.cleanTag();
				const list = await cls.getOriginList();
				const tags = await cls.getOriginTag();
				const exportObj = {};
				exportObj.accountList = list;
				exportObj.tags = tags;
				await webdavCls.upload(`${homeDir}/backup_latest.kuma`, encrypt(JSON.stringify(exportObj), pwd), backup2Json ? false : asyncHistory);
				await delStorage('accountChangeList');
				await delStorage('tagChangeList');
				await cls.initChangeLog();
				setTipsFn('text', '备份成功');
			} catch (error) {
				console.log('error: ', error);
				setTipsFn('text', '备份失败');
			}
			setLoadingFn(false, '');
		}
	}, [webdavCls, cls]);
	return (
		<BasePage>
			{list ? list.length ?
				(<List
					sections={homeList}
					options={true}
					onPress={({ data }) => {
						Keyboard.dismiss();
						navigation.navigate('Details', { id: data.id });
					}}
				/>) : (
					<View style={[styles.emptyBox]}>
						<Text style={[styles.emptyYan, { fontSize: fontSize * .9 }]}>(｡・`ω´･)</Text>
						<Text style={[styles.emptyTxt, { fontSize: fontSize * 1.2 }]}>万事皆空</Text>
					</View>
				) : null
			}
			<ModalAutoBackup
				visible={modalFlag}
				onClose={async flag => {
					let hasPermission = false;
					if (flag) {
						hasPermission = await checkAndRequestPermissionAndroid([
							PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
							PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
						]);
					}
					if (!flag || !hasPermission) {
						await setStorage('autoBackupFlag', false);
						await delStorage('todayIsSave');
						setTipsFn('text', '自动备份已关闭');
					} else if (flag && hasPermission) {
						autoSave();
					}
					setModalFlag(false);
				}}
			/>
			<View style={[styles.addBtnWrap]}>
				<Button
					mode='android'
					androidColor={backgroundColor}
					style={[styles.addBox, { backgroundColor }]}
					onPress={() => navigation.navigate('EditAcount')}
				>
					<Entypo
						name="plus"
						style={[styles.add, style.btnColor]}
					/>
				</Button>
			</View>
			<ModalDownload
				visible={downloadModalFlag}
				onClose={async flag => {
					setDownloadModalFlag(false);
					if (flag) {
						setLoadingFn(true, '正在同步...');
						try {
							const { homeDir } = webdavCls.getConfig();
							const res = await webdavCls.download(`${homeDir}/backup_latest.kuma`, { format: 'text' });
							const data = JSON.parse(decrypt(res, pwd));
							await cls.asyncData(data);
							setListFn(cls.viewList);
							setTagFn(cls.tagViewList);
							await delStorage('accountChangeList');
							await delStorage('tagChangeList');
							await cls.initChangeLog();
							setTipsFn('text', '同步成功');
						} catch (error) {
							setTipsFn('text', '同步失败');
						}
						setLoadingFn(false, '');
					}
				}}
			/>
			<ModalUpload
				visible={uploadModalFlag}
				onClose={async () => setUploadModalFlag(false)}
				onOk={cloudSave}
			/>
			<ModalDiffCheck
				visible={diffCheckModalFlag}
				data={changeData}
				onClose={async () => setDiffCheckModalFlag(false)}
				onOk={cloudSave}
			/>
		</BasePage>
	);
});

const styles = StyleSheet.create({
	headerBtn: {
		marginRight: 12,
		paddingHorizontal: 6,
		paddingVertical: 10,
		// backgroundColor: '#c00',
		// borderWidth: 1,
	},
	addBox: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addBtnWrap: {
		width: 56,
		height: 56,
		borderRadius: 28,
		position: 'absolute',
		right: 24,
		bottom: 24,
		elevation: 3,
		shadowOffset: { width: 3, height: 3 },
		shadowRadius: 5,
		shadowOpacity: .85,
		shadowColor: '#ddd',
		overflow: 'hidden',
	},
	add: {
		fontSize: 26,
	},
	emptyBox: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		backgroundColor: '#ebebeb',
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
	opsIconWrap: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6,
		marginRight: 10,
	},
	opsIcon: {
		color: '#fff',
	},
	eggIconWrap: {
		justifyContent: 'flex-end',
		alignItems: 'flex-start',
		height: '100%',
		width: 84,
	},
	kumaIcon: {
		height: '75%',
		resizeMode: 'contain',
		width: '100%',
	},
});
