import serial, sys

ser = serial.Serial('/dev/ttyS0', 115200, timeout=0.002, writeTimeout=0.002)
for i in range(10):
  ser.write("AT\n")
  while True:
    response = ser.read(2)
    if len(response) == 0:
      # No response. Try sending AT command again.
      break
    if response == "OK":
      print("Responding")
      ser.close()
      sys.exit()
print("Not Responding")
ser.close()

