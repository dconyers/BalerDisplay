import {BalerEmptiedEvent} from "../BalerEmptiedEvent/BalerEmptiedEvent";
import {PrinterService} from "../services/PrinterService.ts";

const qr = require('qr-image');
const fs = require('fs');
const tmp = require("tmp");
const exec = require('child_process').exec;

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
      "\nbaleDate: " + baleEvent.baleDate.toLocaleDateString("en-US") + " " + baleEvent.baleDate.toLocaleTimeString("en-US");
    let pngData = qr.imageSync("http://chickenpotpie.asuscomm.com/" +
      "?material=" + encodeURIComponent(baleEvent.baleType.material) +
      "&weight=" + encodeURIComponent(baleEvent.weight.toString()) +
      "&worker=" + encodeURIComponent(baleEvent.worker.pin.toString()) +
      "&date=" + encodeURIComponent(baleEvent.baleDate.toLocaleDateString("en-US") + " " + baleEvent.baleDate.toLocaleTimeString("en-US")),
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
          exec("convert " +
               tmpName +
               " label:'" + data + "'" +
               " -gravity Center" +
               " +swap" +
               " -append" +
               " -gravity North" +
               " -geometry +0+350" +
               " -scale 350x400" +
               " ./tmp/template.png" +
               " +swap" +
               " -composite" +
               " \\( +clone -crop 350x400+0+325 -rotate -90 -scale 200x -geometry +0+15 \\)" +
               " -composite" +
               " -rotate 90 " +
               tmpName,
               (err, stdout, stderr) => {
                 if(err) {
                   fs.unlink(tmpName);
                   reject(err);
                 }
                 if(stderr) {
                   fs.unlink(tmpName);
                   reject(stderr);
                 }
                 if(!(err || stderr)) {
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
