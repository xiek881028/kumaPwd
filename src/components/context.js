import React, { createContext, useEffect, useState } from 'react';
import { runInAction } from 'mobx';
import { useLocalObservable } from 'mobx-react';
import {
  initTheme,
  getBackHoldFlag,
  getBackHoldTime,
  getBackup2Json,
  getFastEntry,
  getAsyncTips,
  getWebdavFlag,
  getAsyncHistory,
  getEgg,
  getEggDone,
  delStorage,
} from '../helper';
import listCls from '../helper/list';
import webdavCls from '../helper/webdav';
import Color from 'color';
import { isProd } from '../config';
import BackHoldAndroid from '../NativeModules/BackHoldAndroid';

export const CtxTheme = createContext(null);
export const CtxUser = createContext(null);
export const CtxTips = createContext(null);
export const CtxList = createContext(null);
export const CtxLoading = createContext(null);
export const CtxWebdav = createContext(null);
export const CtxEgg = createContext(null);


export default ({ children }) => {
  // theme 相关
  const [initThemeFlag, setInitThemeFlag] = useState(false);
  const theme = useLocalObservable(() => ({
    setThemeFn(name, val) {
      theme[name] = val;
      if (name === 'backgroundColor') {
        const bgColor = Color(val);
        const rgb = bgColor.rgb().array();
        theme.backgroundDisabled = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.5)`;
      }
    },
  }));
  useEffect(() => {
    (async () => {
      const { fontSize, backgroundColor } = await initTheme();
      const bgColor = Color(backgroundColor);
      const rgb = bgColor.rgb().array();
      runInAction(() => {
        theme.fontSize = fontSize;
        theme.backgroundColor = backgroundColor;
        theme.backgroundDisabled = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.5)`;
        theme.fontDisabled = Color('#fff').darken(.05).hex();
        setInitThemeFlag(true);
      });
    })();
  }, []);

  // user 相关
  const [initUser, setInitUser] = useState(false);
  const user = useLocalObservable(() => ({
    setUserFn(name, val) {
      user[name] = val;
    },
  }));
  useEffect(() => {
    runInAction(async () => {
      let pwd;
      //进行后台留存设置task
      BackHoldAndroid.setBackHoldTime(await getBackHoldFlag() ? +await getBackHoldTime() : 10);
      try {
        pwd = await storage.load({ key: 'Password' });
      } catch (error) {
        pwd = undefined;
      }
      user.pwd = pwd;
      user.isLogin = !isProd;
      setInitUser(true);
    });
  }, []);

  // tips相关
  const tips = useLocalObservable(() => ({
    setTipsFn(name, val) {
      tips[name] = val;
    },
  }));
  useEffect(() => {
    runInAction(() => {
      // 默认展示2500ms
      tips.timer = 2500;
      tips.text = '';
    });
  }, []);

  // loading相关
  const loading = useLocalObservable(() => ({
    setLoadingFn(show, text) {
      loading.set = {
        text,
        show,
      };
    },
    setLoadingOpsFn(ops) {
      loading.ops = ops;
    },
  }));
  useEffect(() => {
    runInAction(() => {
      loading.set = {
        text: '',
        show: false,
      };
      loading.ops = {
        delay: 300,
      };
    });
  }, []);

  // webdav相关
  const webdav = useLocalObservable(() => ({
    setWebdavFn(name, val) {
      webdav[name] = val;
    },
    comp: false,
    fastEntry: false,
    asyncTips: false,
    backup2Json: false,
    webdavFlag: false,
    asyncHistory: false,
  }));
  useEffect(() => {
    console.log('user.pwd: ', user.pwd);
    if (user.pwd && tips) {
      runInAction(async () => {
        let cfg = {};
        const fastEntry = await getFastEntry();
        const asyncTips = await getAsyncTips();
        const backup2Json = await getBackup2Json();
        const webdavFlag = await getWebdavFlag();
        const asyncHistory = await getAsyncHistory();
        try {
          cfg = await webdavCls.getOriginConfig(user.pwd);
        } catch (err) {
          tips.setTipsFn('text', err);
        }
        runInAction(() => {
          webdav.cls = new webdavCls(cfg);
          webdav.comp = webdav.cls.complete;
          webdav.webdavFlag = webdavFlag;
          webdav.fastEntry = fastEntry;
          webdav.asyncTips = asyncTips;
          webdav.backup2Json = backup2Json;
          webdav.asyncHistory = asyncHistory;
        });
      });
    }
  }, [user.pwd, tips]);

  // list相关
  const list = useLocalObservable(() => ({
    setListFn(val) {
      list.list = val;
    },
    setTagFn(val) {
      list.tagList = val;
    },
  }));
  useEffect(() => {
    (async () => {
      const cls = await new listCls();
      runInAction(async () => {
        list.cls = cls;
        list.list = list.cls.viewList;
        list.tagList = list.cls.tagViewList;
      });
    })();
  }, []);

  // egg相关
  const egg = useLocalObservable(() => ({
    setEggFn(name, val) {
      egg[name] = name === 'flag' ? egg.done && val : val;
    },
  }));
  useEffect(() => {
    (async () => {
      const flag = await getEgg();
      const eggDone = await getEggDone();
      runInAction(async () => {
        egg.flag = eggDone && flag;
        egg.done = eggDone;
      });
    })();
  }, []);

  return initThemeFlag ? (
    <CtxTheme.Provider value={theme}>
      {initUser ? (<CtxUser.Provider value={user}>
        <CtxTips.Provider value={tips}>
          <CtxLoading.Provider value={loading}>
            <CtxList.Provider value={list}>
              <CtxWebdav.Provider value={webdav}>
                <CtxEgg.Provider value={egg}>
                  {children}
                </CtxEgg.Provider>
              </CtxWebdav.Provider>
            </CtxList.Provider>
          </CtxLoading.Provider>
        </CtxTips.Provider>
      </CtxUser.Provider>) : null}
    </CtxTheme.Provider>
  ) : null;
};
