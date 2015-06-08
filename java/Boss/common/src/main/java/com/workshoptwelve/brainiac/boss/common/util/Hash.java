package com.workshoptwelve.brainiac.boss.common.util;

import java.security.MessageDigest;

public class Hash {
    public static String sha1(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA1");
            md.update(value.getBytes());
            byte[] digest = md.digest();
            String toReturn = "";
            for (byte x : digest) {
                if ((x & 0xff) < 16) {
                    toReturn += "0";
                }
                toReturn += Integer.toString(x & 0xff,16);
            }
            return toReturn;
        } catch (Exception e) {
            return value;
        }
    }
}
