import {BalerEmptiedEvent} from "./BalerEmptiedEvent";

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
    let label = "Baletype: " + baleEvent.baleType.material +
      " weight: " + baleEvent.weight +
      " baleDate: " + baleEvent.baleDate.toLocaleTimeString("en-US");
    let pngData = qr.imageSync("Baletype: " + baleEvent.baleType.material +
      "\nweight: " + baleEvent.weight +
      "\nbaleDate: " + baleEvent.baleDate.toLocaleTimeString("en-US"),
      { type: 'png', ec_level: 'H' });
    let tmpName = tmp.tmpNameSync({template: "./tmp/qr-XXXXXX.png"});
    let writePromise = new Promise(function(resolve, reject) {
      fs.writeFile(tmpName, pngData, function(err) {
        if(err) {
          fs.unlink(tmpName);
          Promise.reject(err);
        }
        else {
          Promise.resolve();
        }
      });
    });
    let convertPromise = new Promise(function(resolve, reject) {
      console.log(tmpName);
      im.convert([tmpName, "label:'" + label + "'", '+swap', '-gravity', 'Center', '-append', 'tmpName'],
        function(err) {
          if(err) {
            fs.unlink(tmpName);
            Promise.reject(err);
          }
          else {
            Promise.resolve(tmpName);
          }
        });
    });
    return Promise.all([writePromise, convertPromise]);
  }

  printLabelImage(path: string) {
    // print label image, then delete file
    fs.unlink(path);
  }
}
