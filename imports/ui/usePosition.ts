import { useEffect, useState, useRef } from "react";
import { useMutation } from "react-apollo";
import gql from "graphql-tag";

export const usePosition = () => {
  const updatePosition = useThrottledMutation(
    gql`
      mutation Move($x: Float!, $y: Float!) {
        move(x: $x, y: $y) {
          id
          position {
            x
            y
          }
        }
      }
    `,
    { throttleTime: 1000 }
  );

  const [position, setPosition] = useState({
    x: 0.5,
    y: 0.5
  });

  useGameLoop(
    (elapsed, keyPresses) => {
      // Speed is one percent per 5000ms
      const distancePassed = elapsed / 5000;

      const distancePassedH = keyPresses.ArrowLeft
        ? -distancePassed
        : keyPresses.ArrowRight
        ? distancePassed
        : 0;
      const distancePassedV = keyPresses.ArrowUp
        ? -distancePassed
        : keyPresses.ArrowDown
        ? distancePassed
        : 0;

      const x = clamp(position.x + distancePassedH, 0, 1);
      const y = clamp(position.y + distancePassedV, 0, 1);

      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    },
    [position]
  );

  useEffect(
    () =>
      updatePosition({
        variables: position
      }),
    [position]
  );

  return position;
};

const useGameLoop = (
  callback: (elapsed: number, keyPresses: Record<string, boolean>) => void,
  dependencies: any[] = []
) => {
  const [timeOfLastFrame, setTimeOfLastFrame] = useState(0);

  const keyPressesRef = useRef({});

  useEffect(() => {
    const onKeyDown = event => {
      keyPressesRef.current[event.code] = true;
    };

    const onKeyUp = event => {
      keyPressesRef.current[event.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = performance.now();
      const elapsed = timeOfLastFrame ? now - timeOfLastFrame : 0;
      callback(elapsed, keyPressesRef.current);
      setTimeOfLastFrame(now);
    });

    return () => cancelAnimationFrame(frame);
  }, [timeOfLastFrame, ...dependencies]);
};

const useThrottledMutation = (
  mutation: Parameters<typeof useMutation>[0],
  options: Parameters<typeof useMutation>[1] & { throttleTime: number }
) => {
  const { throttleTime, ...mutationOptions } = options;
  const [mutate] = useMutation(mutation, mutationOptions);

  const [timeout, updateTimeout] = useState<ReturnType<typeof setTimeout>>();

  return (...args) => {
    clearTimeout(timeout);
    updateTimeout(
      setTimeout(
        () => {
          mutate(...args);
        },
        timeout ? 0 : throttleTime
      )
    );
  };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
