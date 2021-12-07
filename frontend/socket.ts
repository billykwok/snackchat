export const socket = new WebSocket('ws://192.168.50.1:21489/ws');

socket.onopen = () => {
  console.log('[open] Connection established');
  console.log('Sending to server');
};

socket.onclose = (event) => {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    console.log('[close] Connection died');
  }
};

socket.onerror = (event) => {
  console.dir(event);
};
