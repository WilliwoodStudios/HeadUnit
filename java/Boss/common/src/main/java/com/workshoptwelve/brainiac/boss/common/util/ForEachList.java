package com.workshoptwelve.brainiac.boss.common.util;

import com.workshoptwelve.brainiac.boss.common.log.Log;

import java.util.ArrayList;

/**
 * Created by robwilliams on 15-05-08.
 */
public class ForEachList<T> extends ArrayList<T> {
    private static Log log = Log.getLogger(ForEachList.class);

    public void forEach(ForEach<T> forEach) {
        if (size() == 0) {
            return;
        }

        Object[] values;
        synchronized (this) {
            values = toArray();
        }
        for (Object o : values) {
            try {
                forEach.go((T) o);
            } catch (Exception e) {
                log.e("Caught otherwise fatal exception", e);
            }
        }
    }

    public interface ForEach<T> {
        void go(T item);
    }
}
