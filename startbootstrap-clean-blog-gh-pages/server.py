#!/usr/bin/env python

import asyncio
import websockets
import numpy as np
import pandas as pd
import json

ADDRESS = 'localhost', 8765

W_PATH = 'data/EmpiricalWeightParameters.txt'
b_PATH = 'data/EmpiricalThresholdParameters.txt'

W = np.asarray(pd.read_csv(W_PATH, delimiter='\t', encoding='utf-8'))
b = np.abs(np.asarray(pd.read_csv(b_PATH, delimiter=',', encoding='utf-8').set_index("var"))).ravel()


def simulation_1(I: int=1500, c: float = 0.8):
    X = np.zeros(b.shape, np.bool)

    D = np.empty(I, np.uint8)

    print(I, c)

    for i in range(I):
        A = np.sum(c * W * X, axis=1)
        P = 1 / (1 + np.exp(b - A))
        X = P > np.random.uniform(0, 1, P.shape)

        D[i] = np.sum(X)

    return D


async def hello(websocket, path):
    async for message in websocket:
        parameters = json.loads(message)
        D = simulation_1(int(parameters['I']), float(parameters['c']))
        await websocket.send(json.dumps(D.tolist()))
        print("Done!")

print("lksnvflia snzxgrdjxcgfo d")
asyncio.get_event_loop().run_until_complete(
    websockets.serve(hello, 'localhost', 8765)
)
asyncio.get_event_loop().run_forever()