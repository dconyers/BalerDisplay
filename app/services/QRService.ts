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
  createLabelImage(baleEvent: BalerEmptiedEvent): Promise<string> {
    let data =
        "Bale Type:    " + baleEvent.baleType.material +
      "\nBale Date:    " + baleEvent.baleDate.toLocaleDateString("en-US") + " " + baleEvent.baleDate.toLocaleTimeString("en-US") +
      "\nPartner ID:   " + baleEvent.customerID +
      "\nEquipment ID: " + baleEvent.baleID +
      "\nBale ID:      " + baleEvent.baleID +
      "\nWeight:       " + baleEvent.weight
      ;
    let pngData = qr.imageSync("http://chickenpotpie.asuscomm.com/" +
      "?material=" + encodeURIComponent(baleEvent.baleType.material) +
      "&weight=" + encodeURIComponent(baleEvent.weight.toString()) +
      "&worker=" + encodeURIComponent(baleEvent.worker.pin.toString()) +
      "&baleID=" + encodeURIComponent(baleEvent.baleID.toString()) +
      "&balerID=" + encodeURIComponent(baleEvent.balerID.toString()) +
      "&customerID=" + encodeURIComponent(baleEvent.customerID.toString()) +
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
               " -geometry +0+2100" +
               " -resize 2100x2400" +
               " ./tmp/template.png" +
               " +swap" +
               " -composite" +
               " \\( +clone -crop 2100x2400+0+2000 -rotate -90 -resize 1200x -geometry +0+90 \\)" +
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
