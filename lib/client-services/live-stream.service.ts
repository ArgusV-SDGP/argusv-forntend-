import Hls from "hls.js";

const STREAM_BASE_URL =
  process.env.NEXT_PUBLIC_STREAM_BASE_URL ?? "http://localhost:8888";

export function buildHlsStreamUrl(streamPath: string) {
  const normalizedPath = streamPath.replace(/^\/+|\/+$/g, "");
  return `${STREAM_BASE_URL}/${normalizedPath}/index.m3u8`;
}

export async function attachLiveStream(
  video: HTMLVideoElement,
  streamPath: string,
  handlers: {
    onConnecting?: () => void;
    onLive?: () => void;
    onError?: () => void;
  } = {},
) {
  const { onConnecting, onLive, onError } = handlers;
  const streamUrl = buildHlsStreamUrl(streamPath);
  let settled = false;

  function markLive() {
    if (settled) return;
    settled = true;
    onLive?.();
  }

  function markError() {
    if (settled) return;
    settled = true;
    onError?.();
  }

  function resetVideoElement() {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  const handleLoaded = () => {
    markLive();
  };

  const handleVideoError = () => {
    markError();
  };

  onConnecting?.();
  resetVideoElement();
  video.addEventListener("loadeddata", handleLoaded);
  video.addEventListener("canplay", handleLoaded);
  video.addEventListener("playing", handleLoaded);
  video.addEventListener("error", handleVideoError);

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;

    try {
      await video.play();
      markLive();
    } catch {
      markError();
    }

    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("playing", handleLoaded);
      video.removeEventListener("error", handleVideoError);
      resetVideoElement();
    };
  }

  if (!Hls.isSupported()) {
    markError();
    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("playing", handleLoaded);
      video.removeEventListener("error", handleVideoError);
      resetVideoElement();
    };
  }

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    liveSyncDurationCount: 2,
    liveMaxLatencyDurationCount: 5,
    liveDurationInfinity: true,
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 6,
    manifestLoadingRetryDelay: 2000,
  });

  hls.loadSource(streamUrl);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video
      .play()
      .then(() => {
        markLive();
      })
      .catch(() => {
        markError();
      });
  });

  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;

    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        hls.recoverMediaError();
        break;
      default:
        markError();
        break;
    }
  });

  return () => {
    video.removeEventListener("loadeddata", handleLoaded);
    video.removeEventListener("canplay", handleLoaded);
    video.removeEventListener("playing", handleLoaded);
    video.removeEventListener("error", handleVideoError);
    hls.destroy();
    resetVideoElement();
  };
}
