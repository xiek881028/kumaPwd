package com.kumapwd;

import android.os.Process;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import com.kumapwd.GlobalVal;

import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends ReactActivity {

    static boolean timeFlag = false;
    Timer timer = new Timer();
    TimerTask task;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "kumaPwd";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    @Override
    protected void onStart() {
        super.onStart();
        if(timeFlag){
            timeFlag = false;
            try{
                task.cancel();
            }catch (Exception e){};
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        GlobalVal vals = new GlobalVal();
        try{
            task.cancel();
        }catch (Exception e){};
        task = new TimerTask() {
            @Override
            public void run() {
                timeFlag = false;
                Process.killProcess(Process.myPid());
                System.exit(0);
                }
            };
        timer.schedule(task, vals.getBackCloseTime());
        timeFlag = true;
    }

    @Override
     protected void onDestroy() {
         super.onDestroy();
        if(timeFlag){
            timeFlag = false;
            timer.cancel();
        }
     }
}
