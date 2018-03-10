package com.kumapwd;

/**
 * Created by dell on 2018/2/28.
 */

public class GlobalVal {
    public static int backCloseTime = 1000 * 30;

    public void setBackCloseTime(int newTime){
        backCloseTime = newTime;
    }

    public int getBackCloseTime(){
        return backCloseTime;
    }
}
