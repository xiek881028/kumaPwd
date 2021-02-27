import React, { memo, useContext, useRef, useCallback, useState, useEffect } from 'react';
import {
	StyleSheet,
	View,
	TextInput,
} from 'react-native';
import { observer } from 'mobx-react';
import useAsync from '../helper/useAsync';

export default memo(observer(props => {
	const { autoFocus, onFocus, onBlur, ...other } = props;
	const { fontSize, backgroundColor } = useContext(CTX_THEME);
	const [isFocus, setIsFocus] = useState(!!autoFocus);
	const inputRef = useRef(null);
	const useAsyncFlag = useAsync();
	const _onFocus = useCallback(() => {
		setIsFocus(true);
		(onFocus ?? (() => { }))();
	}, [onFocus]);
	const _onBlur = useCallback(() => {
		setIsFocus(false);
		(onBlur ?? (() => { }))();
	}, [onBlur]);
	useEffect(() => {
		autoFocus && setTimeout(() => {
			if (useAsyncFlag.current) inputRef.current.focus();
		}, 150);
	}, [autoFocus]);
	return (
		<View style={[styles.inputBox, other.warpStyle ?? {}, { borderBottomColor: isFocus ? backgroundColor : '#c6c6c6' }]}>
			<TextInput
				ref={inputRef}
				style={[styles.input, { fontSize }]}
				clearButtonMode='always'
				blurOnSubmit={false}
				selectionColor={backgroundColor}
				underlineColorAndroid='transparent'
				onFocus={_onFocus}
				onBlur={_onBlur}
				{...other}
			/>
		</View>
	);
}), (prev, next) => {
	return prev.value === next.value;
});

const styles = StyleSheet.create({
	inputBox: {
		borderBottomWidth: 1,
		flexDirection: 'row',
	},
	input: {
		padding: 0,
		height: 30,
		flex: 1,
	},
});
