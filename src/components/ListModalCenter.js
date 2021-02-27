import React, { useContext, memo } from 'react';
import {
	StyleSheet,
	Text,
	View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { observer } from 'mobx-react';
import { CtxList } from './listContext';

export default memo(observer(props => {
	const { centerIsShow, active } = useContext(CtxList);
	return centerIsShow ? (
		<View style={[styles.modalCenterBox]}>
			<View
				style={styles.modalCenterView}
			>
				{active == 'like' ?
					<FontAwesome
						name='star'
						style={styles.modalCenterIcon}
					/>
					:
					active == '__options' ?
						<Feather
							name='arrow-up'
							style={styles.modalCenterIcon}
						/>
						:
						<Text
							style={styles.modalCenterText}
						>{active}</Text>
				}
			</View>
		</View>
	) : null;
}));

const styles = StyleSheet.create({
	modalCenterBox: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		// flex: 1,
		left: 0,
		right: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalCenterView: {
		backgroundColor: 'rgba(0,0,0,.65)',
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalCenterText: {
		fontSize: 50,
		// fontSize: 30,
		marginTop: -10,
		color: '#fff',
	},
	modalCenterIcon: {
		fontSize: 50,
		color: '#fff',
	},
});
