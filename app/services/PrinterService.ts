/*
PRINTER POLLING AND CONFIGURATION
- Check /etc/cups/printers.conf
  - unplugged example
      # Printer configuration file for CUPS v1.7.2
      # Written by cupsd
      # DO NOT EDIT THIS FILE WHEN CUPSD IS RUNNING
      <Printer Zebra_Technologies_ZTC_GK420t>
      UUID urn:uuid:a70bc2fc-e369-3be0-4f25-34bfde834ea8
      Info Zebra Technologies ZTC GK420t
      DeviceURI usb://Zebra%20Technologies/ZTC%20GK420t?serial=29J153500994
      PPDTimeStamp *
      State Stopped
      StateMessage Unplugged or turned off
      StateTime 1463530066
      Reason paused
      Type 36932
      Accepting Yes
      Shared No
      ColorManaged Yes
      JobSheets none none
      QuotaPeriod 0
      PageLimit 0
      KLimit 0
      OpPolicy default
      ErrorPolicy retry-job
      </Printer>
  - idle example
      # Printer configuration file for CUPS v1.7.2
      # Written by cupsd
      # DO NOT EDIT THIS FILE WHEN CUPSD IS RUNNING
      <Printer Zebra_Technologies_ZTC_GK420t>
      UUID urn:uuid:a70bc2fc-e369-3be0-4f25-34bfde834ea8
      Info Zebra Technologies ZTC GK420t
      DeviceURI usb://Zebra%20Technologies/ZTC%20GK420t?serial=29J153500994
      PPDTimeStamp *
      State Idle
      StateTime 1463530255
      Type 36932
      Accepting Yes
      Shared No
      ColorManaged Yes
      JobSheets none none
      QuotaPeriod 0
      PageLimit 0
      KLimit 0
      OpPolicy default
      ErrorPolicy retry-job
    </Printer>
- Check if any GK420t printer is connected
  - sudo cat /sys/kernel/debug/usb/devices
    - each device seperated by empty newline
    - example
        T:  Bus=01 Lev=02 Prnt=03 Port=02 Cnt=03 Dev#=  9 Spd=12   MxCh= 0
        D:  Ver= 1.10 Cls=00(>ifc ) Sub=00 Prot=00 MxPS= 8 #Cfgs=  1
        P:  Vendor=0a5f ProdID=0081 Rev=17.17
        S:  Manufacturer=Zebra Technologies
        S:  Product=ZTC GK420t
        S:  SerialNumber=29J153500994
        C:* #Ifs= 1 Cfg#= 1 Atr=c0 MxPwr=  0mA
        I:* If#= 0 Alt= 0 #EPs= 2 Cls=07(print) Sub=01 Prot=02 Driver=usblp
        E:  Ad=82(I) Atr=02(Bulk) MxPS=  64 Ivl=0ms
        E:  Ad=01(O) Atr=02(Bulk) MxPS=  64 Ivl=0ms
*/

const exec = require('child_process').exec;

export class PrinterService {
  constructor() {
    this.checkPrinterAndSetup();
    setInterval(this.checkPrinterAndSetup, 60000);
  }
  
  printImage(path: string): Promise {
    return new Promise((resolve, reject) => {
      this.getPrinterStateAndSerial().then((result) => {
        if(result.status === "Idle") {
          // can print
          exec("lpr -P Zebra_Technologies_ZTC_GK420t " + path,
            (err, stdout, stderr) => {
              if(err) {
                reject(err);
              }
              if(stderr) {
                reject(stderr);
              }
              if(!(err || stderr)) {
                resolve();
              }
          });
        }
        else {
          reject(new Error("Cannot print, printer status: " + result.status));
        }
      })
      .catch((reason) => {
        reject(reason);
      });
    });
  }
  
  getPrinterStateAndSerial(): Promise {
    return new Promise((resolve, reject) => {
      exec("sudo sed -n -e 's/State \\(.*\\)/\\1/p' -e 's/DeviceURI usb:\\/\\/Zebra%20Technologies\\/ZTC%20GK420t?serial=\\(.*\\)/\\1/p' '/etc/cups/printers.conf'",
        (err, stdout, stderr) => {
          if(err) {
            console.log("Parsing /etc/cups/printers.conf failed with: " + err.message);
            reject(err);
          }
          if(stderr) {
            console.log("Parsing /etc/cups/printers.conf failed with: " + stderr);
            reject(stderr);
          }
          if(!(err || stderr)) {
            let lines = stdout.toString().trim().split('\n');
            resolve({status: lines[1].trim(), serial: lines[0].trim()});
          }
      });
    });
  }
  
  /* Called periodically. Checks printer status to make sure printer is
     available to CUPS. If it is not checks to see if a printer is connected,
     and the serial number in configuration matches the serial number of the
     connected printer. May not match if printer was unplugged and another one
     was installed */
  checkPrinterAndSetup = () => {
    this.getPrinterStateAndSerial().then((result) => {
      if(result.status !== "Idle") {
        // Printer is not available for printing.
        // Check if a printer is connected
        exec("sudo cat /sys/kernel/debug/usb/devices",
          (err, stdout, stderr) => {
            if(err) {
              console.log("Parsing /sys/kernel/debug/usb/devices failed with: " + err.message);
            }
            if(stderr) {
              console.log("Parsing /sys/kernel/debug/usb/devices failed with: " + stderr);
            }
            if(!(err || stderr)) {
              let lines = stdout.toString().trim().split('\n');
              // Search for a GK420t printer
              for(var i = 0; i < lines.length; i++) {
                if(~lines[i].indexOf("GK420t")) {
                  // A printer is connected, but not available in CUPS.
                  // Check if serial number is different
                  let devSerial = lines[i+1].substring(lines[i + 1].indexOf("=") + 1).trim();
                  if(devSerial !== result.serial) {
                    // Different printer connected, update serial number in /etc/cups/printers.conf
                    this.updateSerial(devSerial);
                  }
                  break;
                }
              }
            }
        });
      }
    })
    .catch((reason) => {
      console.log("getPrinterStateAndSerial failed: " + reason);
    });
  }
  
  updateSerial(serial: string) {
    console.log("prupdateSerialintImage called");
    // stop cups service
    exec("sudo service cups stop",
      (err, stdout, stderr) => {
        if(err) {
          console.log("sudo service cups stop failed with: " + err.message);
        }
        if(stderr) {
          console.log("sudo service cups stop failed with: " + stderr);
        }
        if(!(err || stderr)) {
          // update serial number in file.
          exec("sudo sed -i -e 's/\\(DeviceURI usb:\\/\\/Zebra%20Technologies\\/ZTC%20GK420t?serial=\\).*/\\1" + serial + "/' '/etc/cups/printers.conf'",
            (err, stdout, stderr) => {
              if(err) {
                console.log("Editing /etc/cups/printers.conf failed with: " + err.message);
              }
              if(stderr) {
                console.log("Editing /etc/cups/printers.conf failed with: " + stderr);
              }
              // Restart CUPS
              exec("sudo service cups start");
          });
        }
    });
  }
}
