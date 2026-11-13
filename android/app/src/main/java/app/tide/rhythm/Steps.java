package app.tide.rhythm;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;

import org.json.JSONObject;

import java.util.Calendar;
import java.util.Iterator;
import java.util.Locale;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Daily steps from the phone's own step-counter chip. The chip counts since the last restart,
 * so each reading adds the difference since the previous reading to today's total.
 */
final class Steps {
    private Steps() {}

    static boolean hasSensor(Context c) {
        SensorManager sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        return sm != null && sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null;
    }

    static boolean allowed(Context c) {
        return Build.VERSION.SDK_INT < 29 || c.checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
    }

    /** The day a step belongs to. Before 3 am still counts as the previous day, like the app's own day. */
    static String dayKey() {
        Calendar cal = Calendar.getInstance();
        if (cal.get(Calendar.HOUR_OF_DAY) < 3) cal.add(Calendar.DAY_OF_MONTH, -1);
        return String.format(Locale.US, "%04d-%02d-%02d", cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH));
    }

    static JSONObject history(Context c) {
        try { return new JSONObject(Store.prefs(c).getString("steps", "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    static int today(Context c) { return history(c).optInt(dayKey(), 0); }

    /** Read the counter once and fold it into today's total. Blocks for up to two seconds; never call on the main thread. */
    static synchronized void read(Context c) {
        if (!hasSensor(c) || !allowed(c)) return;
        SensorManager sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        Sensor sensor = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        final float[] value = {-1f};
        final CountDownLatch latch = new CountDownLatch(1);
        HandlerThread thread = new HandlerThread("tide-steps");
        thread.start();
        SensorEventListener l = new SensorEventListener() {
            @Override public void onSensorChanged(SensorEvent e) { value[0] = e.values[0]; latch.countDown(); }
            @Override public void onAccuracyChanged(Sensor s, int a) { }
        };
        try {
            sm.registerListener(l, sensor, SensorManager.SENSOR_DELAY_NORMAL, new Handler(thread.getLooper()));
            latch.await(2, TimeUnit.SECONDS);
        } catch (Exception ignored) {
        } finally {
            sm.unregisterListener(l);
            thread.quitSafely();
        }
        if (value[0] < 0) return;
        SharedPreferences p = Store.prefs(c);
        float last = p.getFloat("stepsLast", -1f);
        float delta = last < 0 ? 0 : value[0] - last;
        if (delta < 0) delta = value[0]; // the phone restarted and the chip began again from zero
        try {
            JSONObject h = history(c);
            String key = dayKey();
            if (delta > 0 && delta < 100000) h.put(key, h.optInt(key, 0) + Math.round(delta));
            if (h.length() > 90) { Iterator<String> it = h.keys(); String oldest = null; while (it.hasNext()) { String k = it.next(); if (oldest == null || k.compareTo(oldest) < 0) oldest = k; } h.remove(oldest); }
            p.edit().putFloat("stepsLast", value[0]).putString("steps", h.toString()).apply();
        } catch (Exception ignored) { }
    }
}
