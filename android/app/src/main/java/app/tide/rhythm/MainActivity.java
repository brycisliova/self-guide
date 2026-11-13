package app.tide.rhythm;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.CalendarContract;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** The app's screens are the bundled web pages; this shell adds what a web page cannot do. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String BASE = "https://" + HOST + "/assets/web/index.html";
    private static final int REQ_OPEN = 2, REQ_SAVE = 3, REQ_STEPS = 4, REQ_NOTIFY = 5;

    private WebView web;
    private ValueCallback<Uri[]> fileCb;
    private String saveText;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportMultipleWindows(false);
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) { return loader.shouldInterceptRequest(r.getUrl()); }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                // Only the bundled pages may load inside the app; every other link opens in the browser.
                if (HOST.equals(r.getUrl().getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception ignored) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                try { startActivityForResult(i, REQ_OPEN); } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "TideNative");
        String route = getIntent() == null ? null : getIntent().getStringExtra("route");
        web.loadUrl(BASE + (route == null || route.isEmpty() ? "" : "#" + route));

        Jobs.ensure(this);
        refreshSteps();
    }

    @Override protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        String route = i.getStringExtra("route");
        if (route != null && route.matches("[a-z]+")) web.evaluateJavascript("window.nativeRoute && nativeRoute('" + route + "')", null);
    }

    @Override protected void onResume() {
        super.onResume();
        web.evaluateJavascript("window.nativeResume && nativeResume()", null);
        refreshSteps();
    }

    @Override protected void onPause() {
        super.onPause();
        Widgets.updateAll(this);
        Alarms.scheduleNext(this);
    }

    @Override public void onBackPressed() {
        web.evaluateJavascript("window.nativeBack ? nativeBack() : false", v -> { if (!"true".equals(v)) finish(); });
    }

    private void refreshSteps() {
        new Thread(() -> {
            Steps.read(getApplicationContext());
            final String json = Steps.history(getApplicationContext()).toString();
            runOnUiThread(() -> { web.evaluateJavascript("window.nativeSteps && nativeSteps(" + json + ")", null); Widgets.updateAll(this); });
        }).start();
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_OPEN) {
            if (fileCb != null) fileCb.onReceiveValue(res == RESULT_OK && data != null && data.getData() != null ? new Uri[]{data.getData()} : null);
            fileCb = null;
        } else if (req == REQ_SAVE && res == RESULT_OK && data != null && data.getData() != null && saveText != null) {
            try (OutputStream out = getContentResolver().openOutputStream(data.getData())) { out.write(saveText.getBytes(StandardCharsets.UTF_8)); } catch (Exception ignored) { }
            saveText = null;
        }
    }

    @Override public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        super.onRequestPermissionsResult(req, perms, results);
        if (req == REQ_STEPS) refreshSteps();
        web.evaluateJavascript("window.nativeResume && nativeResume()", null);
    }

    /** Called from the screens. Every method here must be safe to call with any argument. */
    private final class Bridge {
        @JavascriptInterface public void push(String json) {
            if (json == null || json.length() > 400000) return;
            Store.saveState(getApplicationContext(), json);
            Widgets.updateAll(getApplicationContext());
            Alarms.scheduleNext(getApplicationContext());
        }
        @JavascriptInterface public String takePending() { return Store.takePending(getApplicationContext()); }
        @JavascriptInterface public String stepsJson() { return Steps.history(getApplicationContext()).toString(); }
        @JavascriptInterface public boolean hasStepSensor() { return Steps.hasSensor(getApplicationContext()); }
        @JavascriptInterface public boolean stepsAllowed() { return Steps.allowed(getApplicationContext()); }
        @JavascriptInterface public void askSteps() { if (Build.VERSION.SDK_INT >= 29) runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.ACTIVITY_RECOGNITION}, REQ_STEPS)); }
        @JavascriptInterface public void askNotify() { if (Build.VERSION.SDK_INT >= 33) runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY)); }
        @JavascriptInterface public void refreshSteps() { MainActivity.this.refreshSteps(); }
        @JavascriptInterface public void share(String text) {
            runOnUiThread(() -> { try { startActivity(Intent.createChooser(new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text), "Share")); } catch (Exception ignored) { } });
        }
        @JavascriptInterface public void saveFile(String name, String text, String mime) {
            saveText = text;
            runOnUiThread(() -> { try { startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime == null ? "*/*" : mime).putExtra(Intent.EXTRA_TITLE, name), REQ_SAVE); } catch (Exception ignored) { } });
        }
        @JavascriptInterface public void addEvent(String title, String note, double startMs, double endMs) {
            runOnUiThread(() -> { try {
                startActivity(new Intent(Intent.ACTION_INSERT).setData(CalendarContract.Events.CONTENT_URI).putExtra(CalendarContract.Events.TITLE, title).putExtra(CalendarContract.Events.DESCRIPTION, note)
                        .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, (long) startMs).putExtra(CalendarContract.EXTRA_EVENT_END_TIME, (long) endMs));
            } catch (Exception ignored) { } });
        }
    }
}
