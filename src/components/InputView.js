import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	TextInput,
	TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

//Css
import style from '../css/common.js';

export default class InputView extends Component {
	constructor (props){
		super(props);
		this.state = {...props};
		this.state.isFocus = false;
		if(this.props.value){
			this.setText(this.props.value, true);
		}else{
			this.state.textVal = '';
		}
	}
	focus(callback=function(){return {}}, status=true) {
		this.setState({
			...callback(),
			isFocus: status,
			showDel: this.state.textVal.length && status? true : false,
		});
	}
	setText(text, init) {
		this.props.getText && this.props.getText(text);
		if(init){
			this.state.textVal = text;
			this.state.showDel = text.length && this.state.isFocus? true : false;
		}else{
			this.setState({
				textVal: text,
				showDel: text.length && this.state.isFocus? true : false,
			});
		}
	}
	render() {
		return (
			<View style={[styles.inputBox, {borderBottomColor: this.state.isFocus? style.inputLineColor.color : '#c6c6c6'}]}>
				<TextInput
					style={[styles.input, {color: this.state.textColor || style.inputTextColor.color, fontSize: this.state.fontSize}]}
					underlineColorAndroid='transparent'
					selectionColor={style.inputLineColor.color}
					autoCapitalize='none'
					autoFocus={this.state.autoFocus}
					keyboardType='default'
					value={this.state.textVal}
					onChangeText={(textVal)=>this.setText(textVal)}
					onEndEditing={this.props.onEndEditing}
					maxLength={this.state.maxLength}
					placeholder={this.state.placeholder}
					onFocus={this.focus.bind(this, this.state.onFocus)}
					onBlur={this.focus.bind(this, this.state.onBlur, false)}
					placeholderTextColor={this.state.placeholderTextColor}
				></TextInput>
				{
					this.state.showDel?
						<TouchableOpacity
							onPress={()=>this.setText('')}
							activeOpacity={.6}
							style={styles.delIconBox}
						>
							<Feather
								name='x'
								style={[{color: this.state.delColor || style.inputDelColor.color, fontSize: this.state.fontSize*1.1}]}
							/>
						</TouchableOpacity>
					: null
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	inputBox: {
		borderBottomWidth: 1,
		flexDirection: 'row',
	},
	input: {
		padding: 0,
		height: 30,
		flex: 1,
		// paddingVertical: 0,
		// paddingHorizontal: 5,
	},
	delIconBox: {
		width: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
