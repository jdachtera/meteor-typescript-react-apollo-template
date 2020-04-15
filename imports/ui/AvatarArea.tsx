import React, {
  useRef,
  useState,
  useEffect,
  ReactChildren,
  ReactNode
} from "react";
import { useUsers } from "./useUsers";
import { Position, User, Peer } from "./types";
import { useDistance, getDistance } from "./useDistance";
import { Video } from "./Video";
import { useLocalStream } from "./useLocalStream";

export const AvatarArea = React.memo(
  ({ x, y, peers }: { x: number; y: number; peers: Peer[] }) => {
    const position = { x, y };
    const { users, currentUser, loading } = useUsers();

    const { localStream } = useLocalStream();

    console.log(localStream);

    const areaRef = useRef<HTMLDivElement>();

    const [dimensions, setDimensions] = useState({
      x: 0,
      y: 0
    });

    useEffect(() => {
      const updateDimensions = () => {
        const clientRect = areaRef.current.getBoundingClientRect();
        console.log("setDimensions(", {
          x: clientRect.width,
          y: clientRect.height
        });
        setDimensions({
          x: clientRect.width,
          y: clientRect.height
        });
      };

      window.addEventListener("resize", updateDimensions);
      updateDimensions();
      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const maxSize = Math.min(dimensions.x, dimensions.y) / 2;

    const userDistance = getDistance({ x: 0.5, y: 0.5 }, position);
    const userSize = maxSize * (1 - userDistance);

    return (
      <div
        style={{
          position: "absolute",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          backgroundImage: "url(https://picsum.photos/id/625/1280/800)",
          backgroundSize: "cover"
        }}
        ref={areaRef}
      >
        {users
          .filter(user => user.id !== currentUser.id)
          .map(user => {
            const peer = peers.find(peer => user.id === peer.data.userId);
            const distance = getDistance({ x: 0.5, y: 0.5 }, user.position);

            return (
              peer && (
                <Avatar
                  key={user.id}
                  id={user.id}
                  dimensions={dimensions}
                  position={user.position}
                  size={maxSize * (1 - distance)}
                  maxSize={maxSize}
                >
                  <Video
                    size={maxSize * (1 - distance)}
                    stream={peer.pc.getRemoteStreams()[0]}
                    label={""}
                    volume={1 - distance}
                  />
                </Avatar>
              )
            );
          })}

        {currentUser && (
          <Avatar
            position={position}
            dimensions={dimensions}
            size={userSize}
            id={currentUser.id}
            maxSize={maxSize}
            style={{
              borderColor: "green",
              zIndex: 1
            }}
          >
            {localStream && (
              <Video
                size={userSize}
                stream={localStream}
                label={""}
                volume={0}
                mirror={true}
              />
            )}
          </Avatar>
        )}
      </div>
    );
  }
);

const Avatar = ({
  dimensions,
  position,
  style = {},
  children = null,
  size = 150,
  maxSize = 200,
  id
}: {
  size?: number;
  maxSize: number;
  dimensions: Position;
  position: Position;
  style?: React.CSSProperties;
  children?: ReactChildren | ReactNode;
  id: string;
}) => {
  const avatarRadius = size / 2;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        overflow: "hidden",
        left: `${position.x * (dimensions.x - size) + avatarRadius}px`,
        top: `${position.y * (dimensions.y - size) + avatarRadius}px`,
        backgroundImage: `url(https://api.adorable.io/avatars/${Math.round(
          maxSize
        )}/${id}.png)`,
        backgroundSize: "cover",
        width: `${size}px`,
        height: `${size}px`,
        margin: `-${avatarRadius}px -${avatarRadius}px`,
        border: `${size / 25}px black solid`,
        borderRadius: `${size}px`,
        flexDirection: "column",
        alignItems: "center",
        boxShadow: `rgba(0,0,0,0.8) 0 0 ${size/20}px`,
        boxShadowRadius: `${size}px`
        ...style
      }}
    >
      {children}
    </div>
  );
};
