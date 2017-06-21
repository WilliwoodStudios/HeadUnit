// IBoss.aidl
package com.workshoptwelve.brainiac.boss;

// Declare any non-default types here with import statements

interface IBoss {
    /**
     * Get the version of the boss.
     */
    String getVersion();

    /**
     * Get the port that the server is running on.
     */
    int getServerPort();
}
