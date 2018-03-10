package com.kumapwd.files;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

import android.app.Activity;
import android.media.MediaScannerConnection;
import android.util.Log;
import android.os.Environment;

import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableMap;

public class FilesModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "Files";
    private static final String ROOT_PATH = Environment.getExternalStorageDirectory().getAbsolutePath();
    private static final String PREFIX = "BAGANIYIDINGYAOXINGFU";

    public FilesModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("ROOT_PATH", ROOT_PATH);
        return constants;
    }

    //删除文件
    @ReactMethod
    public void delFile(String pathname, Callback cb) {
        javaDelFile(pathname);
        WritableMap returnJson = new WritableNativeMap();
        returnJson.putBoolean("flag", true);
        returnJson.putString("message", "deleted");
        cb.invoke(returnJson);
    }

    public void javaDelFile(String pathname) {
        File baseFile = new File(pathname);
        baseFile.delete();
    }

    //读取文件
    @ReactMethod
    public void readFile(String pathname, Callback cb) {
        File baseFile = new File(pathname);
        WritableMap returnJson = new WritableNativeMap();
        try {
            FileInputStream fis = new FileInputStream(baseFile);
            fis.skip((long)PREFIX.length());
            InputStreamReader isr = new InputStreamReader(fis, "utf-8");
            StringBuffer sb = new StringBuffer();
            while (isr.ready()){
                sb.append((char) isr.read());
            }
            returnJson.putBoolean("flag", true);
            returnJson.putString("message", "success");
            returnJson.putString("data", sb.toString());
            isr.close();
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
            returnJson.putBoolean("flag", false);
            returnJson.putString("message", "error");
        }
        cb.invoke(returnJson);
    }

    //文件权限判断
    @ReactMethod
    public void isBackupFile(String pathname, Callback cb){
        File baseFile = new File(pathname);
        Boolean isExists = baseFile.exists();
        WritableMap returnJson = new WritableNativeMap();
        boolean fileFlag = true;
        /*
            00 成功
            01 文件前缀不符合
            02 没有读权限
            03 没有写权限
            04 文件不存在
        */
        if(isExists){
            if(!baseFile.canRead()){
                fileFlag = false;
                returnJson.putString("code", "02");
                returnJson.putString("message", "can't read");
            }
            if(!baseFile.canWrite()){
                fileFlag = false;
                returnJson.putString("code", "03");
                returnJson.putString("message", "can't write");
            }
            returnJson.putBoolean("flag", fileFlag);
            if(!fileFlag){
                cb.invoke(returnJson);
                return;
            }
            try {
                FileInputStream fis = new FileInputStream(baseFile);
                InputStreamReader isr = new InputStreamReader(fis, "utf-8");
                StringBuffer sb = new StringBuffer();
                if(isr.ready()){
                    for(int index=0; index < PREFIX.length(); index++){
                        sb.append((char) isr.read());
                        if(!sb.toString().equals(PREFIX.substring(0, index+1))){
                            fileFlag = false;
                            break;
                        }
                    }
                }
                returnJson.putBoolean("flag", fileFlag);
                if(fileFlag){
                    returnJson.putString("code", "00");
                    returnJson.putString("message", "success");
                }else{
                    returnJson.putString("code", "01");
                    returnJson.putString("message", "file error");
                }
                isr.close();
                fis.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else{
            returnJson.putBoolean("flag", false);
            returnJson.putString("code", "04");
            returnJson.putString("message", "path is not exists");
        }
        cb.invoke(returnJson);
    }

    //写入文件
    @ReactMethod
    public void writeFile(String pathname, String filename, String text, boolean prefix, Callback cb) {
        boolean writeFlag = javaWriteFile(pathname, filename, text, prefix);
        WritableMap returnJson = new WritableNativeMap();
        if(writeFlag){
            returnJson.putBoolean("flag", true);
            returnJson.putString("message", "success");
        }else{
            returnJson.putBoolean("flag", false);
            returnJson.putString("message", "path is not exists");
        }
        cb.invoke(returnJson);
    }

    public boolean javaWriteFile(String pathname, String filename, String text, boolean prefix) {
        Activity currentActivity = getCurrentActivity();
        File baseFile = new File(pathname);
        Boolean isExists = baseFile.exists();
        Boolean returnFlag = false;
        if(isExists){
            File saveFile = new File((pathname.length()==0?ROOT_PATH:pathname)+filename);
            try {
                FileOutputStream fos = new FileOutputStream(saveFile);
                OutputStreamWriter osw = new OutputStreamWriter(fos, "utf-8");
                osw.write((prefix ? PREFIX : "") + text);
                osw.flush();
                fos.flush();
                osw.close();
                fos.close();
                MediaScannerConnection.scanFile(currentActivity, new String[]{pathname+filename}, null, null);
                returnFlag = true;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else{
            returnFlag = false;
        }
        return returnFlag;
    }

    //判断文件是否存在
    @ReactMethod
    public void isExists(String pathname, Callback cb) {
        File baseFile = new File(pathname);
        Boolean isExists = baseFile.exists();
        WritableMap returnJson = new WritableNativeMap();
        returnJson.putBoolean("flag", true);
        returnJson.putBoolean("data", isExists);
        returnJson.putString("message", (isExists?"path is exists":"path is not exists"));
        cb.invoke(returnJson);
    }

    //文件重命名
    @ReactMethod
    public void rename(String pathname, String newpath, Callback cb) {
        File baseFile = new File(pathname);
        File newFile = new File(newpath);
        Boolean isExists = newFile.exists();
        WritableMap returnJson = new WritableNativeMap();
        /*
        code:
        00: 重命名文件成功
        01: 重命名文件失败
        02: 重命名文件已存在同名文件
         */
        if(isExists){
            returnJson.putBoolean("flag", false);
            returnJson.putString("code", "02");
            returnJson.putString("message", "path is exists");
        }else{
            boolean rename = baseFile.renameTo(newFile);
            if(rename){
                returnJson.putString("code", "00");
                returnJson.putString("message", "rename success");
            }else{
                returnJson.putString("code", "01");
                returnJson.putString("message", "rename false");
            }
            returnJson.putBoolean("flag", rename);
        }
        cb.invoke(returnJson);
    }

    //创建文件夹
    @ReactMethod
    public void mkdir(String pathname, Callback cb) {
        File baseFile = new File(pathname);
        WritableMap returnJson = new WritableNativeMap();
        Activity currentActivity = getCurrentActivity();
        if (baseFile != null) {
            if(baseFile.exists()){
                returnJson.putString("message", "path is exists");
            }else{
                returnJson.putString("message", "success");
                returnJson.putBoolean("data", baseFile.mkdirs());
                MediaScannerConnection.scanFile(currentActivity, new String[]{pathname}, null, null);
            }
            returnJson.putBoolean("flag", true);
        }else{
            returnJson.putBoolean("flag", false);
            returnJson.putString("message", "path is null");
        }
        cb.invoke(returnJson);
    }

    //获取文件树
    @ReactMethod
    public void getFilesTree(String pathname, Callback successCb) {
        File baseFile = new File(pathname.length()==0?ROOT_PATH:pathname);
        WritableMap fileList = new WritableNativeMap();
        if (baseFile != null && baseFile.exists()) {
            if (baseFile.isDirectory()) {
                File[] fileArray = baseFile.listFiles();
                if (fileArray != null) {
                    WritableArray listArray = new WritableNativeArray();
                    WritableMap listJson = new WritableNativeMap();
                    String fatherPath = pathname.length()==0||pathname.equals(ROOT_PATH)?"":baseFile.getParentFile().getPath();
                    ArrayList listArr = new ArrayList();
                    Calendar cal = Calendar.getInstance();
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    for (int i = 0; i < fileArray.length; i++) {
                        listArr.add(fileArray[i]);
                        WritableMap jsonFolder = new WritableNativeMap();
                        jsonFolder.putString("name", fileArray[i].getName());
                        jsonFolder.putString("path", fileArray[i].getPath());
                        jsonFolder.putString("mode", fileArray[i].isDirectory() ? "folder" : "file");
                        cal.setTimeInMillis(fileArray[i].lastModified());
                        jsonFolder.putString("lastTime", formatter.format(cal.getTime()));
                        listJson.putMap(fileArray[i].getPath(), jsonFolder);
                    }
                    Collections.sort(listArr, new Comparator<File>() {

                        @Override
                        public int compare(File o1, File o2) {
                            if(o1.isDirectory() && o2.isFile())
                                return -1;
                            if(o1.isFile() && o2.isDirectory())
                                return 1;
                            return o1.getName().compareToIgnoreCase(o2.getName());
                        }
                    });
                    for(int i=0; i<listArr.size(); i++){
                        listArray.pushString(listArr.get(i).toString());
                    };
                    fileList.putBoolean("flag", true);
                    fileList.putString("message", "success");
                    fileList.putArray("sort", listArray);
                    fileList.putString("prev", fatherPath);
                    fileList.putMap("data", listJson);
                } else {
                    WritableArray arrayEmpty = new WritableNativeArray();
                    WritableMap jsonEmpty = new WritableNativeMap();
                    fileList.putBoolean("flag", true);
                    fileList.putString("message", "is empty");
                    fileList.putArray("sort", arrayEmpty);
                    fileList.putMap("data", jsonEmpty);
                }
            } else {
                fileList.putBoolean("flag", false);
                fileList.putString("fileName", baseFile.getName());
                fileList.putString("filePath", baseFile.getParent());
                fileList.putString("message", "is file");
            }
        }else{
            fileList.putBoolean("flag", false);
            fileList.putString("message", "no path");
        }
        successCb.invoke(fileList);
    }
}
