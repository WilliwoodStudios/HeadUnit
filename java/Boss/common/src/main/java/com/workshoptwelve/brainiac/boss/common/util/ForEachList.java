package com.workshoptwelve.brainiac.boss.common.util;

import java.util.ArrayList;

/**
 * Created by robwilliams on 15-05-08.
 */
public class ForEachList<T> extends ArrayList<T> {
    public interface ForEach<T> {
        void go(T item);
    }

    public void forEach(ForEach<T> forEach) {
        if (size()==0) {
            return;
        }

        Object [] values = toArray();
        for (Object o : values) {
            forEach.go((T)o);
        }
    }
}
