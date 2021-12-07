import time
import logging
from typing import List
from adafruit_motor.servo import ContinuousServo
from adafruit_crickit import crickit
from starlette.websockets import WebSocket
import requests
from uvicorn import Config, Server
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.middleware import Middleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.routing import Mount, WebSocketRoute
from starlette.staticfiles import StaticFiles
from uvicorn.config import LOGGING_CONFIG
import serial
import adafruit_thermal_printer

ThermalPrinter = adafruit_thermal_printer.get_printer_class(2.69)
uart = serial.Serial("/dev/serial0", baudrate=19200, timeout=3000)
printer = ThermalPrinter(uart)


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
servo_default_positions = [-0.05, -0.12, -0.05, -0.1]


def dispense(i: int):
    if i < 0 or i > 3:
        raise ValueError("Invalid dispense index")
    continuous_servos[i].throttle = 1
    time.sleep(1)
    continuous_servos[i].throttle = servo_default_positions[i]


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

    async def on_receive(self, websocket: WebSocket, data: bytes) -> None:
        logger.log("Socket: %s, Message: %s", websocket, data)
        if "D1" in data:
            dispense(0)
        if "D2" in data:
            dispense(1)
        if "D3" in data:
            dispense(2)
        if "D4" in data:
            dispense(3)
        if "P" in data:
            r = requests.get("https://stin.to/en/create-chat")
            printer.print(r.url)
            printer.print(r.url)


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
            host="0.0.0.0",
            port=21489,
            app=app,
        )
    )
    server.run()


if __name__ == "__main__":
    main()
