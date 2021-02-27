import React, { useState, useContext, useEffect, useRef } from 'react';
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import { observer } from 'mobx-react';
import cfg from '../../config';
import { setTheme } from '../../helper';
//Css
import style from '../../css/common.js';

export default observer(({ navigation }) => {
	const fontRate = [.875, 1, 1.25, 1.625];
	const { fontSize, backgroundColor, backgroundDarkColor, setThemeFn } = useContext(CTX_THEME);
  const submitOnoff = useRef(false);
	const mathValIndex = fontSize => {// 计算当前字号比数组索引
		let nowFontRate = fontSize / cfg.fontSize; // 字号比 = 当前字号 / 预设标准字号
		return fontRate.findIndex(item => nowFontRate === item);
	};
	const [settingFont, setSettingFont] = useState(fontSize);
	useEffect(() => {
		navigation.setOptions({
			headerTitleStyle: [style.headerTitleStyle, { marginHorizontal: 0, marginLeft: 0, paddingLeft: 0, fontSize: settingFont * 1.25 }],
			headerRight: () => {
				return (
					<Button
						mode='android'
						androidColor={backgroundColor}
						style={[style.headerRightBtnWrap, { backgroundColor }]}
						underlayColor={backgroundDarkColor}
						activeOpacity={.6}
						onPress={async () => {
							if (submitOnoff.current) return; // 防止重复提交
							submitOnoff.current = true;
							await setTheme('fontSize', settingFont);
							setThemeFn('fontSize', settingFont);
              navigation.navigate('Config');
						}}
					>
						<Text
							style={[style.headerRightBtnText, { fontSize: settingFont * 0.875 }]}
						>完成</Text>
					</Button>
				);
			},
		});
	}, [settingFont]);
	return (
		<BasePage>
			<View style={[style.container, styles.configEditFontBox]}>
				<ScrollView style={styles.scrollList}>
					<View style={{ marginBottom: 20 }}>
						<View style={styles.headBox}>
							<Text style={[styles.headItem, { fontSize: settingFont * .7 }]}>L</Text>
						</View>
						<View style={styles.box}>
							<Text
								style={[styles.item, { fontSize: settingFont }]}
								numberOfLines={1}
							>
								列表样例
					</Text>
							<Text
								style={[styles.account, { fontSize: settingFont }]}
								numberOfLines={1}
							>
								字体大小样例
					</Text>
						</View>
					</View>

					<View>
						<View style={[styles.contentBox, styles.topContent]}>
							<View style={styles.datailsTitle}>
								<Text style={[styles.detailsTitleText, { fontSize: settingFont * 1.8 }]}>
									详情样例
						</Text>
							</View>
							<View
								style={styles.detailsLine}
							>
								<View style={styles.LineHead}>
									<Text style={[styles.detailsLineLabel, { fontSize: settingFont }]}>账号：</Text>
									<Text
										style={[styles.copy, { fontSize: settingFont * .9 }]}
									>点我复制账号</Text>
								</View>
								<Text style={[styles.detailsLineVal, { fontSize: settingFont * 1.2 }]}>字体大小样例</Text>
							</View>
							<View style={styles.detailsBorder}></View>
							<View
								style={styles.detailsLine}
							>
								<View style={styles.LineHead}>
									<Text style={[styles.detailsLineLabel, { fontSize: settingFont }]}>密码：</Text>
									<Text
										style={[styles.copy, { fontSize: settingFont * .9 }]}
									>点我复制密码</Text>
								</View>
								<Text style={[styles.detailsLineVal, { fontSize: settingFont * 1.2 }]}>123456</Text>
							</View>
						</View>
					</View>

					<View>
						<View style={[styles.btnBox, { backgroundColor }]}>
							<Text style={[styles.btn, style.btnColor, { fontSize: settingFont * 1.125 }]}>按钮样例</Text>
						</View>
					</View>
				</ScrollView>
				<View style={styles.bottomBox}>
					<View style={styles.bottomFontList}>
						<Text style={[styles.bottomFont, styles.bottomFontFirst, { fontSize: cfg.fontSize * fontRate[0] }]}>小</Text>
						<Text style={[styles.bottomFont, { fontSize: cfg.fontSize * fontRate[1] }]}>标准</Text>
						<Text style={[styles.bottomFont, { fontSize: cfg.fontSize * fontRate[2] }]}>偏大</Text>
						<Text style={[styles.bottomFont, styles.bottomFontLast, { fontSize: cfg.fontSize * fontRate[3] }]}>大</Text>
					</View>
					<Slider
						maximumTrackTintColor={backgroundColor}
						minimumTrackTintColor={backgroundColor}
						thumbTintColor={backgroundColor}
						maximumValue={3}
						value={mathValIndex(fontSize)}
						step={1}
						onValueChange={(val) => {
							setSettingFont(cfg.fontSize * fontRate[val]);
						}}
					/>
				</View>
			</View>
		</BasePage>
	);
});

const styles = StyleSheet.create({
	configEditFontBox: {
		justifyContent: 'space-between',
	},
	scrollList: {
		flex: 1,
	},
	bottomBox: {
		paddingVertical: 20,
		paddingHorizontal: 15,
		backgroundColor: '#fff',
	},
	bottomFontList: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		// paddingHorizontal: 10,
		paddingBottom: 10,
	},
	bottomFont: {
		// backgroundColor: '#c00',
		width: 50,
		textAlign: 'center',
	},
	bottomFontFirst: {
		width: 30,
	},
	bottomFontLast: {
		width: 30,
	},
	box: {
		flexDirection: 'row',
		// justifyContent: 'space-around',
		height: 60,
		backgroundColor: '#fff',
	},
	item: {
		textAlignVertical: 'center',
		// borderWidth: 1,
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
		// borderWidth: 1,
		height: 24,
		paddingHorizontal: 15,
		color: '#888',
	},
	contentBox: {
		backgroundColor: '#fff',
		marginHorizontal: 10,
		marginBottom: 25,
		paddingHorizontal: 10,
		borderRadius: 3,
	},
	datailsTitle: {
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
	detailsLine: {
		// flexDirection: 'row',
		padding: 10,
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
	detailsLineLabel: {
		color: '#353535',
		paddingRight: 5,
	},
	detailsLineVal: {
		color: '#888',
		flex: 1,
	},
	detailsBorder: {
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	btnBox: {
		marginHorizontal: 10,
		marginBottom: 25,
		alignItems: 'center',
		borderRadius: 3,
	},
	btn: {
		lineHeight: 46,
	},
});
