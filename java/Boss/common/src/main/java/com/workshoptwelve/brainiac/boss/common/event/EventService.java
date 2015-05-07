package com.workshoptwelve.brainiac.boss.common.event;

import com.workshoptwelve.brainiac.boss.common.server.AEndPoint;
import com.workshoptwelve.brainiac.boss.common.server.AService;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Created by robwilliams on 15-04-11.
 */
public class EventService extends AService {
    private static EventService sInstance = new EventService();
    private AtomicLong mEventSequenceNumber = new AtomicLong(0);

    private Map<String, Set<String>> mEventCodeAndIDs = new HashMap<>();
    private Map<String, EventQueue> mIDAndEventQueues = new HashMap<>();
    private AEndPoint mAdd = new AEndPoint("addListener") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            String id = getString(params, "id");
            String eventType = getString(params, "eventType");
            addListener(id, eventType);
            return null;
        }
    };
    private AEndPoint mRemove = new AEndPoint("removeListener") {
        @Override
        public JSONObject execute(List<String> headers, HashMap<String, String> params) throws Exception {
            String id = getString(params, "id");
            String eventType = getString(params, "eventType");
            removeListener(id, eventType);
            return null;
        }
    };
    private AEndPoint mListen = new EventEndPoint(this);

    EventService() {
        super("/brainiac/events");

        addEndPoint(mAdd);
        addEndPoint(mRemove);
        addEndPoint(mListen);
    }

    public static EventService getInstance() {
        return sInstance;
    }

    protected void addListener(String id, String eventCode) {
        synchronized (mEventCodeAndIDs) {
            Set<String> ids = mEventCodeAndIDs.get(eventCode);
            if (ids == null) {
                ids = new HashSet<>();
                mEventCodeAndIDs.put(eventCode, ids);
            }
            getEventQueue(id,true);
            ids.add(id);
        }
    }

    EventQueue getEventQueue(String id, boolean allowCreation) {
        synchronized (mIDAndEventQueues) {
            EventQueue eventQueue = mIDAndEventQueues.get(id);
            if (allowCreation && eventQueue == null) {
                eventQueue = new EventQueue();
                mIDAndEventQueues.put(id, eventQueue);
            }
            return eventQueue;
        }
    }

    protected void removeListener(String id, String eventCode) {
        synchronized (mEventCodeAndIDs) {
            Set<String> ids = mEventCodeAndIDs.get(eventCode);
            if (ids != null) {
                ids.remove(id);
            }
        }
    }

    public void sendEvent(Event toSend) {
        String codeAsString = toSend.getEventType().getEventCodeAsString();
        Set<String> ids;
        ArrayList<EventQueue> queues = new ArrayList<EventQueue>();
        synchronized (mEventCodeAndIDs) {
            ids = mEventCodeAndIDs.get(codeAsString);
            if (ids == null || ids.size() == 0) {
                return;
            }
            synchronized (mIDAndEventQueues) {
                for (String id : ids) {
                    EventQueue eventQueue = mIDAndEventQueues.get(id);
                    if (eventQueue != null) {
                        queues.add(eventQueue);
                    }
                }
            }
        }

        if (queues.size() > 0) {
            byte[] payLoad = toSend.generatePayload(mEventSequenceNumber.incrementAndGet());

            for (EventQueue eventQueue : queues) {
                eventQueue.addEvent(payLoad);
            }
        }
    }
}

