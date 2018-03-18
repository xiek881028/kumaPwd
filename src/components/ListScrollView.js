import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Keyboard,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class ListScrollView extends Component {
	Search = ['like','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'];
	responderGrant(index, e) {
		Keyboard.dismiss();
		// this.props.dispatch(changeScrollAbc(true, this.Search[index]));
		this.props.getNowIndex(this.Search[index]);
		this.props.scrollToModal(true, this.Search[index]);
	}
	responderMove(index, e) {
		if(e.nativeEvent.pageY > this._startY && e.nativeEvent.pageY < this._endY){
			let index = Math.floor((e.nativeEvent.pageY-this._startY)/this._blank);
			if(this._nowBlank != index){
				// this.props.dispatch(changeScrollAbc(true, this.Search[index]));
				this.props.getNowIndex(this.Search[index]);
				this.props.scrollToModal(true, this.Search[index]);
			}
			this._nowBlank = index;
		}
	}
	responderRelease() {
		// this.props.dispatch(changeScrollAbc(false, this.Search[this._nowBlank]));
		this.props.scrollToModal(false, this.Search[this._nowBlank]);
	}
	mathLayout(e){
		this.refs.scrollBox.measure((frameX, frameY, frameWidth, frameHeight, pageX, pageY)=>{
			this._startY = pageY;
			this._endY = pageY + frameHeight;
			this._blank = +((frameHeight/this.Search.length).toFixed(5));
		});
	}
	renderScrollView(item, index) {
		if(item == 'like'){
			return (
				<FontAwesome
					name='star'
					key={item}
					style={[styles.scrollViewText, {paddingTop: 0, marginBottom: -5, paddingTop: index==0?10:0,}]}
					onStartShouldSetResponder={()=>true}
					onMoveShouldSetResponder={()=>true}
					onResponderTerminationRequest={()=> false}
					onResponderGrant={this.responderGrant.bind(this, index)}
					onResponderMove={this.responderMove.bind(this, index)}
					onResponderRelease={this.responderRelease.bind(this)}
				/>
			);
		}else{
			return (
				<Text
					onStartShouldSetResponder={()=>true}
					onMoveShouldSetResponder={()=>true}
					onResponderTerminationRequest={()=> false}
					onResponderGrant={this.responderGrant.bind(this, index)}
					onResponderMove={this.responderMove.bind(this, index)}
					onResponderRelease={this.responderRelease.bind(this)}
					key={item}
					style={[styles.scrollViewText, {paddingBottom: index==this.Search.length-1?10: 0,}]}
				>{item}</Text>
			);
		}
	}
	shouldComponentUpdate() {
		return false;
	}
	render() {
		return (
			<View
				style={[styles.scrollView, {height: this.props.appHeight}]}
				onLayout={this.mathLayout.bind(this)}
				ref='scrollBox'
			>
				{this.Search.map(this.renderScrollView.bind(this))}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	scrollView: {
		position: 'absolute',
		right: 0,
		width: 18,
		top: 0,
		// bottom: 0,
		height: 360,
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
