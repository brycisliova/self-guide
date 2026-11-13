package app.tide.rhythm;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        Jobs.ensure(c);
        Alarms.scheduleNext(c);
        Widgets.updateAll(c);
    }
}
