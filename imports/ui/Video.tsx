import React, { useRef, useEffect, useState } from "react";
import { css } from "emotion";

export const Video = ({
  stream,
  size,
  label,
  volume,
  mirror = false
}: {
  stream: MediaStream;
  size: number;
  label: string;
  volume: number;
  mirror?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>();
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  useEffect(() => {
    videoRef.current.srcObject = stream;
    const caps = stream.getVideoTracks()[0].getCapabilities();
    setOrientation(caps.width > caps.height ? "vertical" : "horizontal");
    videoRef.current.onloadedmetadata = function(e) {
      videoRef.current.play();
    };
  }, [stream]);

  useEffect(() => {
    videoRef.current.volume = volume;
  }, [volume]);

  return (
    <video
      {...{ [orientation === "horizontal" ? "height" : "width"]: size }}
      className={
        mirror
          ? css`
              transform: scaleX(-1);
            `
          : ""
      }
      ref={videoRef}
    />
  );
};
