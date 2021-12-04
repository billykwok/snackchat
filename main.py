import time
import logging
from typing import Any, List
from adafruit_motor.servo import ContinuousServo
from adafruit_crickit import crickit
from starlette.websockets import WebSocket
from uvicorn import Config, Server
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.middleware import Middleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.routing import Mount, WebSocketRoute
from starlette.staticfiles import StaticFiles
from uvicorn.config import LOGGING_CONFIG


LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
logging.basicConfig(format=LOG_FORMAT, level=logging.INFO)
LOGGING_CONFIG["formatters"]["default"]["fmt"] = LOG_FORMAT
LOGGING_CONFIG["formatters"]["access"][
    "fmt"
] = "%(asctime)s | %(levelname)s | %(name)s | %(client_addr)s | %(request_line)s | %(status_code)s"
LOGGING_CONFIG["loggers"]["uvicorn.error"]["handlers"] = ["default"]
LOGGING_CONFIG["loggers"]["uvicorn.error"]["propagate"] = False
logger = logging.getLogger("main")

websockets: List[WebSocket] = []
continuous_servos: List[ContinuousServo] = [
    crickit.continuous_servo_1,
    crickit.continuous_servo_2,
    crickit.continuous_servo_3,
    crickit.continuous_servo_4,
]


def dispense(i: int):
    if i < 0 or i > 3:
        raise ValueError("Invalid dispense index")
    for _ in range(100):
        continuous_servos[i].throttle = 1
        time.sleep(0.05)
        continuous_servos[i].throttle = 0
        time.sleep(0.05)


class DataEndpoint(WebSocketEndpoint):
    async def on_connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        websockets.append(websocket)
        logger.info("Connected to %s", websocket)

    async def on_disconnect(self, websocket: WebSocket, close_code: int) -> None:
        websockets.remove(websocket)
        logger.warning(
            "Disconnected from websocket %s with code %s", websocket, close_code
        )
        await websocket.close()

    async def on_receive(self, websocket: WebSocket, data: Any) -> None:
        logger.debug("Socket: %s, Message: %s", websocket, data)


def main():
    app = Starlette(
        routes=[
            WebSocketRoute("/ws", endpoint=DataEndpoint),
            Mount("/", app=StaticFiles(directory="build", html=True), name="build"),
        ],
        middleware=[Middleware(GZipMiddleware, minimum_size=1000)],
    )
    server = Server(
        config=Config(
            host="localhost",
            port=23508,
            app=app,
        )
    )
    # dispense(0)
    # dispense(1)
    # dispense(2)
    # dispense(3)
    server.run()


if __name__ == "__main__":
    main()