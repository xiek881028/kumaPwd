import React, { useState, useContext, forwardRef, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import { observer } from 'mobx-react';
import {
  initMkdir,
  getTimerFileName,
  fileIsExists,
  checkAndRequestPermissionAndroid,
} from '../../../helper';
import FilesAndroid from '../../../NativeModules/FilesAndroid';
import ShareAndroid from '../../../NativeModules/ShareAndroid';
import ModalBase from '../../../components/modalBase';
import Button from '../../../components/button';

//Css
import style from '../../../css/common.js';

export default memo(observer(forwardRef(({ visible, onClose }, ref) => {
  console.log(`~~~忘记密码组件被渲染~~~`);
  const [exportList, setExportList] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [exportListPath, setExportListPath] = useState('');
  const { fontSize, backgroundColor } = useContext(CTX_THEME);
  const exportListFn = async () => {
    let dirInit = await initMkdir('beifen');
    let rootFile = dirInit.rootFile;
    let arrList;
    let printStr = '';
    try {
      arrList = await storage.getAllDataForKey('accountList');
    } catch (err) {
      arrList = [];
    }
    arrList.map((item) => {
      printStr += `名称：${item.name}\r\n账号：${item.account}\r\n\r\n`;
    });
    printStr += `\r\n`;
    let exportFile = `/${await getTimerFileName('账户列表')}.txt`;
    FilesAndroid.writeFile(rootFile, exportFile, printStr, false, d => {
      setExportList(true);
      setExportListPath(rootFile + exportFile);
    });
  }
  return (
    <ModalBase
      ref={ref}
      visible={visible}
      onClose={() => {
        setHasPermission(null);
        (onClose ?? (() => { }))(false);
      }}
    >
      <View
        style={style.modalBox}
      >
        <Text style={[style.modalTitle, { fontSize: fontSize * 1.2 }]}>提示</Text>
        {
          exportList ?
            <ScrollView contentContainerStyle={[style.modalContent]}>
              <Text style={[styles.modalText, { fontSize }]}>账号列表已成功导出到 {exportListPath} 。</Text>
              <Text style={[styles.warningText, { fontSize }]}>您可以点击发送按钮发送列表文件到其它应用中查看。</Text>
            </ScrollView>
            :
            hasPermission == false ?
              <ScrollView contentContainerStyle={[style.modalContent]}>
                <Text style={[styles.modalText, { fontSize }]}>未能获取相关权限，导出失败。</Text>
              </ScrollView>
              :
              <ScrollView contentContainerStyle={[style.modalContent]}>
                <Text style={[styles.modalText, { fontSize }]}>十分抱歉，应用无法提供密码找回功能。</Text>
                <Text style={[styles.modalText, { fontSize }]}>但我们可以帮您导出一份账号列表，您可以根据列表手动找回密码。</Text>
                <Text style={[styles.modalText, { fontSize }]}>导出列表功能需要获取您设备的存储权限。如果弹出权限申请，请同意。</Text>
                <Text style={[styles.modalText, { fontSize }]}>确定导出列表吗？</Text>
              </ScrollView>
        }
        {
          exportList ?
            <View style={style.modalFooter}>
              <Button
                mode='android'
                androidColor={style.btnSubHeightBg.backgroundColor}
                style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
                underlayColor={style.btnSubHeightBg.backgroundColor}
                onPress={() => (onClose ?? (() => { }))(false)}
              >
                <Text
                  style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
                >取消</Text>
              </Button>
              <Button
                mode='android'
                androidColor={backgroundColor}
                style={[style.modalFooterBtnbox, { backgroundColor }]}
                underlayColor={backgroundColor}
                onPress={async () => {
                  const { data } = await fileIsExists(exportListPath);
                  if (data) {
                    ShareAndroid.shareFile(`发送账号列表`, exportListPath);
                    (onClose ?? (() => { }))(false);
                  }
                }}
              >
                <Text
                  style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
                >发送</Text>
              </Button>
            </View>
            :
            hasPermission == false ?
              <View style={style.modalFooter}>
                <Button
                  mode='android'
                  androidColor={style.btnSubHeightBg.backgroundColor}
                  style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
                  underlayColor={style.btnSubHeightBg.backgroundColor}
                  onPress={() => {
                    setHasPermission(null);
                    (onClose ?? (() => { }))(false);
                  }}
                >
                  <Text
                    style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
                  >关闭</Text>
                </Button>
              </View>
              :
              <View style={style.modalFooter}>
                <Button
                  mode='android'
                  androidColor={style.btnSubHeightBg.backgroundColor}
                  style={[style.btnSubBg, style.modalFooterBtnbox, style.modalSubBtnbox, { borderTopColor: style.btnSubBg.borderColor }]}
                  underlayColor={style.btnSubHeightBg.backgroundColor}
                  onPress={() => (onClose ?? (() => { }))(false)}
                >
                  <Text
                    style={[style.modalFooterBtn, style.btnSubColor, { fontSize }]}
                  >取消</Text>
                </Button>
                <Button
                  mode='android'
                  androidColor={backgroundColor}
                  style={[style.modalFooterBtnbox, { backgroundColor }]}
                  underlayColor={backgroundColor}
                  onPress={async () => {
                    if (OS == 'android') {
                      const result = await checkAndRequestPermissionAndroid([
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                      ]);
                      if (result) {
                        exportListFn();
                      } else {
                        setHasPermission(false);
                      }
                    }
                  }}
                >
                  <Text
                    style={[style.btnColor, style.modalFooterBtn, { fontSize }]}
                  >确定</Text>
                </Button>
              </View>
        }
      </View>
    </ModalBase>
  );
})), (prev, next) => {
  return prev.visible === next.visible;
});

const styles = StyleSheet.create({
  modalText: {
    paddingVertical: 5,
  },
  warningText: {
    color: '#E64340',
  },
});
