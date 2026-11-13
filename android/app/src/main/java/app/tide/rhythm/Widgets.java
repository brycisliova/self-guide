package app.tide.rhythm;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import java.text.NumberFormat;

/** Draws all three home-screen widgets from what Store and Steps hold. */
final class Widgets {
    private Widgets() {}
    static final String ACTION_DONE = "app.tide.rhythm.DONE";

    static PendingIntent open(Context c, String route, int code) {
        Intent i = new Intent(c, MainActivity.class).putExtra("route", route).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void updateAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        Store.Now n = Store.now(c);
        int steps = Steps.today(c);
        NumberFormat nf = NumberFormat.getIntegerInstance();

        RemoteViews now = new RemoteViews(c.getPackageName(), R.layout.widget_now);
        now.setOnClickPendingIntent(R.id.root, open(c, "", 1));
        now.setTextViewText(R.id.streak, n.streak > 0 ? "Day " + n.streak : "");
        if (n.key == null) {
            now.setTextViewText(R.id.eyebrow, "Tide");
            now.setTextViewText(R.id.title, "Open Tide");
            now.setTextViewText(R.id.next, "Tap to set up today.");
            now.setTextViewText(R.id.meta, steps > 0 ? nf.format(steps) + " steps" : "");
            now.setProgressBar(R.id.bar, 100, 0, false);
            now.setViewVisibility(R.id.done, View.GONE);
        } else {
            String title, eyebrow, next = "";
            if (n.cur != null) {
                eyebrow = "Now · until " + Store.fmt(n.cur.optInt("start") + n.cur.optInt("dur"));
                title = n.cur.optString("title");
                if (n.next != null) next = "Then " + n.next.optString("title") + " at " + Store.fmt(n.next.optInt("start"));
            } else if (n.next != null) {
                eyebrow = "Next · " + Store.fmt(n.next.optInt("start"));
                title = n.next.optString("title");
            } else {
                eyebrow = "Day complete";
                title = "Rest.";
                next = "Phone across the room.";
            }
            now.setTextViewText(R.id.eyebrow, eyebrow);
            now.setTextViewText(R.id.title, title);
            now.setTextViewText(R.id.next, next);
            now.setTextViewText(R.id.meta, n.done + "/" + n.total + " done" + (steps > 0 ? " · " + nf.format(steps) + " steps" : ""));
            now.setProgressBar(R.id.bar, Math.max(1, n.total), n.done, false);
            boolean canDone = n.cur != null && !n.cur.optBoolean("done");
            now.setViewVisibility(R.id.done, canDone ? View.VISIBLE : View.GONE);
            if (canDone) {
                Intent d = new Intent(c, NowWidget.class).setAction(ACTION_DONE).putExtra("key", n.key).putExtra("id", n.cur.optString("id"));
                now.setOnClickPendingIntent(R.id.done, PendingIntent.getBroadcast(c, 2, d, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            }
        }
        m.updateAppWidget(new ComponentName(c, NowWidget.class), now);

        RemoteViews st = new RemoteViews(c.getPackageName(), R.layout.widget_steps);
        st.setOnClickPendingIntent(R.id.root, open(c, "progress", 3));
        boolean ok = Steps.hasSensor(c) && Steps.allowed(c);
        st.setTextViewText(R.id.steps, ok ? nf.format(steps) : "–");
        st.setProgressBar(R.id.bar, n.stepGoal, Math.min(steps, n.stepGoal), false);
        st.setTextViewText(R.id.meta, !ok ? "Open Tide to allow" : "of " + nf.format(n.stepGoal) + (n.streak > 0 ? " · day " + n.streak : ""));
        m.updateAppWidget(new ComponentName(c, StepsWidget.class), st);

        RemoteViews wv = new RemoteViews(c.getPackageName(), R.layout.widget_wave);
        wv.setOnClickPendingIntent(R.id.root, open(c, "wave", 4));
        m.updateAppWidget(new ComponentName(c, WaveWidget.class), wv);
    }

    /** Shared base: any system refresh simply redraws everything. */
    static class Base extends AppWidgetProvider {
        @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { updateAll(c); Jobs.ensure(c); Alarms.scheduleNext(c); }
    }
}
