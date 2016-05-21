import {BalerEmptiedEvent} from "../BalerEmptiedEvent/BalerEmptiedEvent";
import {PrinterService} from "../services/PrinterService.ts";

const qr = require('qr-image');
const fs = require('fs');
const im = require('imagemagick');
const tmp = require("tmp");

export class QRService {
  printerService: PrinterService;

  constructor(PrinterService) {
    this.printerService = PrinterService;
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
          reject(err);
        }
        else {
          // writing QR Code image successful, now add label.
          im.convert([tmpName, "label:" + data, '+swap', '-gravity', 'Center', '-append', tmpName],
            function(err) {
              if(err) {
                fs.unlink(tmpName);
                reject(err);
              }
              else {
                resolve(tmpName);
              }
          });
        }
      });
    });
    return writePromise;
  }

  printLabelImage(path: string) {
    console.log("printLabelImage called");
    // print label image, then delete file
    this.printerService.printImage(path).then(() => {
      fs.unlink(path);
    })
    .catch((reason) => {
      console.log("printImage failed with: " + reason);
      fs.unlink(path);
    });
  }
}
