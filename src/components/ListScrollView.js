import React, { memo, useEffect, useRef, useContext, useState } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Keyboard,
	Dimensions,
	StatusBar,
} from 'react-native';
// import { useHeaderHeight } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { CtxList } from './listContext';
import { isProd } from '../config';

export default memo(({ options, height }) => {
	const wrapRef = useRef(null);
	const search = ['like', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
	if (options) search.unshift('__options');
	const { setFn } = useContext(CtxList);
	// const contextHeight = useRef(Dimensions.get('window').height - useHeaderHeight());
	// 目前使用 useHeaderHeight 会在首次渲染出现高度跳动现象，暂时写死header高度，高度在css/common.js中定义
	const [contextHeight, setContextHeight] = useState(height ?? Dimensions.get('window').height - 50 - (OS === 'android' ? StatusBar.currentHeight : 24));
	let _startY = 0;
	let _endY = 0;
	let _blank = 0;
	let _nowBlank = 0;
	const responderGrant = (index, e) => {
		Keyboard.dismiss();
		setFn('active', search[index]);
		setFn('centerIsShow', true);
		_nowBlank = index;
	}
	const responderMove = (index, e) => {
		if (e.nativeEvent.pageY > _startY && e.nativeEvent.pageY < _endY) {
			let index = Math.floor((e.nativeEvent.pageY - _startY) / _blank);
			if (_nowBlank != index) {
				setFn('active', search[index]);
				setFn('centerIsShow', true);
			}
			_nowBlank = index;
		}
	}
	const responderRelease = () => {
		setFn('centerIsShow', false);
	}
	const renderScrollView = (item, index) => {
		if (item == 'like') {
			return (
				<FontAwesome
					name='star'
					key={item}
					style={[styles.scrollViewText, { paddingTop: 0, marginBottom: -5, paddingTop: index == 0 ? 10 : 0, fontSize: contextHeight / 40 }]}
					onStartShouldSetResponder={() => true}
					onMoveShouldSetResponder={() => true}
					onResponderTerminationRequest={() => false}
					onResponderGrant={responderGrant.bind(this, index)}
					onResponderMove={responderMove.bind(this, index)}
					onResponderRelease={responderRelease.bind(this)}
				/>
			);
		} else if (item == '__options') {
			return (
				<Feather
					name='arrow-up'
					key={item}
					style={[styles.scrollViewText, { paddingTop: 0, paddingTop: index == 0 ? 10 : 0, fontSize: (contextHeight / 40) + 2 }]}
					onStartShouldSetResponder={() => true}
					onMoveShouldSetResponder={() => true}
					onResponderTerminationRequest={() => false}
					onResponderGrant={responderGrant.bind(this, index)}
					onResponderMove={responderMove.bind(this, index)}
					onResponderRelease={responderRelease.bind(this)}
				/>
			);
		} else {
			return (
				<Text
					onStartShouldSetResponder={() => true}
					onMoveShouldSetResponder={() => true}
					onResponderTerminationRequest={() => false}
					onResponderGrant={responderGrant.bind(this, index)}
					onResponderMove={responderMove.bind(this, index)}
					onResponderRelease={responderRelease.bind(this)}
					key={item}
					style={[styles.scrollViewText, { paddingBottom: index == search.length - 1 ? 10 : 0, fontSize: contextHeight / 40 }]}
				>{item}</Text>
			);
		}
	};
	const mathLayout = () => {
		wrapRef.current.measure((x, y, width, height, pageX, pageY) => {
			_startY = pageY;
			_endY = pageY + height;
			_blank = +((height / search.length).toFixed(10));
		});
	};
	useEffect(() => {
		if (height) {
			setContextHeight(height);
		}
		mathLayout();
	}, [height]);
	return (
		<View
			ref={wrapRef}
			style={[styles.scrollView, { height: contextHeight }]}
			onLayout={mathLayout}
		>
			{search.map(renderScrollView)}
		</View>
	);
});

const styles = StyleSheet.create({
	scrollView: {
		position: 'absolute',
		right: 0,
		width: 24,
		top: 0,
		flexDirection: 'column',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	scrollViewText: {
		// backgroundColor: '#c00',
		width: '100%',
		flex: 1,
		textAlign: 'center',
	},
});
