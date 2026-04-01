export function getOrCreateDeviceId() {
  const key = "interactive_device_id";
  let id = localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }

  return id;
}

export function getDeviceInfo() {
  return {
    device_id: getOrCreateDeviceId(),
    device_name: `${navigator.platform || "Unknown"} device`,
    user_agent: navigator.userAgent,
    browser: "unknown",
    browser_version: "unknown",
    os: "unknown",
    os_version: "unknown",
    platform: navigator.platform || null,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || null,
  };
}