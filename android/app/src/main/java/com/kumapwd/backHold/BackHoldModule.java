package com.kumapwd.backHold;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;

//import android.util.Log;
import com.kumapwd.GlobalVal;

public class BackHoldModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "BackHold";

    public BackHoldModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        return constants;
    }

    @ReactMethod
    public void setBackHoldTime(int time) {
        GlobalVal vals = new GlobalVal();
        vals.setBackCloseTime(time);
    }
}
