const container = {
	flex: 1,
	position: 'absolute',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	backgroundColor: '#ebebeb',
};
const absoluteBox = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
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
	// height: 50,
	backgroundColor: '#fff',
};
const headerRightBox = {
	flexDirection: 'row',
};
const headerLeftBtn = {
	padding: 3,
};

//fontSize
const baseFontSize = 16;

// btn
const btnBg = {
	backgroundColor: '#68605d',
	borderColor: '#68605d',
};
const btnHeightBg = {
	backgroundColor: '#58504d',
	borderColor: '#58504d',
};
const btnDisabledBg = {
	backgroundColor: '#48403d',
	borderColor: '#48403d',
};
const btnColor = {
	color: '#fff',
};
const btnDisabledColor = {
	color: 'rgba(230, 230, 230, 0.5)',
};
const btnSubBg = {
	backgroundColor: '#f8f8f8',
	borderColor: 'rgba(100, 100, 100, .2)',
};
const btnSubHeightBg = {
	backgroundColor: '#ddd',
	borderColor: 'rgba(100, 100, 100, .2)',
};
const btnSubDisabledBg = {
	backgroundColor: '#e3e3e3',
	borderColor: 'rgba(0, 0, 0, .2)',
};
const btnSubColor = {
	color: '#68605d',
};
const btnSubDisabledColor = {
	color: 'rgba(0, 0, 0, .3)',
};

//input
const inputTextColor = {
	color: '#454545',
};
const inputLineColor = {
	color: '#454545',
};
const inputDelColor = {
	color: '#454545',
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
	borderTopWidth: 1,
};

const modalFooterBtn = {
	textAlign: 'center',
	padding: 15,
};

module.exports = {
	container,
	absoluteBox,

	headerTitleStyle,
	headerStyle,
	headerRightBox,
	headerTitleIcon,
	headerLeftBtn,

	baseFontSize,

	btnColor,
	btnSubColor,
	btnBg,
	btnHeightBg,
	btnDisabledBg,
	btnSubBg,
	btnSubHeightBg,
	btnSubDisabledBg,
	btnSubDisabledColor,
	btnDisabledColor,

	inputTextColor,
	inputLineColor,
	inputDelColor,

	modalBox,
	modalTitle,
	modalContent,
	modalFooter,
	modalFooterBtnbox,
	modalFooterBtn,
};
