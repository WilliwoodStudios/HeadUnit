package com.workshoptwelve.brainiac.boss;

import android.content.Context;

import com.workshoptwelve.brainiac.boss.common.error.BossError;
import com.workshoptwelve.brainiac.boss.common.error.BossException;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpInputStream;
import com.workshoptwelve.brainiac.boss.common.server.stream.HttpOutputStream;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.net.Socket;
import java.util.HashMap;
import java.util.List;

/**
 * Created by robwilliams on 15-10-02.
 */
public class ContentUpdateService extends AService {
    private static ContentUpdateService instance;
    private static Log log = Log.getLogger(ContentUpdateService.class);
    private final File mContentRoot;

    private Context mContext;

    public ContentUpdateService(Context context) {
        super("/brainiac/content");

        mContext = context;

        addEndPoint(mUpdateEndPoint);
        addEndPoint(mDeleteEndPoint);


        mContentRoot = new File(context.getFilesDir(),"content");
        if (!mContentRoot.exists()) {
            mContentRoot.mkdir();
        }
        log.e("Full path", mContentRoot.getAbsolutePath());
    }

    private AEndPoint mDeleteEndPoint = new AEndPoint("delete") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws BossException, JSONException {
            String path = params.get("path");
            if (path == null) {
                throw new BossException(BossError.PARAMETER_MISSING,"path");
            }
            log.e("Delete",path);
            if (path.indexOf("..")!=-1) {
                throw new BossException(BossError.PARAMETER_BAD,"path has ..");
            }
            File toDelete = new File(mContentRoot,path);
            toDelete.delete();
            return buildResultOne();
        }
    };

    private AEndPoint mUpdateEndPoint = new AEndPoint("update") {
        @Override
        public void execute(Socket client, List<String> headers, String[] headerZeroParts, HttpInputStream inputStream, HttpOutputStream outputStream) throws JSONException, BossException {
            try {
                HashMap<String, String> params = getParams(headerZeroParts);

                String path = params.get("path");
                if (path.indexOf("..")!=-1) {
                    throw new BossException(BossError.PARAMETER_BAD,"path has ..");
                }
                if (path == null) {
                    throw new BossException(BossError.PARAMETER_MISSING,"path");
                }

                for (String header: headers) {
                    if (header.toLowerCase().startsWith("content-length:")) {
                        int length = Integer.parseInt(header.substring(header.indexOf(": ")+2));
                        log.e("Length is",length);

                        byte [] buffer = new byte[20000];

                        File toWrite = new File(mContentRoot,path);
                        toWrite.getParentFile().mkdirs();

                        FileOutputStream fos = new FileOutputStream(toWrite);
                        try {
                            int totalReadLength = 0;
                            do {
                                int toRead = buffer.length;
                                log.e("To read", toRead);
                                int remaining = length - totalReadLength;
                                if (remaining < toRead) {
                                    toRead = remaining;
                                }
                                if (toRead == 0) {
                                    break;
                                }
                                log.e("about to read");
                                int read = inputStream.read(buffer, 0, toRead);
                                log.e("Finished read with", read);
                                if (read < 0) {
                                    break;
                                }
                                fos.write(buffer,0,read);
                                totalReadLength += read;
                            } while (true);
                        } finally {
                            fos.close();
                        }
                    }
                }

                outputStream.setResponse(200,"File uploaded/updated");
                outputStream.write("{\"result\":1}".getBytes());
            } catch (Exception e) {
                log.e("Could not send response",e);
            }
        }
    };

    public static ContentUpdateService getInstance(Context context) {
        if (sInstance != null) {
            return sInstance;
        }
        return sInstance = new ContentUpdateService(context);
    }

    private static ContentUpdateService sInstance;
}
