const execSync = require('child_process').execSync;
const exec = require('child_process').exec;

/*
An alternative may be to launch onboard and network manager with custom sizing.
http://askubuntu.com/questions/613973/how-can-i-start-up-an-application-with-a-pre-defined-window-size-and-position

New version of nmcli do not have ability to add connections. Must do it by adding
an ini file to /etc/NetworkManager/system-connections/.

For now. Only going to support WPA-PSK with open authentication. Syntax:

[connection]
id=bjnbox // ssid
uuid=7a747fd9-4d5c-4f24-99e0-1f6e6af63808 // use uuidgen to generate
type=802-11-wireless // always use this

[802-11-wireless-security]
key-mgmt=wpa-psk // always
auth-alg=open // always
psk=87654321 // key

[802-11-wireless]
ssid=bjnbox // ssid
mode=infrastructure // always
mac-address=7C:D1:C3:F6:1C:71 // can get from ifconfig
security=802-11-wireless-security // always

[ipv4]
method=auto
// or
method=manual
dns=192.168.2.11;
addresses1=192.168.2.200;24;192.168.2.1;

[ipv6]
method=auto

*/

export function WifiService() {
  class SSID {
    ssid: string;
    key: string;
    conName: string;
    
    constructor(ssid: string, key: string, conName: string) {
      this.ssid = ssid;
      this.key = key;
      this.conName = conName;
    };
  };
  
  this.currentSSID = null;
  
  this.start = function() {
    let obj = this;
    this.checkStatus();
    this.interval = setInterval(obj.checkStatus, 1000);
  };
  
  this.getSSIDs = function() {
    let ssids = [];
    // turn output into an array of lines
    let lines = execSync("nmcli -m multiline dev wifi list").trim().split("\n");
    for(var i = 0; i < Math.floor(lines.length / 8); i += 8) {
      // Only list ssids that support WPA for now
      var security = lines[i + 6].trim().split(/\s+/).shift();
      var supportsWPA = false;
      for(var j = 0; j < security.length; j++) {
        if(~security[j].indexOf("WPA")) {
          supportsWPA = true;
          break;
        }
      }
      if(!supportsWPA) {
        continue;
      }
      var ssidStart = lines[i].indexOf("'") + 1;
      var ssidEnd = lines[i].substring(ssidStart).indexOf("'");
      var ssid = lines[i].substring(ssidStart).substring(0, ssidEnd);
      ssids.push(new this.SSID(ssid, "", ""));
    }
    return ssids;
  };
  
  this.checkStatus = () => {
    console.log("checkStatus called");
    let obj = this;
    let child = exec("nmcli -m multiline c s", obj.parseStatus);
  };
  
  this.parseStatus = (err, stdout, stderr) => {
    console.log("parseStatus called");
    if(err) {
      console.log(err);
      return;
    }
    if(stderr) {
      console.log(stderr);
      return;
    }
    // turn output into an array of lines, and shift.
    let lines = stdout.trim().split("\n");
    // Each device takes 6 lines, and the device name is on the 3rd
    for(var i = 0; i < Math.floor(lines.length / 6); i += 6) {
      var dev = lines[i + 2].split(/\s+/)[1];
      if(~dev.indexOf("wlan")) {
        var ssidStart = lines[i].substring(5).search(/\S/) + 5;
        this.currentSSID = this.ssidFromName(lines[i].substring(ssidStart));
        return;
      }
    }
    this.currentSSID = null;
  };
  
  this.ssidFromName = function(conName: string) {
    let lines = execSync("sudo sed -n -e 's/psk=\\(.*\\)/\\1/p' -e 's/ssid=\\(.*\\)/\\1/p' '/etc/NetworkManager/system-connections/" + conName + "'").toString().trim().split('\n');
    var psk = lines[0];
    var ssid = lines[1];
    return new SSID(psk, ssid, conName);
  };
  
  this.findConnectionFile = function(ssid: string) {
    let files = exec("sudo grep -rnwl /etc/NetworkManager/system-connections/ -e 'ssid=bjnbox'").trim().split('\n');
    return files;
  };
}
