package com.workshoptwelve.brainiac.mediascanner;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by robwilliams on 15-05-22.
 */
public class WTF {
    public static void main(String[] args) {
        Pattern p = Pattern.compile("(^[0-9]+[\\- .]+)(.*)");
        String[] tests = new String[]{"Rob", "123asdf", "12 1234", "12. afsdf","12-To Go"};
        for (String test : tests) {
            Matcher m = p.matcher(test);
            System.out.println(test + " " + m.matches() + " " + m.groupCount());
            try {
                System.out.println(m.group(2));
            } catch (IllegalStateException ise) {
                // ignore.
            }
        }
    }
}
