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

  onConnecting?.();

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;

    try {
      await video.play();
      onLive?.();
    } catch {
      onError?.();
    }

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }

  if (!Hls.isSupported()) {
    onError?.();
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
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
        onLive?.();
      })
      .catch(() => {
        onError?.();
      });
  });

  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (data.fatal) {
      onError?.();
    }
  });

  return () => {
    hls.destroy();
    video.pause();
    video.removeAttribute("src");
    video.load();
  };
}
