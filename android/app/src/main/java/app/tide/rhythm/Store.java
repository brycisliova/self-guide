package app.tide.rhythm;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Locale;

/** What the screens last told the native side: the plan for today and tomorrow, plus settings. */
final class Store {
    private Store() {}

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("tide", Context.MODE_PRIVATE); }

    static void saveState(Context c, String json) { prefs(c).edit().putString("state", json).apply(); }

    static JSONObject state(Context c) {
        try { return new JSONObject(prefs(c).getString("state", "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    static long midnight(String key) {
        String[] p = key.split("-");
        Calendar cal = Calendar.getInstance();
        cal.clear();
        cal.set(Integer.parseInt(p[0]), Integer.parseInt(p[1]) - 1, Integer.parseInt(p[2]), 0, 0, 0);
        return cal.getTimeInMillis();
    }

    static String fmt(int min) {
        int m = ((min % 1440) + 1440) % 1440, h = m / 60;
        return String.format(Locale.US, "%d:%02d %s", (h + 11) % 12 + 1, m % 60, h < 12 ? "am" : "pm");
    }

    /** The day that is running right now, with the current and next block worked out. */
    static final class Now {
        String key;
        JSONArray blocks = new JSONArray();
        JSONObject cur, next;
        int done, total, nowMin, streak, stepGoal = 8000;
        boolean notify;
    }

    static Now now(Context c) {
        Now n = new Now();
        JSONObject s = state(c);
        n.streak = s.optInt("streak", 0);
        n.stepGoal = Math.max(1, s.optInt("stepGoal", 8000));
        n.notify = s.optBoolean("notify", false);
        int wake = s.optInt("wakeMin", 480), bed = s.optInt("bedMin", 1470);
        JSONArray days = s.optJSONArray("days");
        if (days == null) return n;
        long t = System.currentTimeMillis();
        for (int i = 0; i < days.length(); i++) {
            JSONObject d = days.optJSONObject(i);
            if (d == null) continue;
            String key = d.optString("key", "");
            if (!key.matches("\\d{4}-\\d{2}-\\d{2}")) continue;
            long rel = (t - midnight(key)) / 60000L;
            if (rel < wake - 180 || rel > bed + 180) continue;
            n.key = key;
            n.nowMin = (int) rel;
            n.blocks = d.optJSONArray("blocks") == null ? new JSONArray() : d.optJSONArray("blocks");
            break;
        }
        n.total = n.blocks.length();
        for (int i = 0; i < n.total; i++) {
            JSONObject b = n.blocks.optJSONObject(i);
            if (b == null) continue;
            int start = b.optInt("start"), dur = b.optInt("dur");
            if (b.optBoolean("done")) n.done++;
            if (dur > 0 && n.nowMin >= start && n.nowMin < start + dur && n.cur == null) n.cur = b;
            if (start > n.nowMin && n.next == null) n.next = b;
        }
        return n;
    }

    /** Mark a block done from a widget. The screens pick this up the next time they open. */
    static void markDone(Context c, String key, String id) {
        try {
            JSONObject s = state(c);
            JSONArray days = s.optJSONArray("days");
            for (int i = 0; days != null && i < days.length(); i++) {
                JSONObject d = days.getJSONObject(i);
                if (!key.equals(d.optString("key"))) continue;
                JSONArray bl = d.optJSONArray("blocks");
                for (int j = 0; bl != null && j < bl.length(); j++) if (id.equals(bl.getJSONObject(j).optString("id"))) bl.getJSONObject(j).put("done", true);
            }
            JSONArray pending = new JSONArray(prefs(c).getString("pending", "[]"));
            pending.put(new JSONObject().put("key", key).put("id", id));
            prefs(c).edit().putString("state", s.toString()).putString("pending", pending.toString()).apply();
        } catch (Exception ignored) { }
    }

    static String takePending(Context c) {
        String p = prefs(c).getString("pending", "[]");
        prefs(c).edit().putString("pending", "[]").apply();
        return p;
    }
}
