import React from "react";

import { AvatarArea } from "./AvatarArea";
import { StreamVideos } from "./StreamVideos";
import { usePosition } from "./usePosition";
import { useUsers } from "./useUsers";
import { useRtcRoom } from "./useRtcRoom";

export default function Hello() {
  const { x, y } = usePosition();

  const { users, currentUser } = useUsers();

  const peers = useRtcRoom(currentUser && currentUser.id, "playa");

  return (
    <div>
      <AvatarArea x={x} y={y} peers={peers} />
    </div>
  );
}

//<StreamVideos x={x} y={y} peers={peers} users={users} />
