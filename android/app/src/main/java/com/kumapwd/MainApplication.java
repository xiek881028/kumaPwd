package com.kumapwd;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

import com.kumapwd.files.FilesPackage;
import com.kumapwd.exit.ExitPackage;
import com.kumapwd.share.SharePackage;
import com.kumapwd.backHold.BackHoldPackage;
import com.kumapwd.aliPay.AliPayPackage;
import com.kumapwd.fingerprint.FingerprintPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new FilesPackage(),
          new ExitPackage(),
          new SharePackage(),
          new BackHoldPackage(),
          new AliPayPackage(),
          new FingerprintPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
