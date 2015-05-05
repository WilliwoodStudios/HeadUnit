package com.workshoptwelve.server.desktop;

import com.workshoptwelve.brainiac.server.common.Server;
import com.workshoptwelve.brainiac.server.common.content.ContentService;
import com.workshoptwelve.brainiac.server.common.log.Log;
import com.workshoptwelve.brainiac.server.common.multimedia.MultiMediaService;
import com.workshoptwelve.server.desktop.log.DesktopLogger;

import javafx.application.Application;
import javafx.stage.Stage;

public class DesktopServer extends Application {
    @Override
    public void start(Stage primaryStage) throws Exception {
        Log.d("Starting for a stage...");
    }

    public static void main(String[] args) {
        Log.setLogger(new DesktopLogger());

        Log.i("About to start event server");

        ContentService.getInstance().setContentServiceImpl(new DesktopContentServiceImpl("html/src"));
        MultiMediaService.getInstance().setMultiMediaServiceImpl(new DesktopMultiMediaService());

        Server server = Server.getInstance();
        server.addService(MultiMediaService.getInstance());
        server.start();

        Application.launch();
//
//
//        EventType time = new EventType() {
//            byte [] bytes = "SYS:TIME:".getBytes();
//
//            @Override
//            public byte[] getEventBytes() {
//                return bytes;
//            }
//        };
//
//        while(true) {
//
//            try {
//                Thread.sleep(5000);
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
//
//            eventServer.sendEvent(time,String.valueOf(System.currentTimeMillis()));
//
    }
}

