import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import style from './css/common';
import cfg from './config';
import { getStorage } from './helper';

//View
import Home from './views/Home';
import search from './views/Search';
import config from './views/Config';
import editAcount from './views/EditAccount';
import details from './views/Details';
import login from './views/Login/login';
import register from './views/Login/register';
import editPwd from './views/Login/editPwd';
import importCheck from './views/Login/importCheck';
import configColor from './views/ConfigColor';
import configEditFont from './views/ConfigEditFont';
import dataBackUp from './views/DataBackUp';
import configAdv from './views/ConfigAdv';
import about from './views/About';
import update from './views/Update';
import tagSearch from './views/TagSearch';
import tagConfig from './views/TagConfig';
import tagEdit from './views/TagEdit';
import tagSort from './views/TagSort';
import tagSelectAccount from './views/TagSelectAccount';
import webdavAccount from './views/WebdavAccount';
import webdavConfig from './views/WebdavConfig';
import webdavDir from './views/WebdavDir';

import { observer } from 'mobx-react';
const { Navigator, Screen } = createStackNavigator();

const navigationOptions = ({ route, navigation }) => {
	return ({
		headerMode: 'float',
		headerTitle: '',
		headerStyle: style.headerStyle,
	});
};

export default observer(props => {
	const [hasUserToken, setHasUserToken] = useState(null);
	const [hasUpdate, setHasUpdate] = useState(null);
	const { pwd, isLogin } = useContext(CTX_USER);
	useEffect(() => {
		setHasUserToken(!!pwd);
		(async () => {
			let nowVersion = (await getStorage('version') ?? '0').replace(/[\D]/g, '');
			let targetVersion = cfg.version.replace(/[\D]/g, '');
			setHasUpdate(+nowVersion < +targetVersion);
		})();
	}, [pwd, isLogin]);
	return hasUserToken === null || hasUpdate === null ? null : (
		<NavigationContainer>
			<Navigator initialRouteName={hasUpdate && !isLogin ? 'Update' : cfg.initPage}>
				{
					isLogin ?
						(<>
							<Screen name="Home" component={Home} options={navigationOptions} />
							<Screen name="EditPwd" component={editPwd} options={{
								headerShown: false,
							}} />
							<Screen name="ImportCheck" component={importCheck} options={{
								headerShown: false,
							}} />
							<Screen name="Config" component={config} options={navigationOptions} />
							<Screen name="Search" component={search} options={navigationOptions} />
							<Screen name="EditAcount" component={editAcount} options={navigationOptions} />
							<Screen name="Details" component={details} options={navigationOptions} />
							<Screen name="ConfigColor" component={configColor} options={navigationOptions} />
							<Screen name="ConfigEditFont" component={configEditFont} options={navigationOptions} />
							<Screen name="DataBackUp" component={dataBackUp} options={navigationOptions} />
							<Screen name="ConfigAdv" component={configAdv} options={navigationOptions} />
							<Screen name="About" component={about} options={navigationOptions} />
							<Screen name="TagConfig" component={tagConfig} options={navigationOptions} />
							<Screen name="TagSearch" component={tagSearch} options={navigationOptions} />
							<Screen name="TagEdit" component={tagEdit} options={navigationOptions} />
							<Screen name="TagSort" component={tagSort} options={navigationOptions} />
							<Screen name="TagSelectAccount" component={tagSelectAccount} options={navigationOptions} />
							<Screen name="WebdavAccount" component={webdavAccount} options={navigationOptions} />
							<Screen name="WebdavConfig" component={webdavConfig} options={navigationOptions} />
							<Screen name="WebdavDir" component={webdavDir} options={navigationOptions} />
						</>) :
						<>
							{
								// 根据是否保存有校验密码决定跳转登录或注册页
								hasUserToken ?
									<Screen name="Login" component={login} options={{
										headerShown: false,
									}} /> :
									<Screen name="Register" component={register} options={{
										headerShown: false,
									}} />
							}
							<Screen name="Update" component={update} options={{
								headerShown: false,
							}} />
						</>
				}
			</Navigator>
		</NavigationContainer>
	);
});
