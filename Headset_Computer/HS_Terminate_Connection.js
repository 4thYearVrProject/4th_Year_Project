window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
  };