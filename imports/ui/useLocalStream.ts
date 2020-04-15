import { useState, useEffect } from "react";

export const useLocalStream = () => {
  const [localStream, setLocalStream] = useState<MediaStream>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        /* use the stream */
        setLocalStream(stream);
        setIsLoading(false);
      } catch (err) {
        setError(err);
      }
    })();
  }, []);

  return {
    isLoading,
    error,
    localStream
  };
};
