package com.kumapwd.aliPay;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map;
import java.util.HashMap;

//import android.util.Log;

public class AliPayModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "AliPay";

    public AliPayModule(ReactApplicationContext reactContext) {
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

    public boolean openUri(String s) {
        boolean returnBool;
        Activity currentActivity = getCurrentActivity();
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(s));
        ComponentName componentName = intent.resolveActivity(currentActivity.getPackageManager());
        if(componentName == null){
            returnBool = false;
        }else{
            currentActivity.startActivity(intent);
            returnBool = true;
        }
        return returnBool;
    }

    @ReactMethod
    public void pay(String qrCode, Callback cb) {
        WritableMap returnJson = new WritableNativeMap();
        boolean flag;
        try {
            final String alipayQr = "alipayqr://platformapi/startapp?saId=10000007&clientVersion" +
                    "=3.7.0.0718&qrcode=" + URLEncoder.encode(qrCode, "utf-8") +
                    "%3F_s%3Dweb-other&_t=" + System.currentTimeMillis();
            flag = openUri(alipayQr);
            returnJson.putBoolean("flag", flag);
            returnJson.putString("message", flag?"success":"false");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            returnJson.putBoolean("flag", false);
            returnJson.putString("message", "false");
        }
        cb.invoke(returnJson);
    }
}
