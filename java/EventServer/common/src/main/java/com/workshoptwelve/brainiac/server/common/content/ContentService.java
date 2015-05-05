package com.workshoptwelve.brainiac.server.common.content;

import com.workshoptwelve.brainiac.server.common.AEndPoint;
import com.workshoptwelve.brainiac.server.common.AService;
import com.workshoptwelve.brainiac.server.common.log.Log;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.List;

/**
 * Created by robwilliams on 15-04-12.
 */
public class ContentService extends AService {
    private AContentServiceImpl mContentServiceImpl;

    public static ContentService getInstance() {
        return sInstance;
    }

    private static ContentService sInstance = new ContentService();

    ContentService() {
        super("www");
    }
    
    public void setContentServiceImpl(AContentServiceImpl contentServiceImpl) {
        mContentServiceImpl = contentServiceImpl;
    }

    @Override
    public void handleConnection(Socket connection, List<String> headers, String[] headerZero, InputStream inputStream, OutputStream outputStream) throws Exception {
        Log.d("Path: " + headers);
        String path = headerZero[1];
        if (path.startsWith("/www/")) {
            path = path.substring(5);

            if (path.contains("..")) {
                AEndPoint.sendHeaders(400, "Bad request - you got too many dots in your path dude",outputStream);
                return;
            }

            while(path.startsWith("/")) {
                path = path.substring(1);
            }

            mContentServiceImpl.sendPathToStream(path, outputStream);

        } else {
            AEndPoint.sendHeaders(404, "File not found", outputStream);
            return;
        }
    }
}
