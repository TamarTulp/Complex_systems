import websockets
import asyncio

import numpy as np
import pandas as pd

from time import time
import logging
import json


# Initialize Logger
logging.basicConfig(format='%(asctime)-15s %(message)s', level=logging.INFO)
log = logging.getLogger("Simulation Server")

# Get Server Address from "serverinfo.json"
with open('serverinfo.json') as server_info_file:
    server_info = json.load(server_info_file)
    ADDRESS = server_info['address'], server_info['port']

# Load Weight & Threshold Files
W_PATH = 'data/EmpiricalWeightParameters.txt'
b_PATH = 'data/EmpiricalThresholdParameters.txt'
W = np.asarray(pd.read_csv(W_PATH, delimiter='\t', encoding='utf-8'))
b = np.abs(np.asarray(pd.read_csv(b_PATH, delimiter=',', encoding='utf-8').set_index("var"))).ravel()


def simulation_1(I: int, c: float, select: np.ndarray = np.ones(14, np.bool)):
    b_ = b.copy()
    b_[~select] = 100

    X = np.zeros((I, *b.shape), np.bool)
    P = np.zeros((I, *b.shape), np.float32)
    D = np.zeros((I), np.uint8)

    for i in range(1, I):
        A = np.sum(c * W * X[i-1], axis=1)
        P[i] = 1 / (1 + np.exp(b_ - A))
        X[i] = P[i] > np.random.uniform(0, 1, b.shape)
        D[i] = np.sum(X[i])
    return X, P, D


def simulation_2(I: int, c: float, select: np.ndarray = np.ones(14, np.bool)):
    I2 = I//2

    b_ = b.copy()
    b_[~select] = 100

    X = np.zeros((I, *b.shape), np.bool)
    P = np.zeros((I, *b.shape), np.float32)
    D = np.zeros((I), np.uint8)
    S = np.concatenate((np.linspace(-10, 5, I2), np.linspace(5, -10, I2)))

    for i in range(1, I):
        A = np.sum(c * W * X[i-1] + S[i], axis=1)
        P[i] = 1 / (1 + np.exp(b_ - A))
        X[i] = P[i] > np.random.uniform(0, 1, b.shape)
        D[i] = np.sum(X[i])
    return S[:I2], (X[:I2], P[:I2], D[:I2]), (X[I2:][::-1], P[I2:][::-1], D[I2:][::-1])


async def serve(websocket, path):
    """
    Serve Simulations via WebSocket

    Server expects JSON in format:
    {"simulation": 1/2, "I": <integer>, "c": <float>, "select": [<0/1>x14]}
    """
    async for message in websocket:
        parameters = json.loads(message)
        log.info("Simulation Request: {}".format(parameters))

        simulation, I, c = parameters['simulation'], int(parameters['I']), float(parameters['c'])

        t0 = time()
        if simulation == 1:

            if 'select' in parameters:
                select = np.array(parameters['select'], np.bool)
                X, P, D = simulation_1(I, c, select)
            else:
                X, P, D = simulation_1(I, c)

            data = json.dumps({"simulation": 1, "X": X.tolist(), "P": P.tolist(), "D": D.tolist()})
            await websocket.send(data)

        if simulation == 2:
            if 'select' in parameters:
                select = np.array(parameters['select'], np.bool)
                S, (UP_X, UP_P, UP_D), (DOWN_X, DOWN_P, DOWN_D) = simulation_2(I, c, select)
            else:
                S, (UP_X, UP_P, UP_D), (DOWN_X, DOWN_P, DOWN_D) = simulation_2(I, c)

            data = json.dumps({
                "simulation": 2,
                "S": S.tolist(),
                "UP": {"X": UP_X.tolist(), "P": UP_P.tolist(), "D": UP_D.tolist()},
                "DOWN": {"X": DOWN_X.tolist(), "P": DOWN_P.tolist(), "D": DOWN_D.tolist()}})
            await websocket.send(data)

        log.info("Completed Request: {:3.3f}s".format(time() - t0))


# Run Simulation Server
asyncio.get_event_loop().run_until_complete(websockets.serve(serve, *ADDRESS))
log.info("Simulation Server Booted: {}".format(ADDRESS))
asyncio.get_event_loop().run_forever()