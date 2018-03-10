import React, { Component } from 'react';
import {
	View,
} from 'react-native';

import ListScrollView from './ListScrollView';
import ListModalCenter from './ListModalCenter';

//Css
import style from '../css/common.js';

export default class ListScrollFather extends Component {
	constructor(props){
		super(props);
		this.state = {...props};
		this.state.abc = 'like';
		this.state.show = false;
	}
	scrollToModal(show, abc) {
		this.setState({
			show,
			abc,
		});
	}
	render() {
		return (
			<View style={style.absoluteBox}>
				<ListScrollView
					getNowIndex={this.props.getNowIndex}
					scrollToModal={this.scrollToModal.bind(this)}
					appHeight={this.props.appHeight}
				/>
				<ListModalCenter
					abc={this.state.abc}
					show={this.state.show}
					appHeight={this.props.appHeight}
				/>
			</View>
		);
	}
}
