package com.kumapwd.exit;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;

//import android.util.Log;
import android.os.Process;

public class ExitModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "ExitApp";

    public ExitModule(ReactApplicationContext reactContext) {
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
    public void exit() {
        Process.killProcess(Process.myPid());
        System.exit(0);
    }
}
