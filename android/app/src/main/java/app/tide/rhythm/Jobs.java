package app.tide.rhythm;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.concurrent.TimeUnit;

/** Every fifteen minutes or so: read the step counter and redraw the widgets. */
public final class Jobs {
    private Jobs() {}

    static void ensure(Context c) {
        PeriodicWorkRequest req = new PeriodicWorkRequest.Builder(Tick.class, 15, TimeUnit.MINUTES).build();
        WorkManager.getInstance(c.getApplicationContext()).enqueueUniquePeriodicWork("tide-tick", ExistingPeriodicWorkPolicy.KEEP, req);
    }

    public static class Tick extends Worker {
        public Tick(@NonNull Context c, @NonNull WorkerParameters p) { super(c, p); }
        @NonNull @Override public Result doWork() {
            Steps.read(getApplicationContext());
            Widgets.updateAll(getApplicationContext());
            Alarms.scheduleNext(getApplicationContext());
            return Result.success();
        }
    }
}
