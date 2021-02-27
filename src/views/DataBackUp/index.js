import React, { useState, useEffect, useContext } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import { observer } from 'mobx-react';
import Color from 'color';
import {
  checkPermissionAndroid,
	checkAndRequestPermissionAndroid,
  fileIsExists,
  initMkdir,
} from '../../helper';
import File from '../../components/FilesTree';
import BasePage from '../../components/basePage';
import Button from '../../components/button';
import ModalPermission from '../../components/modalPermission';
import ModalImport from './component/modalImport';
import ModalExport from './component/modalExport';
import ModalDel from './component/modalDel';
import ModalRename from './component/modalRename';
import FilesAndroid from '../../NativeModules/FilesAndroid';
import ShareAndroid from '../../NativeModules/ShareAndroid';
import style from '../../css/common.js';

export default observer(props => {
  let listenerFn;
  const rootPath = FilesAndroid.ROOT_PATH;
  const [path, setPath] = useState();
  const [hasPermission, setHasPermission] = useState(null);
  const [fileInfo, setFileInfo] = useState({});
  const [tapFile, setTapFile] = useState({});
  const [permissionModal, setPermissionModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [deltModal, setDelModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const getFileTree = (path = '/storage/emulated/0') => {
    return new Promise(resolve => {
      FilesAndroid.getFilesTree(path, d => {
        let _arr = [];
        let out = {};
        if (d.flag) {
          for (let i = 0, max = d.sort.length; i < max; i++) {
            if (d.data[d.sort[i]].name.indexOf('.') != 0) {
              _arr.push(d.data[d.sort[i]]);
            }
          }
          out = {
            type: 'dir',
            fileTree: _arr,
            parentPath: d.prev,
            path,
            isRoot: path === rootPath,
          };
        } else {
          if (d.message == 'is file') {
            out = {
              type: 'file',
              path,
            };
          }
        }
        resolve(out);
      });
    });
  };
  useEffect(() => {
    (async () => {
      const checkPermission = await checkPermissionAndroid([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      // 初始无权限时先询问权限，避免直接渲染无权限
      checkPermission && setHasPermission(checkPermission);
      setPermissionModal(!checkPermission);
    })();
  }, []);
  // 拥有权限后相关操作
  useEffect(() => {
    if (hasPermission) {
      fileIsExists(`${rootPath}/kumaPwd/beifen`)
        .then(d => {
          if (d.flag && !d.data) {
            initMkdir('beifen')
              .then(() => setPath(`${rootPath}/kumaPwd/beifen`))
              .catch(() => setPath(rootPath));
          } else {
            setPath(`${rootPath}/kumaPwd/beifen`);
          }
        });
    }
  }, [hasPermission]);
  // path改变操作
  useEffect(() => {
    (async () => {
      if (path) {
        setFileInfo(await getFileTree(path));
        if (hasPermission) {
          // 先清除一次，防止内存泄漏
          AppState.removeEventListener('change', listenerFn);
          listenerFn = async state => {
            if (state === 'active') {
              setFileInfo(await getFileTree(path));
            }
          };
          AppState.addEventListener('change', listenerFn);
        }
      }
    })();
    return () => AppState.removeEventListener('change', listenerFn);
  }, [path]);
  return (
    <BasePage>
      <View style={[style.container, styles.fileBox]}>
        {hasPermission === null ?
          null :
          hasPermission ? (
            <File
              paths={fileInfo}
              permissionCb={permission => {
                setHasPermission(permission);
              }}
              onClick={res => {
                const { mode, path } = res;
                if (mode === 'file') {
                  setImportModal(true);
                  setTapFile(res);
                } else {
                  setPath(path);
                }
              }}
            />
          ) : (
              <View style={[styles.noPermissionWrap]}>
                <Feather
                  name='frown'
                  style={[styles.permissionIcon, { fontSize: fontSize * 4 }]}
                />
                <Text style={[styles.permissionText, { fontSize: fontSize * 1.2 }]}>无文件访问权限</Text>
                <Button
                  mode='android'
                  androidColor={backgroundColor}
                  style={[styles.getPermissionBtn, { backgroundColor }]}
                  onPress={async () => {
                    const hasPermission = await checkAndRequestPermissionAndroid([
                      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    ]);
                    setHasPermission(hasPermission);
                  }}
                >
                  <Text style={[styles.getPermissionText]}>给予权限</Text>
                </Button>
              </View>
            )
        }
        <View style={styles.bottomOperating}>
          <Button
            style={[styles.bottomBtnBox, style[`btnSub${fileInfo.isRoot || !hasPermission ? 'Disabled' : ''}Bg`]]}
            mode='android'
            androidColor={style.btnSubHeightBg.backgroundColor}
            disabled={fileInfo.isRoot || !hasPermission}
            onPress={() => {
              const { isRoot, parentPath } = fileInfo;
              !isRoot && setPath(parentPath);
            }}
          >
            <Text
              style={[style[`btnSub${fileInfo.isRoot || !hasPermission ? 'Disabled' : ''}Color`], styles.bottomBtnText, { fontSize: fontSize * .8 }]}
            >返回上一层</Text>
          </Button>
          <Button
            mode='android'
            androidColor={backgroundColor}
            style={[styles.bottomBtnBox, { backgroundColor: hasPermission ? backgroundColor : Color(backgroundColor).lighten(.7).hex() }]}
            disabled={!hasPermission}
            onPress={() => {
              // this.refs.modal.setModal(true);
              setExportModal(true);
            }}
          >
            <Text
              style={[style.btnColor, styles.bottomBtnText, { fontSize: fontSize * .8 }]}
            >导出到这里</Text>
          </Button>
        </View>
      </View>
      <ModalPermission
        visible={permissionModal}
        text='为了能够正常的导入导出，应用需要获取您设备的存储权限。请同意应用获取相关权限。'
        onClose={(flag, { permission }) => {
          // 弹窗关闭必然渲染有无权限，避免权限为null
          setHasPermission(!!permission);
          setPermissionModal(flag);
        }}
      />
      <ModalImport
        visible={importModal}
        info={tapFile}
        onClose={(close, { mode }) => {
          if (mode === 'delete') {
            setDelModal(true);
          } else if (mode === 'send') {
            ShareAndroid.shareFile(`发送账号匣备份文件`, tapFile.path);
          } else if (mode === 'rename') {
            setRenameModal(true);
          } else {
            setImportModal(false);
          }
        }}
      />
      <ModalExport
        visible={exportModal}
        paths={fileInfo.path}
        onClose={async (flag, { reload }) => {
          setExportModal(flag);
          reload && setFileInfo(await getFileTree(path));
        }}
      />
      <ModalRename
        visible={renameModal}
        info={tapFile}
        onClose={async (flag, { reload, pClose }) => {
          setRenameModal(flag);
          pClose && setImportModal(false);
          reload && setFileInfo(await getFileTree(path));
        }}
      />
      <ModalDel
        visible={deltModal}
        info={tapFile}
        onClose={async (flag, { reload, pClose }) => {
          setDelModal(flag);
          pClose && setImportModal(false);
          reload && setFileInfo(await getFileTree(path));
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
  noPermissionWrap: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  permissionIcon: {
    color: '#ccc',
  },
  permissionText: {
    color: '#aaa',
    paddingTop: 8,
  },
  getPermissionBtn: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 3,
  },
  getPermissionText: {
    color: '#fff',
  },
});
