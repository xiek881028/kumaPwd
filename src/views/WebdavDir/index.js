import React, { useState, useEffect, useContext } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import nodePath from 'path-browserify';
import { observer } from 'mobx-react';
import File from '../../components/FilesTree';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import style from '../../css/common.js';
import ModalAddDir from './component/modalAddDir';
import WebdavCls from '../../helper/webdav';
import useAsync from '../../helper/useAsync';

export default observer(({ navigation, route }) => {
  const { params } = route;
  const [path, setPath] = useState();
  const [isReady, setIsReady] = useState(null);
  const [fileInfo, setFileInfo] = useState({});
  const { fontSize, backgroundColor, backgroundDisabled, fontDisabled } = useContext(CTX_THEME);
  const { setLoadingFn } = useContext(CTX_LOADING);
  const { pwd } = useContext(CTX_USER);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { cls, setWebdavFn } = useContext(CTX_WEBDAV);
  const [addModal, setaddModal] = useState(false);
  const webdavCls = new WebdavCls(params);
  // 用于判断页面是否已经卸载，卸载后不再执行setState操作，防止内存泄漏
  const isMountedRef = useAsync();
  // webdav初始化完成
  useEffect(() => {
    setPath('/');
  }, []);
  const load = async path => {
    try {
      setLoadingFn(true, '读取中...');
      const fileTree = await webdavCls.getFileTree(path);
      if (isMountedRef.current) {
        setFileInfo(fileTree);
        setIsReady(true);
        setLoadingFn(false, '');
      }
    } catch (error) {
      if (isMountedRef.current) {
        setTipsFn('text', '读取失败');
        path === '/' ? setIsReady(false) : load(nodePath.join(path, '../'));
        setLoadingFn(false, '');
      }
    }
  };
  // path改变操作
  useEffect(() => {
    if (isMountedRef.current && path !== undefined) {
      navigation.setOptions({
        headerRight: () => {
          return (
            <Button
              mode='android'
              androidColor={backgroundColor}
              style={[style.headerRightBtnWrap, { backgroundColor: isReady ? backgroundColor : backgroundDisabled }]}
              underlayColor={backgroundColor}
              disabled={!isReady}
              activeOpacity={.6}
              onPress={async () => {
                webdavCls.setConfig({ homeDir: path });
                webdavCls.checkComp() && await webdavCls.saveConfig(pwd);
                cls.setConfig(webdavCls.getConfig());
                cls.createClient();
                setWebdavFn('comp', cls.checkComp());
                setTipsFn('text', '配置成功');
                navigation.navigate('WebdavConfig');
              }}
            >
              <Text
                style={[style.headerRightBtnText, { color: isReady ? '#fff' : fontDisabled, fontSize: fontSize * 0.875 }]}
              >完成</Text>
            </Button>
          );
        },
      });
    }
  }, [path, isReady]);
  useEffect(() => {
    if (isMountedRef.current && path !== undefined) {
      (async () => await load(path))();
    }
  }, [path]);
  return (
    <BasePage>
      <View style={[style.container, styles.fileBox]}>
        {isReady === null ? null : isReady ? (
          <File
            title='存放路径：'
            paths={fileInfo}
            ignorePermission={true}
            onClick={res => {
              const { mode, path } = res;
              if (mode === 'file') {
              } else {
                setPath(path);
              }
            }}
          />
        ) : (
            <View style={[styles.linkFailWrap]}>
              <Feather
                name='frown'
                style={[styles.linkFailIcon, { fontSize: fontSize * 4 }]}
              />
              <Text style={[styles.linkFailText, { fontSize: fontSize * 1.2 }]}>连接WebDAV服务器失败，请重新配置</Text>
              <Button
                mode='android'
                androidColor={backgroundColor}
                style={[styles.reConfigBtn, { backgroundColor }]}
                onPress={async () => {
                  navigation.navigate('WebdavAccount');
                }}
              >
                <Text style={[styles.reConfigText]}>重新配置</Text>
              </Button>
            </View>
          )}
        <View style={styles.bottomOperating}>
          <Button
            style={[styles.bottomBtnBox, style[`btnSub${!isReady || fileInfo.isRoot ? 'Disabled' : ''}Bg`]]}
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            disabled={!isReady || fileInfo.isRoot}
            onPress={() => {
              const { isRoot, parentPath } = fileInfo;
              !isRoot && setPath(parentPath);
            }}
          >
            <Text
              style={[style[`btnSub${!isReady || fileInfo.isRoot ? 'Disabled' : ''}Color`], styles.bottomBtnText, { fontSize: fontSize * .8 }]}
            >返回上一层</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            disabled={!isReady}
            style={[styles.bottomBtnBox, { backgroundColor: isReady ? backgroundColor : backgroundDisabled }]}
            onPress={() => setaddModal(true)}
          >
            <Text
              style={[style.btnColor, { color: isReady ? '#fff' : fontDisabled, fontSize: fontSize * 0.8 }]}
            >新建文件夹</Text>
          </Button>
        </View>
      </View>
      <ModalAddDir
        visible={addModal}
        path={path}
        onClose={async () => setaddModal(false)}
        onSubmit={async (text) => {
          webdavCls
            .addDir(nodePath.join(path, text))
            .then(async res => {
              setTipsFn('text', '新增成功');
              setaddModal(false);
              await load(path);
            })
            .catch(err => {
              setTipsFn('text', '新增失败');
              setaddModal(false);
            });
        }}
      />
    </BasePage>
  );
});

const styles = StyleSheet.create({
  fileBox: {
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  bottomOperating: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#d9d9d9',
    backgroundColor: '#ebebeb',
  },
  bottomBtnBox: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 3,
    width: '38%',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
  },
  bottomBtnText: {
    textAlign: 'center',
  },
  linkFailWrap: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  linkFailIcon: {
    color: '#ccc',
  },
  linkFailText: {
    color: '#aaa',
    paddingTop: 8,
  },
  reConfigBtn: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 3,
  },
  reConfigText: {
    color: '#fff',
  },
});
