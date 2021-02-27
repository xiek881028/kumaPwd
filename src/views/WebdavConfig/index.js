import React, { useState, useEffect, memo, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { encrypt, decrypt } from '../../helper/crypto';
import { observer } from 'mobx-react';
import BasePage from '../../components/basePage';
import style from '../../css/common.js';
import ItemSwitchWrap from './component/itemSwitchWrap';
import ItemTextWrap from './component/itemTextWrap';
import {
  setStorage,
  delStorage,
} from '../../helper';

export default memo(observer(({ navigation }) => {
  const { cls: webdavCls, comp, setWebdavFn, fastEntry, asyncTips, backup2Json, asyncHistory, webdavFlag } = useContext(CTX_WEBDAV);
  const { cls, setListFn, setTagFn } = useContext(CTX_LIST);
  const { pwd } = useContext(CTX_USER);
  const { setTipsFn } = useContext(CTX_TIPS);
  const { setLoadingFn } = useContext(CTX_LOADING);
  return (
    <BasePage>
      <ScrollView>
        <ItemSwitchWrap
          title='开启使用'
          sub=''
          value={webdavFlag}
          disabled={!comp}
          onValueChange={async val => {
            await setStorage('webdavFlag', val);
            setWebdavFn('webdavFlag', val);
          }}
        />
        <ItemTextWrap
          text='连接配置'
          line={true}
          onPress={() => {
            navigation.navigate('WebdavAccount');
          }}
        />
        {webdavFlag ? (
          <>
            <ItemTextWrap
              text='手动备份'
              sub='修改密码后如果更新WebDAV备份失败，请手动备份一次'
              line={true}
              onPress={async () => {
                setLoadingFn(true, '正在备份...');
                try {
                  const { homeDir } = webdavCls.getConfig();
                  await cls.cleanTag();
                  const list = await cls.getOriginList();
                  const tags = await cls.getOriginTag();
                  const exportObj = {};
                  exportObj.accountList = list;
                  exportObj.tags = tags;
                  await webdavCls.upload(`${homeDir}/backup_latest.kuma`, encrypt(JSON.stringify(exportObj), pwd), backup2Json ? false : asyncHistory);
                  await delStorage('accountChangeList');
                  await delStorage('tagChangeList');
                  await cls.initChangeLog();
                  setTipsFn('text', '备份成功');
                } catch (error) {
                  setTipsFn('text', '备份失败');
                }
                setLoadingFn(false, '');
              }}
            />
            <ItemTextWrap
              text='手动同步'
              sub='使用当前密码解密备份文件，修改密码会导致解密失败'
              onPress={async () => {
                setLoadingFn(true, '正在同步...');
                try {
                  const { homeDir } = webdavCls.getConfig();
                  const res = await webdavCls.download(`${homeDir}/backup_latest.kuma`, { format: 'text' });
                  const data = JSON.parse(decrypt(res, pwd));
                  await cls.asyncData(data);
                  setListFn(cls.viewList);
                  setTagFn(cls.tagViewList);
                  await delStorage('accountChangeList');
                  await delStorage('tagChangeList');
                  setTipsFn('text', '同步成功');
                } catch (error) {
                  setTipsFn('text', `同步失败${error?.response?.status == '404' ? '，未找到备份文件' : ''}`);
                }
                setLoadingFn(false, '');
              }}
            />
            <ItemSwitchWrap
              title='开启明文'
              sub='有被中间人攻击的风险，请谨慎配置（仅支持基础功能，不支持快捷入口、未同步提醒、保留历史）'
              onValueChange={async val => {
                await setStorage('backup2Json', val);
                setWebdavFn('backup2Json', val);
              }}
              value={backup2Json}
            />
            {backup2Json ? (
              <>
                <ItemTextWrap
                  text='明文备份'
                  onPress={async () => {
                    setLoadingFn(true, '正在备份...');
                    try {
                      const { homeDir } = webdavCls.getConfig();
                      await cls.cleanTag();
                      const list = await cls.getOriginList();
                      const out = [];
                      for (let i = 0, max = list.length; i < max; i++) {
                        // 解构，避免影响内存中的原始值
                        const el = { ...list[i] };
                        // 清除遗留无用数据
                        delete el.type;
                        el.pwd = decrypt(el.pwd, pwd);
                        out.push(el);
                      }
                      const tags = await cls.getOriginTag();
                      const exportObj = {};
                      exportObj.accountList = out;
                      exportObj.tags = tags;
                      await webdavCls.upload(`${homeDir}/backup_latest.json`, JSON.stringify(exportObj));
                      setTipsFn('text', '备份成功');
                    } catch (error) {
                      setTipsFn('text', '备份失败');
                    }
                    setLoadingFn(false, '');
                  }}
                />
                <ItemTextWrap
                  text='明文同步'
                  onPress={async () => {
                    setLoadingFn(true, '正在同步...');
                    try {
                      const { homeDir } = webdavCls.getConfig();
                      const res = await webdavCls.download(`${homeDir}/backup_latest.json`, { format: 'text' });
                      await cls.asyncData(res, pwd);
                      setListFn(cls.viewList);
                      setTagFn(cls.tagViewList);
                      setTipsFn('text', '同步成功');
                    } catch (error) {
                      setTipsFn('text', `同步失败${error?.response?.status == '404' ? '，未找到备份文件' : ''}`);
                    }
                    setLoadingFn(false, '');
                  }}
                />
              </>
            ) : null}
            <ItemSwitchWrap
              title='快捷入口'
              sub='在首页列表添加备份、同步选项'
              disabled={backup2Json}
              onValueChange={async val => {
                await setStorage('fastEntry', val);
                setWebdavFn('fastEntry', val);
              }}
              value={fastEntry}
            />
            <ItemSwitchWrap
              title='未同步提醒'
              sub='应用启动时，有未备份的本地改动时弹窗提醒'
              disabled={backup2Json}
              onValueChange={async val => {
                await setStorage('asyncTips', val);
                setWebdavFn('asyncTips', val);
              }}
              value={asyncTips}
            />
            <ItemSwitchWrap
              title='保留历史'
              sub='云端备份保留最近十次的改动'
              disabled={backup2Json}
              onValueChange={async val => {
                await setStorage('asyncHistory', val);
                setWebdavFn('asyncHistory', val);
              }}
              value={asyncHistory}
            />
          </>
        ) : null}
        <View style={[styles.bottom]}></View>
      </ScrollView>
    </BasePage>
  );
}));

const styles = StyleSheet.create({
  bottom: {
    paddingBottom: 36,
  },
});
