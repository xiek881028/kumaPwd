import pinyin_dict_firstletter from './pinyin_dict_firstletter';

export default function(str){
	if(!str || /^ +$/g.test(str)) return '';
	let unicode = str.charCodeAt(0);
	let ch = str.charAt(0);
	if(unicode >= 19968 && unicode <= 40869){
		ch = pinyin_dict_firstletter.charAt(unicode-19968);
	}else{
		if(/^[a-zA-Z]$/.test(ch)){
			ch = ch.toUpperCase();
		}else{
			ch = '#';
		}
	}
	return ch;
};
