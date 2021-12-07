export const socket = new WebSocket('ws://localhost:21489/ws');

socket.onopen = () => {
  console.log('[open] Connection established');
  console.log('Sending to server');
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    console.log('[close] Connection died');
  }
};

socket.onerror = function (event) {
  console.error(`[error] ${event.toString()}`);
};
