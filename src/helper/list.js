import {
  setStorage,
  delStorage,
  getAccountChangeList,
  getTagChangeList,
} from './index';
import { encrypt } from '../helper/crypto';
export default class List {
  ABC = new Set(['like', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']);
  viewList = [];
  tagViewList = [];
  dataMap = new Map();
  originMap = new Map();
  tagOriginMap = new Map();
  accountChangeMap = new Map();
  tagChangeMap = new Map();

  constructor() {
    // 初始化，获取数据并排序后返回this
    return (async () => {
      await this.init();
      // 清理冗余的账号数据
      await this.cleanTag();
      await this.initChangeLog();
      return this;
    })();
  }
  async init() {
    // 处理列表数据
    viewList = [];
    dataMap = new Map();
    originMap = new Map();
    this.initListFn();
    let originList = await this.getOriginList();
    for (let i = 0, max = originList.length; i < max; i++) {
      // 必须解构，否则会影响内存中的原始值，与storage取值方式有关
      const el = { ...originList[i] };
      const flag = el.star ? 'like' : el.pinyin;
      this.dataMap.set(flag, this.dataMap.get(flag).concat(el));
      this.originMap.set(el.id, el);
    }
    this.viewList = this.pruneAndSortEmpty();
    await this.initTag();
  }
  async initTag() {
    this.tagOriginMap = new Map();
    // 处理tag数据
    let tagList = await this.getOriginTag();
    for (let i = 0, max = tagList.length; i < max; i++) {
      const el = tagList[i];
      this.tagOriginMap.set(el.id, el);
    }
    this.tagViewList = tagList.sort((s1, s2) => {
      return (s1.index ?? -1) > (s2.index ?? -1);
    });
  }
  async initChangeLog() {
    let accountChange = await getAccountChangeList();
    let tagChange = await getTagChangeList();
    if (accountChange === null) {
      accountChange = await this.getOriginList();
      await setStorage('accountChangeList', accountChange);
    }
    if (tagChange === null) {
      tagChange = await this.getOriginTag();
      await setStorage('tagChangeList', tagChange);
    }
    (accountChange ?? []).map(item => {
      this.accountChangeMap.set(item.id, item);
    });
    (tagChange ?? []).map(item => {
      this.tagChangeMap.set(item.id, item);
    });
  }
  // 获取未同步的改动
  async getAllChange() {
    // await delStorage('accountChangeList');
    // await delStorage('tagChangeList');
    const account = await this.getAccountChange();
    const tag = await this.getTagChange();
    return { flag: account.flag || tag.flag, len: account.len + tag.len, data: { account, tag } };
  }
  // 获取账号未同步改动
  async getAccountChange() {
    const keyObj = {
      name: '名称',
      account: '账号',
      pwd: '密码',
      star: '置顶',
    };
    const add = [];
    const del = [];
    const change = [];
    const allChange = [];
    this.originMap.forEach(item => {
      const changeItem = this.accountChangeMap.get(item.id);
      if (changeItem) {
        const changeList = [];
        Object.keys(item).map(key => {
          if (key === 'tags') {
            // 理论上accountList里不会有tags，但遇到了一次，不排除脏数据影响，忽略tags
          } else if (key !== 'id' && key !== 'pinyin' && item[key] !== changeItem[key]) {
            changeList.push({ prev: changeItem[key], next: item[key], key, keyName: keyObj[key] });
            allChange.push({ name: item.name, account: item.account, key, keyName: keyObj[key], mode: 'edit' });
          }
        });
        changeList.length && change.push({ name: item.name, account: item.account, changeList });
      } else {
        add.push({ name: item.name, account: item.account });
        allChange.push({ name: item.name, account: item.account, mode: 'add' });
      }
    });
    this.accountChangeMap.forEach(item => {
      if (!this.originMap.has(item.id)) {
        del.push({ name: item.name, account: item.account });
        allChange.push({ name: item.name, account: item.account, mode: 'del' });
      }
    });
    const data = {};
    const addLen = add.length;
    const delLen = del.length;
    const changeLen = change.length;
    if (addLen) data.add = { len: addLen, data: add, mode: '新增' };
    if (delLen) data.del = { len: delLen, data: del, mode: '删除' };
    if (changeLen) data.change = { len: changeLen, data: change, mode: '修改' };
    return { flag: !!(addLen || delLen || changeLen), len: addLen + delLen + changeLen, data, name: '账号', allChange };
  }
  // 获取tag未同步改动
  async getTagChange() {
    const keyObj = {
      name: '名称',
      index: '排序',
      accountList: '拥有账号列表',
    };
    const add = [];
    const del = [];
    const change = [];
    const allChange = [];
    this.tagOriginMap.forEach(item => {
      const changeItem = this.tagChangeMap.get(item.id);
      if (changeItem) {
        const changeList = [];
        Object.keys(item).map(key => {
          if (key === 'accountList') {
            const prev = changeItem[key];
            const next = item[key];
            if (prev.length !== next.length) {
              changeList.push({ prev, next, key });
              allChange.push({ name: item.name, key, keyName: keyObj[key], mode: 'edit' });
            } else {
              const nextSet = new Set(next);
              // 取交集
              const intersection = prev.filter(v => nextSet.has(v));
              // 交集与元素据个数不匹配，必定有修改
              if (intersection.length !== prev.length) {
                changeList.push({ prev, next, key, keyName: keyObj[key] });
                allChange.push({ name: item.name, key, keyName: keyObj[key], mode: 'edit' });
              }
            }
          } else if (key !== 'id' && item[key] !== changeItem[key]) {
            changeList.push({ prev: changeItem[key], next: item[key], key, keyName: keyObj[key] });
            allChange.push({ name: item.name, key, keyName: keyObj[key], mode: 'edit' });
          }
        });
        changeList.length && change.push({ name: item.name, changeList });
      } else {
        add.push({ name: item.name });
        allChange.push({ name: item.name, mode: 'add' });
      }
    });
    this.tagChangeMap.forEach(item => {
      if (!this.tagOriginMap.has(item.id)) {
        del.push({ name: item.name });
        allChange.push({ name: item.name, mode: 'del' });
      }
    });
    const data = {};
    const addLen = add.length;
    const delLen = del.length;
    const changeLen = change.length;
    if (addLen) data.add = { len: addLen, data: add, mode: '新增' };
    if (delLen) data.del = { len: delLen, data: del, mode: '删除' };
    if (changeLen) data.change = { len: changeLen, data: change, mode: '修改' };
    return { flag: !!(addLen || delLen || changeLen), len: addLen + delLen + changeLen, data, name: '标签', allChange };
  }
  // 获取原始list
  getOriginList() {
    return new Promise(resolve => {
      storage
        .getAllDataForKey('accountList')
        .then(res => resolve(res));
    });
  }
  // 获取原始tag
  getOriginTag() {
    return new Promise(resolve => {
      storage
        .getAllDataForKey('tagList')
        .then(res => resolve(res));
    });
  }
  // 初始化list
  initListFn() {
    this.ABC.forEach(key => {
      this.dataMap.set(key, []);
    });
  }
  // 裁剪无数据的项并排序
  pruneAndSortEmpty() {
    const viewList = [];
    this.dataMap.forEach((val, key) => {
      if (val.length) {
        viewList.push({
          key,
          data: this.sortArr(val),
        });
      }
    });
    return viewList;
  }
  // 数据排序
  sortArr(arr = []) {
    return arr.sort((s1, s2) => {
      if (s1.pinyin !== s2.pinyin) {
        return s1.pinyin > s2.pinyin;
      } else {
        return s1.name > s2.name;
      }
    });
  }
  // 删除
  async del(id) {
    const active = this.details(id);
    if (!active) return;
    const { star, pinyin } = active;
    storage.remove({
      key: 'accountList',
      id,
    });
    const data = this.dataMap.get(star ? 'like' : pinyin);
    const delIndex = data.findIndex(item => item.id === id);
    delIndex != -1 && data.splice(delIndex, 1);
    this.originMap.delete(id);
    this.viewList = this.pruneAndSortEmpty();
  }
  // 加入收藏
  async toTop(id) {
    const active = this.details(id);
    if (!active) return;
    const { star, pinyin } = active;
    const likeArr = this.dataMap.get('like');
    const pinyinArr = this.dataMap.get(pinyin);
    const inArr = star ? likeArr : pinyinArr;
    const outArr = star ? pinyinArr : likeArr;
    active.star = !star;
    storage.save({
      key: 'accountList',
      id,
      data: active,
    });
    const delIndex = inArr.findIndex(item => item.id === id);
    delIndex != -1 && inArr.splice(delIndex, 1);
    outArr.push(active);
    this.sortArr(outArr);
    this.viewList = this.pruneAndSortEmpty();
  }
  details(id) {
    const details = this.originMap.get(id) ?? {};
    // 无序号的tag默认index为-1，放在最前展示
    details.tags = this.findTagById(details.id).sort((s1, s2) => (s1.index ?? -1) - (s2.index ?? -1));
    return details;
  }
  // 编辑账号
  async edit(data) {
    let active = this.details(data.id);
    if (!active) return;
    const { diffTagObj, ...other } = data;
    storage.save({
      key: 'accountList',
      id: data.id,
      data: other,
    });
    await this.diffTag(diffTagObj, data.id);
    // 优化提升不大，采用全量更新的方式简化逻辑
    await this.init();
  }
  // 新增账号
  async add(data, hasMore = true) {
    const { diffTagObj, ...other } = data;
    storage.save({
      key: 'accountList',
      id: data.id,
      data: other,
    });
    if (hasMore) {
      await this.diffTag(diffTagObj, data.id);
      // 优化提升不大，采用全量更新的方式简化逻辑
      await this.init();
    }
  }
  // 搜索列表
  searchList(text = '') {
    if (!text.length) {
      return [];
    }
    let searchArr = [];
    for (let i = 0, max = this.viewList.length; i < max; i++) {
      // viewList输出时经过裁剪，必定有data，不需要判断
      const { key, data } = this.viewList[i];
      let itemData = [];
      for (let j = 0, max = data.length; j < max; j++) {
        const child = data[j];
        if (child.name.indexOf(text) != -1 || child.account.indexOf(text) != -1) {
          itemData.push(child);
        }
      }
      if (itemData.length) {
        searchArr.push({
          key,
          data: itemData,
        });
      }
    }
    return searchArr;
  }
  // 多选列表项（tag选择账号有用到）
  activeList(ids = new Set()) {
    const outArr = [];
    if (!ids.size) {
      return this.viewList;
    }
    for (let i = 0, max = this.viewList.length; i < max; i++) {
      // viewList输出时经过裁剪，必定有data，不需要判断
      const { data, ...other } = this.viewList[i];
      let itemData = [];
      for (let j = 0, max = data.length; j < max; j++) {
        const child = { ...data[j] };
        if (ids.has(child.id)) {
          child.isActive = true;
        }
        itemData.push(child);
      }
      outArr.push({
        data: itemData,
        ...other,
      });
    }
    return outArr;
  }
  // 根据id生成viewList
  findListById(ids = [], hasKey = false) {
    const outArr = [];
    if (!ids.length) {
      return [];
    }
    const idsSet = new Set(ids);
    for (let i = 0, max = this.viewList.length; i < max; i++) {
      // viewList输出时经过裁剪，必定有data，不需要判断
      const { key, data } = this.viewList[i];
      let itemData = [];
      for (let j = 0, max = data.length; j < max; j++) {
        const child = data[j];
        if (idsSet.has(child.id)) {
          if (hasKey) {
            itemData.push(child);
          } else {
            outArr.push(child);
          }
        }
      }
      if (hasKey && itemData.length) {
        outArr.push({
          key,
          data: itemData,
        });
      }
    }
    return outArr;
  }
  // 获取tag详情
  tagDetails(id) {
    return this.tagOriginMap.get(id);
  }
  // 添加tag
  async tagAdd(data, init = true) {
    storage.save({
      key: 'tagList',
      id: data.id,
      data,
    });
    init && await this.init();
  }
  // 编辑tag
  async tagEdit(data, init = true) {
    let active = this.tagDetails(data.id);
    if (!active) return;
    storage.save({
      key: 'tagList',
      id: data.id,
      data,
    });
    init && await this.init();
  }
  // 排序tag
  async tagSort(data) {
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      const prevIndex = this.tagOriginMap.get(el.id).index ?? -1;
      el.index = i;
      await this.tagEdit(el, false);
    }
  }
  // 删除tag
  async tagDel(id) {
    const active = this.tagDetails(id);
    if (!active) return;
    storage.remove({
      key: 'tagList',
      id,
    });
    this.tagOriginMap.delete(id);
    const delIndex = this.tagViewList.findIndex(item => item.id === id);
    delIndex != -1 && this.tagViewList.splice(delIndex, 1);
  }
  // 根据id生成tagViewList（交集）
  findTagListById(ids = []) {
    let searchArr = [];
    if (!ids.length) {
      return [];
    }
    for (let i = 0, max = ids.length; i < max; i++) {
      const details = this.tagDetails(ids[i]);
      const account = details?.accountList ?? [];
      // 第一个空数组直接push
      i === 0 && searchArr.push(...account);
      searchArr = searchArr.filter(x => new Set(account).has(x));
    }
    return this.findListById(Array.from(new Set(searchArr)), true);
  }
  // 在tagList里清除冗余的list记录
  cleanTag() {
    const updateArr = [];
    this.tagOriginMap.forEach(item => {
      for (let i = 0, max = item.accountList.length; i < max; i++) {
        const el = item.accountList[i];
        if (!this.originMap.has(el)) {
          const itemSet = new Set(item.accountList);
          itemSet.delete(el);
          updateArr.push({
            ...item,
            accountList: Array.from(itemSet),
          });
        }
      }
    });
    for (let i = 0, max = updateArr.length; i < max; i++) {
      const data = updateArr[i];
      storage.save({
        key: 'tagList',
        id: data.id,
        data,
      });
    }
  }
  // 根据账号id查找tag
  findTagById(id = '') {
    const out = [];
    if (!id.length) return out;
    this.tagOriginMap.forEach(item => {
      const itemSet = new Set(item.accountList);
      if (itemSet.has(id)) {
        out.push(item);
      }
    });
    return out;
  }
  // 根据差异数组处理tag
  diffTag(diffTagObj, accountId) {
    const { add, del, _new } = diffTagObj;
    add.map(async item => {
      const details = this.tagDetails(item);
      details.accountList.push(accountId);
      await this.tagEdit(details, false);
    });
    del.map(async item => {
      const details = this.tagDetails(item);
      const delIndex = details.accountList.findIndex(item => item === accountId);
      delIndex != -1 && details.accountList.splice(delIndex, 1);
      await this.tagEdit(details, false);
    });
    _new.map(async item => {
      item.accountList = [accountId];
      await this.tagAdd(item, false);
    });
  }
  // 从远端同步数据
  async asyncData(data, pwdKey) {
    const _accList = await storage.getIdsForKey('accountList');
    const _tagList = await storage.getIdsForKey('tagList');
    const accSet = new Set(_accList);
    const tagSet = new Set(_tagList);
    for (let i = 0, max = data.accountList.length; i < max; i++) {
      const el = data.accountList[i];
      if (pwdKey) el.pwd = encrypt(el.pwd, pwdKey);
      await this.add(el, false);
      accSet.delete(el.id);
    }
    for (let i = 0, max = data.tags.length; i < max; i++) {
      const el = data.tags[i];
      await this.tagAdd(el, false);
      tagSet.delete(el.id);
    }
    accSet.forEach(id => {
      storage.remove({
        key: 'accountList',
        id,
      });
    });
    tagSet.forEach(id => {
      storage.remove({
        key: 'tagList',
        id,
      });
    });
    await setStorage('accountList', data.accountList);
    await setStorage('tagList', data.tags);
    await this.init();
  }
}
