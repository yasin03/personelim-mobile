/* eslint-disable no-console */

if (__DEV__ && typeof global.fetch === "function") {
  const originalFetch = global.fetch;

  global.fetch = async (...args) => {
    const [resource, config = {}] = args;
    const method = config.method || "GET";
    
    // Skip logging for Expo CLI internal API calls
    const url = typeof resource === "string" ? resource : resource?.url || "";
    const isExpoInternalCall = 
      url.includes("expo.dev") || 
      url.includes("expo.io") ||
      url.includes("localhost") ||
      url.includes("127.0.0.1") ||
      url.startsWith("file://") ||
      url.startsWith("data:");
    
    // If it's an Expo internal call, just pass through without wrapping
    if (isExpoInternalCall) {
      return originalFetch(...args);
    }

    const startedAt = Date.now();

    try {
      const response = await originalFetch(...args);
      const elapsed = Date.now() - startedAt;

      // Only clone and read if response is cloneable
      let preview = "";
      try {
        const responseClone = response.clone();
        const contentType = responseClone.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          try {
            const json = await responseClone.json();
            preview = JSON.stringify(json);
          } catch (error) {
            preview = "[JSON parse error]";
          }
        } else {
          try {
            const text = await responseClone.text();
            preview = text.slice(0, 200);
          } catch (error) {
            preview = "[Body read error]";
          }
        }
      } catch (cloneError) {
        // If cloning fails, just log without body preview
        preview = "[Unable to read body]";
      }

      console.log(
        `%c[API][${method}] ${response.status} ${resource} (${elapsed} ms)`,
        "color:#4CAF50;font-weight:bold;",
        preview
      );

      return response;
    } catch (error) {
      const elapsed = Date.now() - startedAt;
      console.log(
        `%c[API][${method}] ERROR ${resource} (${elapsed} ms)`,
        "color:#F44336;font-weight:bold;",
        error?.message || error
      );
      throw error;
    }
  };
}


