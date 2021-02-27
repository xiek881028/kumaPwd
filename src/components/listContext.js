import React, { createContext } from 'react';
import { useLocalObservable } from 'mobx-react';

export const CtxList = createContext(null);


export default ({ children }) => {
  const active = useLocalObservable(() => ({
    active: null,
    centerIsShow: false,
    setFn(name, val) {
      active[name] = val;
    },
  }));

  return (
    <CtxList.Provider value={active}>
      {children}
    </CtxList.Provider>
  );
};
