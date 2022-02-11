/**
 * Performs the termination after a disconnection
 */
socket.on("disconnectPeer", (id) => {
  peerConnections[id].close();
  numberOfWatchers -= 1;
  updateConnection(peerConnections[id], numberOfWatchers);
  delete peerConnections[id];
});
