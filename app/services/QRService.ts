import {BalerEmptiedEvent} from "../BalerEmptiedEvent/BalerEmptiedEvent";

const qr = require('qr-image');
const fs = require('fs');
const im = require('imagemagick');
const tmp = require("tmp");

export class QRService {
  constructor() {
  }

  /* @return Promise that resolves to the path of the QR code
  */
  createLabelImage(baleEvent: BalerEmptiedEvent): Promise {
    let data = "Baletype: " + baleEvent.baleType.material +
      "\nweight: " + baleEvent.weight +
      "\nbaleDate: " + baleEvent.baleDate.toLocaleTimeString("en-US");
    let pngData = qr.imageSync(data,
      { type: 'png', ec_level: 'H' });
    let tmpName = tmp.tmpNameSync({template: "./tmp/qr-XXXXXX.png"});
    let writePromise = new Promise(function(resolve, reject) {
      fs.writeFile(tmpName, pngData, function(err) {
        if(err) {
          fs.unlink(tmpName);
          Promise.reject(err);
        }
        else {
          // writing QR Code image successful, now add label.
          im.convert([tmpName, "label:" + data, '+swap', '-gravity', 'Center', '-append', tmpName],
            function(err) {
              if(err) {
                fs.unlink(tmpName);
                Promise.reject(err);
              }
              else {
                Promise.resolve(tmpName);
              }
          });
        }
      });
    });
    return writePromise;
  }

  printLabelImage(path: string) {
    // print label image, then delete file
    fs.unlink(path);
  }
}
