package com.kumapwd.fingerprint;

import android.app.Activity;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.Map;
import java.util.HashMap;

//import android.util.Log;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.wei.android.lib.fingerprintidentify.FingerprintIdentify;
import com.wei.android.lib.fingerprintidentify.base.BaseFingerprint;

public class FingerprintModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "Fingerprint";
    public static ReactContext myContext;
    private static int maxTimer = 5;
    private FingerprintIdentify fingerprint = new FingerprintIdentify(getReactApplicationContext());

    public FingerprintModule(ReactApplicationContext reactContext) {
        super(reactContext);
        fingerprint.init();
        myContext = reactContext;
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

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void isReady(Callback cb) {
        WritableMap returnJson = new WritableNativeMap();
        returnJson.putBoolean("flag", fingerprint.isFingerprintEnable());
        returnJson.putBoolean("isHardwareEnable", fingerprint.isHardwareEnable());
        returnJson.putBoolean("isRegisteredFingerprint", fingerprint.isRegisteredFingerprint());
        cb.invoke(returnJson);
    }

    @ReactMethod
    public void reset() {
        fingerprint.resumeIdentify();
    }

    @ReactMethod
    public void cancel() {
        fingerprint.cancelIdentify();
    }

    @ReactMethod
    public void toVerification() {
        fingerprint.startIdentify(maxTimer, new BaseFingerprint.IdentifyListener() {
            @Override
            public void onSucceed() {
                WritableMap event = Arguments.createMap();
                sendEvent(myContext, "onSucceed", event);
            }

            @Override
            public void onNotMatch(int availableTimes) {
                WritableMap event = Arguments.createMap();
                event.putInt("times", availableTimes);
                sendEvent(myContext, "onNotMatch", event);
            }

            @Override
            public void onFailed(boolean isDeviceLocked) {
                WritableMap event = Arguments.createMap();
                event.putBoolean("locked", isDeviceLocked);
                sendEvent(myContext, "onFailed", event);
            }

            @Override
            public void onStartFailedByDeviceLocked() {
                WritableMap event = Arguments.createMap();
                sendEvent(myContext, "onStartFailedByDeviceLocked", event);
            }
        });
    }
}
