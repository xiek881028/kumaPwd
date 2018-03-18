//reducers用于计算 接收前state和action算出新的state
import {combineReducers} from 'redux';
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
import { initAccountList } from './actions';

// accounts
let {initList, indexList} = resetInitList();
let viewList = [];

let returnData = {};

function resetInitList(){
	let ABC = ['like','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'];
	let initList = [];
	let indexList = {};
	for(let i=0, max=ABC.length; i<max; i++){
		initList.push({
			key: ABC[i],
			data: [],
		});
		indexList[ABC[i]] = i;
	}
	return {
		initList,
		indexList,
	};
}

addData = (data, goPrune=false)=>{
	initList[indexList[data.pinyin]].data.push({...data, star: !!data.star});
	goPrune && pruneData();
}

editData = (data)=>{
	findAccountById(data.id, (array, index)=>{
		returnData = data;
		if(array[index].pinyin == data.pinyin){
			array[index] = data;
		}else{//居然改了名字首字母
			array.splice(index, 1);
			addData(data, true);
		}
	});
}

findAccountById = (id, fn=function(){})=>{
	for(let i=0, max=initList.length; i<max; i++){
		if(initList[i].data.length){
			let array = initList[i].data;
			let find = false;
			for(let j=0, max2=array.length; j<max2; j++){
				if(id == array[j].id){
					initList[i].key != 'like' && fn(array, j);
					find = true;
					break;
				}
			}
			if(find && initList[i].key != 'like')break;
		}
	}
	pruneData();
}

findAccountByPinyin = (id, pinyin, fn=function(){})=>{
	let array = initList[indexList[pinyin]].data;
	for(let i=0, max=array.length; i<max; i++){
		if(id == array[i].id){
			fn(array, i);
			break;
		}
	};
	pruneData();
}

pruneData = ()=>{
	viewList = [];
	for(let i=0, max=initList.length; i<max; i++){
		if(initList[i].data.length){
			viewList.push(initList[i]);
		}
	}
}

function AccountList (state={}, action){
	switch (action.type){
		case ADD_ACCOUNT_LIST:
			storage.save({
				key: 'accountList',
				id: action.id,
				data: action,
			});
			addData(action, true);
			return {...action, data: viewList};
		case EDIT_ACCOUNT_LIST:
			storage.save({
				key: 'accountList',
				id: action.id,
				data: action,
			});
			editData(action);
			MathStar();
			return {...action, data: viewList};
		case DEL_ACCOUNT_LIST:
			storage.remove({
				key: 'accountList',
				id: action.id,
			});
			findAccountByPinyin(action.id, action.pinyin, (array, i)=>{
				array.splice(i, 1);
			});
			MathStar();
			return {...action, data: viewList};
		case INIT_ACCOUNT_LIST:
			//重置init 修复在首页点返回退出app时从新打开会触发init 造成列表重复渲染
			initList = resetInitList().initList;
			for(let i=0,max=action.data.length; i<max; i++){
				addData(action.data[i]);
			}
			pruneData();
			MathStar();
			return {...action, data: viewList};
		default:
			return {type: "DEFAULT", data: viewList};
	}
}

function MathStar (){
	initList[indexList['like']].data = [];
	for(let i=0, max=viewList.length; i<max; i++){
		for(let j=0, max2=viewList[i].data.length; j<max2; j++){
			if(viewList[i].data[j].star){
				initList[indexList['like']].data.push({...viewList[i].data[j], onLike: true});
			}
		}
	}
	pruneData();
}

function SearchAccountById (state, action){
	switch (action.type){
		case SEARCH_ACCOUNT_BY_ID:
			findAccountByPinyin(action.id, action.pinyin, (array, index)=>{
				returnData = array[index];
			});
			return {...action, returnData};
		default:
			return {type: 'DEFAULT', returnData};
	}
}

function AccountToTop (state, action){
	switch (action.type){
		case ACCOUNT_TO_TOP:
			findAccountByPinyin(action.id, action.pinyin, (array, index)=>{
				array[index].star = !array[index].star;
				storage.save({
					key: 'accountList',
					id: action.id,
					data: {...array[index], ...action},
				});
				returnData = {...array[index], ...action};
				MathStar();
			});
			return {...action};
		default:
			return {type: 'DEFAULT'};
	}
}

let AppFont = null;

function AppFontSize (state, action){
	switch (action.type){
		case EDIT_FONT_SIZE:
			AppFont = action.size;
			storage.save({
				key: 'fontSize',
				data: action.size,
			});
			return {...action}
		case INIT_FONT_SIZE:
			AppFont = action.size;
			return {...action}
		default:
			return {type: 'DEFAULT', size: AppFont}
	}
}

//注意执行顺序
export default combineReducers({
	AccountToTop,
	AccountList,
	SearchAccountById,
	AppFontSize,
});
