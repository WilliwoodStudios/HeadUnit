package com.workshoptwelve.brainiac.boss.common.util;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Created by robwilliams on 15-08-18.
 */
public class FileUtil {
    public static String readFileAsString(File file) throws IOException {
        FileInputStream fis = new FileInputStream(file);
        try {
            byte[] buffer = new byte[20000];
            int readLength = 0;
            StringBuilder toReturn = new StringBuilder();
            do {
                readLength = fis.read(buffer);
                if (readLength > 0) {
                    toReturn.append(new String(buffer, 0, readLength));
                }
            } while (readLength > 0);
            return toReturn.toString();
        } finally {
            fis.close();
        }
    }

    public static JSONObject readFileAsJSONObject(File file) throws IOException, JSONException {
        return new JSONObject(readFileAsString(file));
    }
}
