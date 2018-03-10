import React, { Component } from 'react';
import {
	StyleSheet,
	Modal,
	View,
	TouchableWithoutFeedback,
} from 'react-native';

export default class ModalBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modalIsShow: props.visible,
		};
	}
	setModal = (bool = false, cb=()=>{})=>{
		this.setState({ modalIsShow: !!bool }, cb());
		!bool && this.props.cloesModal && this.props.cloesModal();
	}
	render() {
		return (
			<Modal
				animationType='none'
				onRequestClose={()=>{
					this.setModal(false);
				}}
				visible={this.state.modalIsShow}
			>
				<View
					style={[styles.baseModalContent]}
				>
					<TouchableWithoutFeedback
						onPress={()=>{
							this.props.emptyClose != false && this.setModal(false);
						}}
					>
						<View style={{flex:1}}></View>
					</TouchableWithoutFeedback>
					{this.props.children}
				</View>
				<TouchableWithoutFeedback
					onPress={()=>{
						this.props.emptyClose != false && this.setModal(false);
					}}
				>
					<View
						style={[styles.baseModalBg]}
					></View>
				</TouchableWithoutFeedback>
			</Modal>
		);
	}
}

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
