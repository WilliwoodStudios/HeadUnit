package com.workshoptwelve.boss.desktop;

import com.workshoptwelve.boss.desktop.hardware.DesktopOBDEmulator;
import com.workshoptwelve.brainiac.boss.common.hardware.obdii.OBDService;
import com.workshoptwelve.brainiac.boss.common.server.Server;
import com.workshoptwelve.brainiac.boss.common.content.ContentService;
import com.workshoptwelve.brainiac.boss.common.log.Log;
import com.workshoptwelve.brainiac.boss.common.multimedia.MultiMediaService;
import com.workshoptwelve.boss.desktop.log.DesktopLogger;

import javafx.application.Application;
import javafx.stage.Stage;

public class DesktopServer extends Application {
    private static Log log;

    @Override
    public void start(Stage primaryStage) throws Exception {
        log.d("Starting for a stage...");
    }

    public static void main(String[] args) {
        Log.setLogger(new DesktopLogger());
        log = Log.getLogger(DesktopServer.class);


        log.i("About to start event server");

        ContentService.getInstance().setContentServiceImpl(new DesktopContentServiceImpl("html/src"));
        MultiMediaService.getInstance().setMultiMediaServiceImpl(new DesktopMultiMediaService());

        OBDService.getInstance().setOBDConnection(new DesktopOBDEmulator());

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

