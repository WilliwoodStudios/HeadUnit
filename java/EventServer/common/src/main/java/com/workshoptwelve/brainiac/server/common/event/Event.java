package com.workshoptwelve.brainiac.server.common.event;

import java.io.ByteArrayOutputStream;

/**
 * Created by robwilliams on 15-04-12.
 */
public class Event {
    private EventType mEventType;
    private byte[] mPayload;

    public Event(EventType type, byte[] payload) {
        mEventType = type;
        mPayload = payload;
    }

    public EventType getEventType() {
        return mEventType;
    }

    public Event(EventType type, String payload) {
        this(type, payload.getBytes());
    }

    public byte[] generatePayload(long sequenceNumber) {
        // TODO optimize
        byte[] sequenceNumberAsBytes = String.valueOf(sequenceNumber).getBytes();
        byte[] eventCode = mEventType.getEventCode();

        // sequence|eventTypePayload\n
        int length = sequenceNumberAsBytes.length + 1 + eventCode.length + mPayload.length + 1;

        byte[] toReturn = new byte[length];
        int offset = 0;

        System.arraycopy(sequenceNumberAsBytes, 0, toReturn, offset, sequenceNumberAsBytes.length);
        offset += sequenceNumberAsBytes.length;

        toReturn[offset++] = '|';

        // EventCode already includes the trailing |
        System.arraycopy(eventCode, 0, toReturn, offset, eventCode.length);
        offset += eventCode.length;

        System.arraycopy(mPayload, 0, toReturn, offset, mPayload.length);
        offset += mPayload.length;

        toReturn[offset++] = '\n';

        return toReturn;
    }
}
