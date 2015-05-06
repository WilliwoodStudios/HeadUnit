package com.workshoptwelve.brainiac.server.common.content;

import com.workshoptwelve.brainiac.server.common.AEndPoint;
import com.workshoptwelve.brainiac.server.common.AService;
import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.stream.HttpInputStream;
import com.workshoptwelve.brainiac.server.common.stream.HttpOutputStream;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.List;

/**
 * Created by robwilliams on 15-04-12.
 */
public class ContentService extends AService {
    private static ContentService sInstance = new ContentService();
    private AContentServiceImpl mContentServiceImpl;

    ContentService() {
        super("www");
    }

    public static ContentService getInstance() {
        return sInstance;
    }

    public void setContentServiceImpl(AContentServiceImpl contentServiceImpl) {
        mContentServiceImpl = contentServiceImpl;
    }

    @Override
    public void handleConnection(Socket connection, List<String> headers, String[] headerZero, HttpInputStream inputStream, HttpOutputStream outputStream) throws Exception {
        Log.d("Path: " + headers);
        String path = headerZero[1];
        if (path.startsWith("/www/")) {
            path = path.substring(5);

            if (path.contains("..")) {

                outputStream.setResponse(400, "Bad request - you got too many dots in your path dude");
                return;
            }

            while (path.startsWith("/")) {
                path = path.substring(1);
            }

            mContentServiceImpl.sendPathToStream(path, outputStream);

        } else {
            outputStream.setResponse(404,"File not found");
            return;
        }
    }
}
