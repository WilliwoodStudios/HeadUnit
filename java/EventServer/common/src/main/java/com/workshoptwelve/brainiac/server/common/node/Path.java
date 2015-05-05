package com.workshoptwelve.brainiac.server.common.node;

/**
 * Created by robwilliams on 15-04-10.
 * /brainiac/multimedia/play
 * path=
 * offset=
 * /brainiac/multimedia/stop
 * /brainiac/multimedia/seek
 * offset=
 * /brainiac/multimedia/next
 * /brainiac/multimedia/previous
 * /brainiac/multimedia/setVolume
 * /brainiac/multimedia/getVolume
 * /brainiac/multimedia/registerVolumeUpdates
 * /brainiac/multimedia/registerStatusUpdates
 * /brainiac/multimedia/registerPositionUpdates
 */
public interface Path {
    String getPath();

    boolean processRequest(String request, int offset);
}
