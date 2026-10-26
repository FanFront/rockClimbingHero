package expo.modules.trailmedia

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.functions.Queues

class TrailMediaModule : Module() {
  private var pending: Promise? = null
  private val requestCode = 49321
  override fun definition() = ModuleDefinition {
    Name("TrailMedia")
    AsyncFunction("pick") { promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null || pending != null) {
        promise.reject("E_PICK", "Picker unavailable", null)
      } else {
        pending = promise
        try {
          val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "video/*"))
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
          }
          activity.startActivityForResult(intent, requestCode)
        } catch (e: Exception) { pending = null; promise.reject("E_PICK", "Picker unavailable", e) }
      }
    }.runOnQueue(Queues.MAIN)
    OnActivityResult { activity, result ->
      if (result.requestCode == requestCode) {
        val promise = pending
        pending = null
        if (result.resultCode != Activity.RESULT_OK) promise?.resolve(emptyList<Any>())
        else try {
          val data = result.data ?: throw Exception("Missing result")
          val uris = mutableListOf<Uri>()
          data.clipData?.let { clip -> for (i in 0 until clip.itemCount) uris.add(clip.getItemAt(i).uri) }
          if (uris.isEmpty()) data.data?.let { uris.add(it) }
          val resolver = activity.contentResolver
          val refs = uris.distinct().map { uri ->
            require(uri.scheme == "content")
            resolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
            val mime = resolver.getType(uri) ?: "application/octet-stream"
            require(mime.startsWith("image/") || mime.startsWith("video/"))
            var name = "Media"
            resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
              if (cursor.moveToFirst()) name = cursor.getString(0) ?: name
            }
            mapOf("uri" to uri.toString(), "type" to mime, "name" to name)
          }
          promise?.resolve(refs)
        } catch (e: Exception) { promise?.reject("E_PERMISSION", "Persistent media access unavailable. Select another document.", e) }
      }
    }
    AsyncFunction("available") { uri: String ->
      try {
        appContext.reactContext!!.contentResolver.openAssetFileDescriptor(Uri.parse(uri), "r")?.use { true } ?: false
      } catch (_: Exception) { false }
    }
    AsyncFunction("open") { uri: String, mime: String ->
      val context = appContext.reactContext ?: throw Exception("No context")
      context.contentResolver.openAssetFileDescriptor(Uri.parse(uri), "r")?.close()
      context.startActivity(Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(Uri.parse(uri), mime)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
      })
    }
    OnDestroy { pending?.reject("E_PICK", "Picker closed", null); pending = null }
  }
}
