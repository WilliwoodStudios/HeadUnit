package com.workshoptwelve.brainiac.server.common.annotations;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Created by robwilliams on 15-04-10.
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface ServicePath {
    String value();
}
