import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	Text,
} from 'react-native';

//Css
import style from '../css/common.js';

export default class Tips extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isShow: false,
		};
	}
	componentWillMount() {
		this.props.isShow && this.showModal(this.props.text, this.props.timer);
	}
	componentWillReceiveProps(props) {
		props.isShow && this.showModal(props.text, props.timer);
		if (props.clear) {
			this.setState({
				isShow: false,
				text: '',
			});
			this.props.callState && this.props.callState(true);
		};
	}
	componentWillUnmount() {
		clearTimeout(this.timeout);
	}
	showModal(text = '', timer = 1500) {
		clearTimeout(this.timeout);
		this.setState({
			isShow: true,
			text,
		});
		this.timeout = setTimeout(() => {
			this.setState({
				isShow: false,
				text: '',
			});
			this.props.callState && this.props.callState(true);
		}, timer);
	}
	render() {
		return this.state.isShow ? (
			<View
				style={[styles.copyModal, { bottom: this.props.bottom ? this.props.bottom : 30}]}
			>
				<View>
					<Text
						style={[styles.copyModalText, { fontSize: style.baseFontSize * .9 }]}
					>{this.state.text}</Text>
					<View style={[style.absoluteBox, styles.copyModalBg]}></View>
				</View>
			</View>
		)
		: null;
	}
}

const styles = StyleSheet.create({
	copyModal: {
		justifyContent: 'flex-end',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
	},
	copyModalText: {
		paddingVertical: 10,
		paddingHorizontal: 30,
		color: '#fff',
		zIndex: 2,
	},
	copyModalBg: {
		backgroundColor: 'rgba(53, 53, 53, .85)',
		borderRadius: 30,
	},
});
