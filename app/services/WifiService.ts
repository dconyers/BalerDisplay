const execSync = require('child_process').execSync;

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
    security: string[];
  
    constructor(ssid: string, security: string[]) {
      this.ssid = ssid;
      this.security = security.slice();
    }
  }
  
  
  this.getSSIDs = function() {
    let ssids = [];
    let lines = execSync("nmcli dev wifi list").trim().split("\n").shift();
    for(var i = 0; i < lines.length; i++) {
      var cols = lines[i].split(/s+/);
      var numSecurity = cols.length - 7;
      var security = cols.slice(8, 8 + numSecurity);
      ssids.push(new SSID(cols[0], security));
    }
    return ssids;
  }
}
