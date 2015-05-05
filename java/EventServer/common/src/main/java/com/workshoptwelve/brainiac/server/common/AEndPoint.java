package com.workshoptwelve.brainiac.server.common;

import com.workshoptwelve.brainiac.server.common.log.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-04-11.
 */
public abstract class AEndPoint {
    private String mPath;

    public AEndPoint(String path) {
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        while (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        mPath = path;
    }

    public String getPath() {
        return mPath;
    }

    protected static String unquote(String urlEncoded) throws UnsupportedEncodingException {
        return URLDecoder.decode(urlEncoded, "UTF-8");
    }

    protected static HashMap<String,String> getParams(String [] headerZeroParts) {
        // Log.d();

        String[] pathParts = headerZeroParts[1].split("\\?");
        String query = pathParts.length > 1 ? pathParts[1] : null;

        HashMap<String, String> params = new HashMap<>();
        if (query != null) {
            String[] queryParts = query.split("&");
            for (String queryPart : queryParts) {
                String nameValue[] = queryPart.split("=");
                try {
                    if (nameValue.length == 1) {
                        params.put(unquote(nameValue[0]), "");
                    } else if (nameValue.length == 2) {
                        params.put(unquote(nameValue[0]), unquote(nameValue[1]));
                    } else {
                        Log.d("Invalid name value:", nameValue);
                    }
                } catch (UnsupportedEncodingException use) {
                    Log.e("Could not decode URL parts", use);
                }
            }
        }

        return params;
    }

    public void execute(Socket client, List<String> headers, String[] headerZeroParts, InputStream inputStream, OutputStream outputStream) {
        Log.d();

        HashMap<String,String> params = getParams(headerZeroParts);

        JSONObject toReturn;
        try {
            try {
                toReturn = execute(headers, params);
                if (toReturn == null) {
                    toReturn = RESULT_ONE;
                }
            } catch (Exception e) {
                Log.e("Could not execute: ", e);
                toReturn = new JSONObject();
                toReturn.put("error", e.getClass().getName() + ": " + e.getMessage());
            }

            try {
                sendHeaders(200,"OK",outputStream);
                outputStream.write(toReturn.toString().getBytes());
            } catch (Exception e) {
                Log.e("Could not write response", e);
            }
        } catch (JSONException je) {
            Log.e("JSON exception trying to produce output", je);
        }
    }

    public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
        throw new IllegalStateException("Developer has not overloaded execute but has let it be called.");
    }

    protected int getInt(HashMap<String, String> params, String name) throws MissingParameterException, BadParameterException {
        String value = params.get(name);
        if (value == null) {
            throw new MissingParameterException(name);
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException nfe) {
            throw new BadParameterException(String.format("Param '%s' is not an integer", name));
        }
    }

    protected String getString(HashMap<String, String> params, String name) throws MissingParameterException {
        String value = params.get(name);
        if (value == null) {
            throw new MissingParameterException(name);
        }
        return value;
    }

    public static class MissingParameterException extends Exception {
        public MissingParameterException(String name) {
            super(String.format("Param '%s' not found.", name));
        }
    }

    public static class BadParameterException extends Exception {
        public BadParameterException(String message) {
            super(message);
        }
    }

    public static void sendHeaders(int errorCode, String message, OutputStream outputStream) throws IOException {
        sendHeaders(errorCode,message,null,outputStream);
    }

    private static final byte [] CR_LF = "\r\n".getBytes();
    private static final byte [] ACCESS_CONTROL_ALLOW_ORIGIN_ALL = "Access-Control-Allow-Origin: *".getBytes();

    public static void sendHeaders(int errorCode, String message, List<String> headers, OutputStream outputStream) throws IOException {
        outputStream.write(String.format("HTTP/1.0 %d %s",errorCode,message).getBytes());
        outputStream.write(CR_LF);
        if (headers!=null) {
            for (String header : headers) {
                outputStream.write(header.getBytes());
                outputStream.write(CR_LF);
            }
        }
        outputStream.write(ACCESS_CONTROL_ALLOW_ORIGIN_ALL);
        outputStream.write(CR_LF);
        outputStream.write(CR_LF);
    }

    private static final JSONObject RESULT_ONE = buildResultOne();

    private static JSONObject buildResultOne() {
        try {
            JSONObject toReturn = new JSONObject();
            toReturn.put("result", 1);
            return toReturn;
        } catch (JSONException je) {
            Log.e("Could not create required static JSON object");
            return null;
        }
    }
}
