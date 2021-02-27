import React, { memo, forwardRef } from 'react';
import {
	StyleSheet,
	Modal,
	View,
	TouchableWithoutFeedback,
	StatusBar,
} from 'react-native';

export default memo(forwardRef(({ visible, onClose, children }, ref) => {
	return (
		<Modal
			animationType='none'
			transparent={true}
			ref={ref}
			onRequestClose={() => {
				(onClose ?? (() => { }))(false);
			}}
			visible={visible}
		>
			<StatusBar backgroundColor="rgba(0, 0, 0, .5)" />
			<View
				style={[styles.baseModalContent]}
			>
				<TouchableWithoutFeedback
					onPress={() => {
						(onClose ?? (() => { }))(false);
					}}
				>
					<View style={{ flex: 1 }}></View>
				</TouchableWithoutFeedback>
				{children}
			</View>
			<TouchableWithoutFeedback
				onPress={() => {
					(onClose ?? (() => { }))(false);
				}}
			>
				<View
					style={[styles.baseModalBg]}
				></View>
			</TouchableWithoutFeedback>
		</Modal>
	);
}));

const styles = StyleSheet.create({
	baseModalBg: {
		backgroundColor: 'rgba(0, 0, 0, .5)',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
	baseModalContent: {
		margin: 10,
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
		justifyContent: 'flex-end',
		zIndex: 2,
	},
});
