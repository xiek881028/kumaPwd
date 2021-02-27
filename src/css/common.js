const container = {
	flex: 1,
	backgroundColor: '#ebebeb',
};

//head
const headerTitleStyle = {
	fontWeight: '100',
	fontFamily: 'monospace',
	color: '#454545',
};
const headerTitleIcon = {
	color: '#454545',
}
const headerStyle = {
	elevation: 1.8,
	// 必须设置高度，否则在 ListScrollView组件中获取头部高度时会不准确
	height: 50,
	backgroundColor: '#fff',
};
const headerRightBox = {
	flexDirection: 'row',
};
const headerRightBtnWrap = {
	marginRight: 10,
	borderRadius: 3,
	paddingHorizontal: 15,
	height: 30,
	justifyContent: 'center',
	alignItems: 'center',
};
const headerRightBtnText = {
	color: '#fff',
};

// btn
const btnColor = {
	color: '#fff',
};
const btnSubBg = {
	backgroundColor: '#f8f8f8',
	borderColor: 'rgba(100, 100, 100, .2)',
	borderWidth: 1,
};
const btnSubHeightBg = {
	backgroundColor: '#ddd',
	borderColor: 'rgba(100, 100, 100, .2)',
	borderWidth: 1,
};
const btnSubDisabledBg = {
	backgroundColor: '#e3e3e3',
	borderColor: '#c1c1c1',
	borderWidth: 1,
};
const btnSubColor = {
	color: '#68605d',
};
const btnSubDisabledColor = {
	color: '#c1c1c1',
};

//modal
const modalBox = {
	backgroundColor: '#fff',
	borderRadius: 3,
	overflow: 'hidden',
	maxHeight: '80%',
};

const modalTitle = {
	textAlign: 'center',
	paddingTop: 20,
	paddingBottom: 10,
	color: '#333',
	paddingHorizontal: 10,
};

const modalContent = {
	paddingBottom: 20,
	paddingHorizontal: 20,
};

const modalFooter = {
	flexDirection: 'row',
	justifyContent: 'space-around',
};

const modalFooterBtnbox = {
	flex: 1,
};

const modalSubBtnbox = {
	borderTopWidth: 1,
};

const modalFooterBtn = {
	textAlign: 'center',
	padding: 15,
};

const warningColor = {
	color: '#ed0509',
};

module.exports = {
	container,

	headerTitleStyle,
	headerStyle,
	headerRightBox,
	headerTitleIcon,
	headerRightBtnWrap,
	headerRightBtnText,

	btnColor,
	btnSubColor,
	btnSubBg,
	btnSubHeightBg,
	btnSubDisabledBg,
	btnSubDisabledColor,

	modalBox,
	modalTitle,
	modalContent,
	modalFooter,
	modalFooterBtnbox,
	modalSubBtnbox,
	modalFooterBtn,

	warningColor,
};
