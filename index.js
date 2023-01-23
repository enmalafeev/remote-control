import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from 'ws';
import { mouse, left, right, up, down } from "@nut-tree/nut-js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const parse = (data) => {
  const strigifyData = data.toString('utf8');
  console.log('strigifyData ->', strigifyData)
  const [command, value] = strigifyData.split(' ');
  return { command, value };
};

const getStringForSend = ({ command, value }) => {
  return `${command}_${value}`;
}

const moveMouse = async ({ command, value }) => {
  console.log({ command, value });
  switch (command) {
    case 'mouse_left':
      await mouse.move(left(Number(value)));
      return getStringForSend({ command, value });
    case 'mouse_right':
      await mouse.move(right(Number(value)));
      return getStringForSend({ command, value });
    case 'mouse_up':
      await mouse.move(up(Number(value)));
      return getStringForSend({ command, value });
    case 'mouse_down':
      await mouse.move(down(Number(value)));
      return getStringForSend({ command, value });
    case 'mouse_position':
      const cursorPosition = await mouse.getPosition();
      const coordsToString = `x_${cursorPosition.x}_y_${cursorPosition.y}`;
      return getStringForSend({ command, value: coordsToString });
  }
};

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.send('connected_to_wss');
  ws.on('message', async (data) => {
    console.log(data);
    const parsedData = parse(data);
    const sendedString = await moveMouse(parsedData);
    console.log('received: %s', data);
    ws.send(sendedString);
  });
});
