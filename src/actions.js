//actions用于定义传入的数据结构 尽可能的简介
import {
	ADD_ACCOUNT_LIST,
	DEL_ACCOUNT_LIST,
	EDIT_ACCOUNT_LIST,
	INIT_ACCOUNT_LIST,
	SEARCH_ACCOUNT_BY_ID,
	ACCOUNT_TO_TOP,
	EDIT_FONT_SIZE,
	INIT_FONT_SIZE,
} from './actionTypes';

// accounts
const addAccountList = (data={name: '', account: '', pwd: '', pinyin: '', id: ''})=>({
	...data,
	type: ADD_ACCOUNT_LIST,
});

const editAccountList = (data={name: '', account: '', pwd: '', pinyin: '', id: ''})=>({
	...data,
	type: EDIT_ACCOUNT_LIST,
});

const delAccountList = (id='', pinyin='like')=>({
	id,
	pinyin,
	type: DEL_ACCOUNT_LIST,
});

const initAccountList = (array)=>({
	data: array,
	type: INIT_ACCOUNT_LIST,
});

//search account
const searchAccountById = (id='', pinyin='like')=>({
	id,
	pinyin,
	type: SEARCH_ACCOUNT_BY_ID,
});

// account to top
const accountToTop = (id='', pinyin='like')=>({
	id,
	pinyin,
	type: ACCOUNT_TO_TOP,
});

const editFontSize = (size=20)=>({
	size,
	type: EDIT_FONT_SIZE,
});

const initFontSize = (size=20)=>({
	size,
	type: INIT_FONT_SIZE,
});

export {
	addAccountList,
	editAccountList,
	delAccountList,
	initAccountList,
	searchAccountById,
	accountToTop,
	editFontSize,
	initFontSize,
};
