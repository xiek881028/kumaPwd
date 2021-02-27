import React, { useEffect, useState, memo, useContext } from 'react';
import {
	StyleSheet,
	View,
	Text,
} from 'react-native';
import { observer } from 'mobx-react';
import style from '../css/common.js';

export default memo(observer(props => {
	const { fontSize } = useContext(CTX_THEME);
	const { timer, text, cb, setTipsFn, isShow: pIsShow } = useContext(CTX_TIPS);
	const [isShow, setIsShow] = useState(null);
	let time;
	// 同时设置多个属性时，保证只有一个计时器
	useEffect(() => {
		clearTimeout(time);
		if (!isShow) return;
		time = setTimeout(() => {
			setIsShow(false);
			setTipsFn('text', '');
			(cb ?? (() => { }))();
		}, timer);
		return () => {
			clearTimeout(time);
		};
	}, [isShow, timer, text]);
	// tips隐藏，重置父级设置，防止其他组件调用时，配置混乱
	useEffect(() => {
		if (!isShow && isShow !== null) {
			setTipsFn('isShow', undefined);
			setTipsFn('cb', undefined);
			setTipsFn('timer', 2500);
			setTipsFn('text', '');
		};
	}, [isShow]);
	useEffect(() => {
		setIsShow(!!text);
	}, [text]);
	// 父级isShow传递给组件控制
	useEffect(() => {
		// 防止 pIsShow 没有传，由false 变成 undefined 触发更新
		if (!pIsShow !== !isShow) {
			setIsShow(pIsShow);
		}
	}, [pIsShow]);
	return isShow ? (
		<View
			pointerEvents="none"
			style={[styles.tipsModalWrap, { bottom: 30 }]}
		>
			<View
				style={[styles.tipsModal]}
			>
				<Text
					style={[styles.tipsModalText, { fontSize: fontSize * .9 }]}
				>{text}</Text>
			</View>
		</View>
	) : null;
}));

const styles = StyleSheet.create({
	tipsModalWrap: {
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 99999,
	},
	tipsModal: {
		marginHorizontal: 20,
		backgroundColor: 'rgba(53, 53, 53, .85)',
		borderRadius: 30,
	},
	tipsModalText: {
		paddingVertical: 10,
		paddingHorizontal: 30,
		color: '#fff',
		zIndex: 2,
	},
});
