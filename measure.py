import sys
import time
import Adafruit_DHT
from socketIO_client import SocketIO

socketIO = SocketIO('localhost', 8080)

while True:
    humidity, temperature = Adafruit_DHT.read_retry(11, 4)
    timestamp = int(time.time())
    print '{0} - Temp: {1:0.1f} C  Humidity: {2:0.1f} %'.format(timestamp, temperature, humidity)
    socketIO.emit('insert', {'time': timestamp, 'type': 'humidity', 'value': humidity})
    socketIO.emit('insert', {'time': timestamp, 'type': 'temperature', 'value': temperature})
    time.sleep(1800)
