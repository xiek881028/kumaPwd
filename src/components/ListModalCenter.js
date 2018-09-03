import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class ListModalCenter extends Component {
	render() {
		return this.props.show ? (
			<View style={[styles.modalCenterBox, { height: this.props.appHeight }]}>
				<View
					style={styles.modalCenterView}
				>
					{this.props.abc == 'like' ?
						<FontAwesome
							name='star'
							style={styles.modalCenterIcon}
						/>
						:
						<Text
							style={styles.modalCenterText}
						>{this.props.abc}</Text>
					}
				</View>
			</View>
		)
		: null;
	}
}

const styles = StyleSheet.create({
	modalCenterBox: {
		position: 'absolute',
		top: 0,
		// bottom: 0,
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
