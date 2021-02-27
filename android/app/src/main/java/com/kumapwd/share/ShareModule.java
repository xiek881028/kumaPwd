package com.kumapwd.share;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.File;
import java.util.Map;
import java.util.HashMap;

//import android.util.Log;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import androidx.core.content.FileProvider;
import android.media.MediaMetadataRetriever;
import android.net.Uri;

public class ShareModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "Share";

    public ShareModule(ReactApplicationContext reactContext) {
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
    public void shareFile(String title, String pathname) {
        Activity currentActivity = getCurrentActivity();
        File baseFile = new File(pathname);
        Intent share = new Intent(Intent.ACTION_SEND);
        Uri shareUri = FileProvider.getUriForFile(
            currentActivity,
            "com.kumapwd.fileprovider",
            baseFile
        );
        share.putExtra(Intent.EXTRA_STREAM, shareUri);
        share.setType(getMimeType(baseFile.getAbsolutePath()));
        share.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        currentActivity.startActivity(Intent.createChooser(share, title));
    }

    @ReactMethod
    public void shareText(String title, String text) {
        Activity currentActivity = getCurrentActivity();
        Intent share = new Intent(Intent.ACTION_SEND);
        share.putExtra(Intent.EXTRA_TEXT, text);
        share.setType("text/plain");
        currentActivity.startActivity(Intent.createChooser(share, title));
    }

    // 根据文件后缀名获得对应的MIME类型。
    private static String getMimeType(String filePath) {
        MediaMetadataRetriever mmr = new MediaMetadataRetriever();
        String mime = "*/*";
        if (filePath != null) {
            try {
                mmr.setDataSource(filePath);
                mime = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE);
            } catch (IllegalStateException e) {
                return mime;
            } catch (IllegalArgumentException e) {
                return mime;
            } catch (RuntimeException e) {
                return mime;
            }
        }
        return mime;
    }
}
