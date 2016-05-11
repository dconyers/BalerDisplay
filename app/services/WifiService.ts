const execSync = require('child_process').execSync;
const exec = require('child_process').exec;

/*
TODO: WEP Connection


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
    security: string;
    
    constructor(ssid: string, key: string, conName: string, security: string) {
      this.ssid = ssid;
      this.key = key;
      this.conName = conName;
      this.security = security;
    };
  };
  
  this.currentSSID = null;
  this.macAddr = null;
  
  this.start = function() {
    let obj = this;
    this.checkStatus();
    this.loadMacAddr();
    this.interval = setInterval(obj.checkStatus, 10000);
  };
  
  this.loadMacAddr = () => {
    try {
      let line = execSync("ifconfig wlan0 | grep HWaddr").toString();
      let macStart = line.indexOf("HWaddr") + 7;
      let macEnd = line.substring(macStart).indexOf(" ") + macStart;
      this.macAddr = line.substring(macStart, macEnd).toUpperCase();
    }
    catch(err) {
      console.log("ifconfig wlan0 failed with: " + err.message);
    }
  };
  
  this.getSSIDs = function() {
    let ssids = [];
    // turn output into an array of lines
    let lines = [];
    try {
      lines = execSync("nmcli -m multiline dev wifi list").toString().trim().split("\n");
    }
    catch(err) {
      console.log("nmcli -m multiline dev wifi list failed with: " + err.message);
    }
    if(lines.length >= 8) {
      for(var i = 0; i < lines.length; i += 8) {
        // Only list ssids that support WPA for now
        var security = lines[i + 7].trim().split(/\s+/);
        var securityName = "";
        security.shift();
        var supportedSecurity = false;
        for(var j = 0; j < security.length; j++) {
          if(security[j] == "WPA" || security[j] == "WPA2") {
            if(!(security.length > j + 1 && security[j + 1] == "Enterprise")) {
              // We don't support enterprise wifi security
              supportedSecurity = true;
              securityName = "WPA";
              break;
            }
          }
          else if(security[j] == "WEP") {
            securityName = "WEP";
            supportedSecurity = true;
            break;
          }
        }
        if(security.length < 1) {
          // No security
          supportedSecurity = true;
          securityName = "NONE";
        }
        if(!supportedSecurity) {
          continue;
        }
/* list syntax on pi
*:                                       
SSID:                                   Choice-Staffing-2
MODE:                                   Infra
CHAN:                                   11
RATE:                                   54 Mbit/s
SIGNAL:                                 74
BARS:                                   ▂▄▆_
SECURITY:                               WPA1 WPA2

*/
        var ssidStart = lines[i].indexOf("'") + 1;
        var ssidEnd = lines[i].substring(ssidStart).indexOf("'");
        var ssid = lines[i].substring(ssidStart).substring(0, ssidEnd);
        ssids.push(new SSID(ssid, "", "", securityName));
      }
    }
    return ssids;
  };
  
  this.checkStatus = () => {
    let obj = this;
    let child = exec("nmcli -m multiline c s", obj.parseStatus);
  };
  
  this.parseStatus = (err, stdout, stderr) => {
    if(err) {
      console.log(err);
      return;
    }
    if(stderr) {
      console.log(stderr);
      return;
    }
    // turn output into an array of lines
    let lines = stdout.trim().split("\n");
    // Each device takes 6 lines, and the device name is on the 8th
    if(lines.length >= 8) {
      for(var i = 0; i < lines.length; i += 8) {
        var dev = lines[i + 7].split(/\s+/)[1];
        if(~dev.indexOf("wlan")) {
          var ssidStart = lines[i].substring(5).search(/\S/) + 5;
          this.currentSSID = this.ssidFromName(lines[i].substring(ssidStart));
          return;
        }
      }
    }
    this.currentSSID = null;
  };
  
  this.ssidFromName = function(conName: string) {
    let lines = [];
    let ssid = "";
    try {
      lines = execSync("sudo sed -n -e 's/ssid=\\(.*\\)/\\1/p' -e 's/psk=\\(.*\\)/\\1/p' -e 's/key-mgmt=\\(.*\\)/\\1/p' '/etc/NetworkManager/system-connections/" + conName + "'").toString().trim().split('\n');
      ssid = lines[0];
    }
    catch(err) {
      console.log("sed ... /etc/NetworkManager/system-connections/" + conName + " with: " + err.message);
    }
    var psk = "";
    var security = "NONE";
    if(lines.length > 1) {
      psk = lines[2];
      security = lines[1];
      switch(security) {
        case "wpa-psk":
          security = "WPA";
          break;
        case "none":
          security = "WEP";
          try {
            psk = execSync("sudo sed -n -e 's/wep-key0=\\(.*\\)/\\1/p' '/etc/NetworkManager/system-connections/" + conName + "'").toString().trim();
          }
          catch(err) {
             console.log("sed ... /etc/NetworkManager/system-connections/" + conName + " with: " + err.message);
          }
          break;
      }
    }
    return new SSID(ssid, psk, conName, security);
  };
  
  this.findConnectionFile = function(ssid: string) {
    let files = [];
    try {
      files = execSync("sudo grep -rnwl /etc/NetworkManager/system-connections/ -e 'ssid=" + ssid + "' || true").toString().trim().split('\n');
    }
    catch(err) {
      console.log("sudo grep -rnwl /etc/NetworkManager/system-connections/ failed with: " + err.message);
    }
    return files;
  };
  
  this.makeSSIDObj = (ssid: string, key: string, conName: string, security: string) => {
    return new SSID(ssid, key, conName, security);
  };
  
  this.saveSSID = (ssid: SSID) => {
    if(ssid.conName === "") {
      var files = this.findConnectionFile(ssid.ssid);
      if(files.length > 1 && files[0] !== "") {
        // file with ssid already exists
        ssid.conName = files[0].split("/").pop();
      }
      else {
        ssid.conName = ssid.ssid;
      }
    }
    // generate uuid, takes a while
    exec("uuidgen", (err, stdout, stderr) => {
      if(err) {
        console.log("uuidgen failed: " + err);
        return;
      }
      if(stderr) {
        console.log("uuidgen error: " + stderr);
      }
      if(stdout) {
        let uuid = stdout.toString().trim();
        this.buildConnectionString(uuid, ssid);
      }
    });
  };
  
  this.buildConnectionString = (uuid: string, ssid) => {
    let conString =
    
`[connection]
id=${ssid.conName}
uuid=${uuid}
type=802-11-wireless

[802-11-wireless]
ssid=${ssid.ssid}
mode=infrastructure
mac-address=${this.macAddr}
`;

    if(ssid.security === "WPA" || ssid.security === "WEP") {
      conString += "security=802-11-wireless-security\n\n[802-11-wireless-security]\n";
    }
    if(ssid.security === "WPA") {
      conString +=
      
`key-mgmt=wpa-psk
auth-alg=open
psk=${ssid.key}
`;
    }
    else if(ssid.security === "WEP") {
            conString +=
      
`key-mgmt=none
wep-key0=${ssid.key}
`;
    }
    conString += "\n[ipv4]\nmethod=auto\n\n[ipv6]\nmethod=auto";
    try {
      execSync("sudo sh -c 'umask 077; echo \"" + conString + "\" > \"/etc/NetworkManager/system-connections/" + ssid.conName + "\"'");
    }
    catch(err) {
      console.log("sudo sh -c 'umask 077; echo ... > \"/etc/NetworkManager/system-connections/" + ssid.conName + "\"' failed with: " + err.message);
    }
    // Need to give nmcli a little time to load the new file
    setTimeout(() => {
      exec("nmcli c up id \'" + ssid.conName + "\'", (err, stdout, stderr) => {
        if(err) {
          console.log("nmcli c up id failed with: " + err);
        }
        if(stderr) {
          console.log("nmcli outputed error: " + stderr);
        }
      });
    },
    2000);
  };
}
