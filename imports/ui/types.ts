export type Peer = {
  id: string;
  pc: RTCPeerConnection;
  data: {
    userId: string;
  };
};
export type User = {
  id: string;
  position: Position;
};

export type Position = {
  x: number;
  y: number;
};
