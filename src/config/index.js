// app名称
export const appName = '账号匣';
// 版本
export const version = 'v2.0.0';
// 区分生产与开发环境
export const isProd = true;
// 起始页
export const initPage = 'Home';
// 自动备份
export const autoBackup = false;
// 后台留存
export const backHold = true;
// 后台留存时间长度
export const backHoldTime = 1000 * 30;
// 密码错误锁定
export const errorPwd = true;
// 密码错误锁定次数
export const errorPwdNum = 10;
// 密码错误锁定时间
export const errorPwdTime = 1000 * 60 * 60;
// 指纹识别
export const fingerprint = true;
// 开启webdav
export const webdav = false;
// 明文备份
export const backup2Json = false;
// 快速入口
export const fastEntry = false;
// 启动提醒
export const asyncTips = false;
// 保留历史
export const asyncHistory = false;
// 应用分享链接地址
export const shareLink = 'https://www.coolapk.com/apk/180130';
// 默认字体大小
export const fontSize = 16;
// 默认主题色
export const defaultColor = '#68605d';
// 彩蛋开关
export const egg = false;
// 彩蛋任务完成标识
export const eggDone = false;
// 主题色列表
export const colorList = [
	'#68605d', // kuma
	'#ff8c8c',
	'#ff5053',
	'#ff7e16',
	'#f1c40f',
	'#2ecc71',
	'#7ea04d',
	'#056674',
	'#308fdf',
	'#12cad6',
	'#1abc9c',
	'#795dde',
	'#c060a1',
	'#c7b198',
	'#95a5a6',
	'#24252c',
];
// 各页面title
export const title = {
	Login: '登录',
	Register: '注册',
	Home: appName,
	Config: '设置',
	ConfigColor: '主题色',
	ConfigEditFont: '字体大小',
	Search: '搜索',
	TagSearch: '标签',
	EditAcount: '', // 在页面确定状态后决定是新增还是编辑
	Details: '详情',
	TagEdit: '', // 在页面确定状态后决定是新增还是编辑
	DataBackUp: '本地备份',
	ConfigAdv: '高级设置',
	About: '关于',
	EditPwd: '修改密码',
	ImportCheck: '导入验证',
	TagConfig: '标签管理',
	TagSort: '排序',
	TagSelectAccount: '选择账号',
	WebdavAccount: '连接配置',
	WebdavDir: '存储路径',
	WebdavConfig: 'WebDAV',
};
// app锁定时间
export const lockTimeList = [
	// 1000 * 10, // 10s
	1000 * 60 * 30, // 30m
	1000 * 60 * 60, // 1h
	1000 * 60 * 60 * 3, // 3h
	1000 * 60 * 60 * 6, // 6h
	1000 * 60 * 60 * 12, // 12h
	1000 * 60 * 60 * 24, // 1d
];
// app试错次数
export const lockNumList = [
	1, 3, 10, 30, 50, 100
];
// 后台留存时间
export const holdTimeList = [
	1000 * 30, // 30s
	1000 * 60, // 1m
	1000 * 60 * 5, // 5m
	1000 * 60 * 10, // 10m
	1000 * 60 * 30, // 30m
	1000 * 60 * 60, // 1h
];
// 更新列表
export const changeList = [
	'代码整体重构，代码重写大于90%',
	{ text: '更新了加密算法。旧版升级需重新校验密码升级数据，首次使用无影响（下个版本删除该功能）', mode: 'warning' },
	{ text: '为平稳过渡，提供了导入旧版备份文件功能（下个版本删除该功能）', mode: 'warning' },
	{text: '重写了App配置，重置了所有配置，请重新设置', mode: 'warning'},
	'升级第三方依赖组件至当前最新版',
	{text: '新增对webDAV的支持，如果介意联网权限请下载v1版本或手动禁止联网', mode: 'warning'},
	'新增标签功能',
	'完善了主题设置',
	'新增打印错误日志',
	'更换了id生成库，减小了备份文件大小',
	'新增App版本检测机制',
	'更新了彩蛋图片',
	'新增了一个彩蛋，彩蛋素材均来自互联网，如有侵权请联系作者',
	'修复若干bug',
];

export default {
	appName,
	version,
	isProd,
	initPage,
	autoBackup,
	backHold,
	backHoldTime,
	errorPwd,
	errorPwdNum,
	errorPwdTime,
	fingerprint,
	shareLink,
	fontSize,
	title,
	lockTimeList,
	lockNumList,
	holdTimeList,
	changeList,
	defaultColor,
	colorList,
	webdav,
	backup2Json,
	fastEntry,
	asyncTips,
	asyncHistory,
	egg,
	eggDone,
};
