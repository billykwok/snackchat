from asyncio.tasks import ALL_COMPLETED
import time
import logging
import asyncio
from typing import List, Tuple
from enum import Enum
from threading import Timer

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


class State(Enum):
    WAITING_FOR_FULLSCREEN = "WAITING_FOR_FULLSCREEN"
    INTRO = "INTRO"
    PROMPT_FOR_QUESTION_LEFT = "PROMPT_FOR_QUESTION_LEFT"
    PROMPT_FOR_ANSWER_LEFT = "PROMPT_FOR_ANSWER_LEFT"
    PROMPT_FOR_QUESTION_RIGHT = "PROMPT_FOR_QUESTION_RIGHT"
    PROMPT_FOR_ANSWER_RIGHT = "PROMPT_FOR_ANSWER_RIGHT"
    DISPENSE = "D"


class Question(Enum):
    TIME_TRAVEL = 0
    FAVORITE_DISH = 1
    NOT_ROBOT = 2
    CRAZIEST_DREAM = 3


class StateMachine:
    state: State = State.INTRO
    questions: Tuple[Question, Question] = [None, None]
    names: Tuple[str, str] = [None, None]


stateMachine: StateMachine = StateMachine()


def dispense(i: int):
    if i < 0 or i > 3:
        raise ValueError("Invalid dispense index")
    continuous_servos[i].throttle = 1
    time.sleep(1)
    continuous_servos[i].throttle = servo_default_positions[i]


async def send(*args, **kwargs):
    value = args[0]
    logger.info("Sending: " + value)
    await asyncio.wait(
        [asyncio.create_task(ws.send_text(value)) for ws in websockets],
        timeout=3,
        return_when=ALL_COMPLETED,
    )


async def conclude():
    r = requests.get("https://stin.to/en/create-chat")
    logger.info(r.url)
    printer.print("\n\n\n")
    printer.print(r.url)
    printer.print("\n\n\n")
    printer.print(r.url)
    printer.print("\n\n\n")
    if stateMachine.questions[0] is not None:
        dispense(stateMachine.questions[0].value)
    if stateMachine.questions[1] is not None:
        dispense(stateMachine.questions[1].value)
    await send("DISPENSE")
    stateMachine.state = State.INTRO
    stateMachine.names = [None, None]
    stateMachine.questions = [None, None]
    Timer(20.0, send, args=("INTRO")).start()


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
        stateMachine.state = State.INTRO
        stateMachine.names = [None, None]
        stateMachine.questions = [None, None]
        await websocket.close()

    async def on_receive(self, websocket: WebSocket, data: str) -> None:
        logger.info("Socket: %s, Message: %s", websocket, data)

        logger.info(stateMachine.state)
        if "QL" in data:
            stateMachine.state = State.PROMPT_FOR_QUESTION_LEFT
            await send("QL")
            return

        if "QR" in data:
            stateMachine.state = State.PROMPT_FOR_QUESTION_RIGHT
            await send("QR")
            return

        if "D" in data:
            stateMachine.state = State.DISPENSE
            await send("D")
            await conclude()
            return

        if "INTRO" in data:
            stateMachine.state = State.INTRO
            await send("INTRO")
            return

        if len(data) > 1 and "A" == data[0:1]:
            stateMachine.questions[0] = Question(int(data[1:2]))
            stateMachine.state = State.PROMPT_FOR_ANSWER_LEFT
            await send("A" + str(stateMachine.questions[0].value))
            return

        if len(data) > 1 and "B" == data[0:1]:
            stateMachine.questions[1] = Question(int(data[1:2]))
            await send("B" + str(stateMachine.questions[1].value))


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
