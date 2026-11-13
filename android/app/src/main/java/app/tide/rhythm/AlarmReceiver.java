package app.tide.rhythm;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

/** A block is starting: tell the person if they asked for reminders, refresh the widgets, set the next alarm. */
public class AlarmReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent intent) {
        Store.Now n = Store.now(c);
        boolean allowed = Build.VERSION.SDK_INT < 33 || c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        if (n.notify && allowed && n.cur != null && !n.cur.optBoolean("done") && n.nowMin - n.cur.optInt("start") <= 10) {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            nm.createNotificationChannel(new NotificationChannel("blocks", "Block reminders", NotificationManager.IMPORTANCE_DEFAULT));
            String body = n.cur.optInt("dur") > 0 ? "Until " + Store.fmt(n.cur.optInt("start") + n.cur.optInt("dur")) : "";
            Notification note = new Notification.Builder(c, "blocks")
                    .setSmallIcon(R.drawable.ic_wave)
                    .setContentTitle(n.cur.optString("title"))
                    .setContentText(body)
                    .setContentIntent(Widgets.open(c, "", 11))
                    .setAutoCancel(true)
                    .build();
            nm.notify(1, note);
        }
        Widgets.updateAll(c);
        Alarms.scheduleNext(c);
    }
}
