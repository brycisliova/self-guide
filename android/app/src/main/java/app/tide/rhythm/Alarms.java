package app.tide.rhythm;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

/** One alarm at a time, set for the start of the next block. When it fires it sets the one after. */
final class Alarms {
    private Alarms() {}

    static void scheduleNext(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = PendingIntent.getBroadcast(c, 10, new Intent(c, AlarmReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Store.Now n = Store.now(c);
        if (am == null) return;
        if (n.key == null || n.next == null) { am.cancel(pi); return; }
        long at = Store.midnight(n.key) + n.next.optInt("start") * 60000L;
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
    }
}
