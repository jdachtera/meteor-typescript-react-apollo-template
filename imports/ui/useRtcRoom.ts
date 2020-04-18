import quickconnect from "rtc-quickconnect";
import { useState, useEffect } from "react";
import { useLocalStream } from "./useLocalStream";
import { Peer } from "./types";

export const useRtcRoom = (userId, room) => {
  const [peers, setPeers] = useState<Peer[]>([]);

  const { isLoading, error, localStream } = useLocalStream();

  useEffect(() => {
    if (userId && localStream) {
      let peers = [];
      const url = new URL(location.origin);
      url.port = url.port ? (parseInt(url.port) + 1).toString() : "";
      url.pathname = "switchboard.rtc.io/";
      const connection = quickconnect(url.toString(), { room });

      connection.profile({ userId });

      // when a new peer is announced, log it
      connection.on("call:started", function(id, pc, data) {
        peers = [...peers, { id, pc, data }];
        setPeers(peers);
      });

      connection.on("call:ended", function(id) {
        peers = peers.filter(peer => peer.id !== id);
        setPeers(peers);
      });

      connection.addStream(localStream);

      return () => {
        setPeers([]);
        connection.close();
      };
    }
  }, [userId, room, isLoading, error, localStream]);

  return peers;
};
