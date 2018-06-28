import subprocess
import threading
import webbrowser
from time import sleep


HTTP_SERVER = ['python', '-m', 'http.server']
SOCKET_SERVER = ['python', 'server.py']

threading.Thread(target=subprocess.call, args=(SOCKET_SERVER,)).start()
threading.Thread(target=subprocess.call, args=(HTTP_SERVER,)).start()

sleep(1)  # Wait for Servers to Boot

webbrowser.open_new_tab('http://localhost:8000/Website/')
