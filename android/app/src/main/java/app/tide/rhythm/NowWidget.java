package app.tide.rhythm;

import android.content.Context;
import android.content.Intent;

public class NowWidget extends Widgets.Base {
    @Override public void onReceive(Context c, Intent i) {
        if (Widgets.ACTION_DONE.equals(i.getAction())) {
            String key = i.getStringExtra("key"), id = i.getStringExtra("id");
            if (key != null && id != null) Store.markDone(c, key, id);
            Widgets.updateAll(c);
            return;
        }
        super.onReceive(c, i);
    }
}
