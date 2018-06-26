import subprocess
import threading
import webbrowser


HTTP_SERVER = ['python', '-m', 'http.server']
SOCKET_SERVER = ['python', 'startbootstrap-clean-blog-gh-pages/server.py']

threading.Thread(target=subprocess.call, args=(HTTP_SERVER,)).start()
threading.Thread(target=subprocess.call, args=(SOCKET_SERVER,)).start()

webbrowser.open_new_tab('http://localhost:8000/startbootstrap-clean-blog-gh-pages/')