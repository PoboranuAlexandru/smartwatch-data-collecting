import { Accelerometer } from "accelerometer";
import document from "document";
import { Gyroscope } from "gyroscope";
import { HeartRateSensor } from "heart-rate";
import { OrientationSensor } from "orientation";
import { outbox } from "file-transfer";
import { encode } from "cbor"
import { me } from "appbit";
import { display } from "display";
import { clock } from "clock";

display.autoOff = false;
display.on = true;
const sensors = [];

var collecting = false;
var hbData = "";
var accData = "";
var grData = "";
var selTxt = "";

const to2Digits = (num) => { return num < 10 ? "0"+num : num; };

const btnStart = document.getElementById("start-collecting");
const btnStop = document.getElementById("stop-collecting");
const btnMovement = document.getElementById("btn-movement");
const btnDesk = document.getElementById("btn-desk");
const btnGestures = document.getElementById("btn-gestures");
const scrollSelection = document.getElementById("selection-scroll");
const mvtSelection = document.getElementById("movement-scroll");
const gstSelection = document.getElementById("gestures-scroll");
const btnBackMvt = document.getElementById("btn-back-mvt");
const btnBackGst = document.getElementById("btn-back-gst");

const btnSel1 = document.getElementById("btn-slow");
const btnSel2 = document.getElementById("btn-fast");
const btnSel3 = document.getElementById("btn-pockets");
const btnSel4 = document.getElementById("btn-handwave");
const btnSel5 = document.getElementById("btn-signature");
const btnSel6 = document.getElementById("btn-infinity");
const btnSel7 = document.getElementById("btn-desk");

const labelSelection = document.getElementById("selection-label");

const sentObj = {
  activityType: "",
  accelerometer: [],
  gyroscope: [],
  heart_rate: []
}

const freq = 10;

function memorySizeOf(obj) {
    var bytes = 0;

    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };

    return sizeOf(obj);
};

const onSelectionClick = (evt, selection) => {
  mvtSelection.style.display = "none";
  gstSelection.style.display = "none";
  scrollSelection.style.display = "none";
  btnStop.style.display = "";
  labelSelection.style.display = "";
  labelSelection.text = selection;
  /*hbData = "";
  accData = "";
  grData = "";*/
  selTxt = selection;
  collecting = true;
  const sentObj = {
    activityType: "",
    accelerometer: [],
    gyroscope: [],
    heart_rate: []
  }
  seconds = 0;
}

btnStop.style.display = "none";
btnStart.style.display = "none";
mvtSelection.style.display = "none";
gstSelection.style.display = "none";
labelSelection.style.display = "none";

btnSel1.addEventListener("click", (evt) => {onSelectionClick(evt, "normalMvt")});
btnSel2.addEventListener("click", (evt) => {onSelectionClick(evt, "fastMvt")});
btnSel3.addEventListener("click", (evt) => {onSelectionClick(evt, "pocketsMvt")});
btnSel4.addEventListener("click", (evt) => {onSelectionClick(evt, "handwaveGst")});
btnSel5.addEventListener("click", (evt) => {onSelectionClick(evt, "signatureGst")});
btnSel6.addEventListener("click", (evt) => {onSelectionClick(evt, "infinityGst")});
btnSel7.addEventListener("click", (evt) => {onSelectionClick(evt, "deskActivity")});

btnMovement.addEventListener("click", (evt) => {
  scrollSelection.style.display = "none";
  mvtSelection.style.display = "";
});

btnGestures.addEventListener("click", (evt) => {
  scrollSelection.style.display = "none";
  gstSelection.style.display = "";
});

btnBackMvt.addEventListener("click", (evt) => {
  scrollSelection.style.display = "";
  mvtSelection.style.display = "none";
});

btnBackGst.addEventListener("click", (evt) => {
  scrollSelection.style.display = "";
  gstSelection.style.display = "none";
});


const sendFile = () => {
  const filename = selTxt + "_" + Date.now() + ".txt";
  //console.log(JSON.stringify(sentObj));
  //console.log("Object size: " + memorySizeOf(sentObj));
  console.log("File name is: " + filename);
  sentObj.activityType = selTxt;
  outbox.enqueue(filename, encode(sentObj))
    .catch((err) => {
    throw new Error("Failed to queue" + filename + ". Error: " + err);
  })
  
  sentObj = {
    activityType: "",
    accelerometer: [],
    gyroscope: [],
    heart_rate: []
  }
}

const prepareSendFile = () => {
  collecting = false;
  /*hbData = JSON.stringify({activityType: selTxt}) + hbData;
  accData = JSON.stringify({activityType: selTxt}) + accData;
  grData = JSON.stringify({activityType: selTxt}) + grData;
  console.log("HBData: " + JSON.stringify(hartbeatData));
  console.log("AccData: " + JSON.stringify(acceleroData));
  console.log("GyroData: " + JSON.stringify(gyroData));*/
  btnStop.style.display = "none";
  scrollSelection.style.display = "";
  
  /*console.log("Sending files...");
  sendFile(hbData, "heartbeat");
  sendFile(accData, "accelerometer");
  sendFile(grData, "gyroscope");*/
  
  sendFile();
}

btnStop.addEventListener("click", (evt) => {
  prepareSendFile();
});

me.onunload = () => {
  if(collecting){
    prepareSendFile();
  }
}

if (Accelerometer) {
  const accel = new Accelerometer({ frequency: freq });
  accel.addEventListener("reading", () => {
    const today = new Date();
    if(collecting){
      sentObj.accelerometer.push({
        timestamp: Date.now(),
        x: accel.x ? accel.x.toFixed(1) : 0,
        y: accel.y ? accel.y.toFixed(1) : 0,
        z: accel.z ? accel.z.toFixed(1) : 0
      })
    }
  });
  sensors.push(accel);
  accel.start();
}


if (Gyroscope) {
  const gyro = new Gyroscope({ frequency: freq });
  gyro.addEventListener("reading", () => {
    const today = new Date();
    /*const gyroData = JSON.stringify({
      timestamp: to2Digits((today.getMonth()+1))+'-'+to2Digits(today.getDate())+'-'+ today.getFullYear() + " " + to2Digits(today.getHours()) + ":" + to2Digits(today.getMinutes())+ ":" + to2Digits(today.getMinutes()) + ":" + to2Digits(today.getSeconds()) + ":" + today.getMilliseconds(),
      x: gyro.x ? gyro.x.toFixed(1) : 0,
      y: gyro.y ? gyro.y.toFixed(1) : 0,
      z: gyro.z ? gyro.z.toFixed(1) : 0
    });*/
    
    if(collecting){
      sentObj.gyroscope.push({
        timestamp: Date.now(),
        x: gyro.x ? gyro.x.toFixed(1) : 0,
        y: gyro.y ? gyro.y.toFixed(1) : 0,
        z: gyro.z ? gyro.z.toFixed(1) : 0
      })
    }
  });
  sensors.push(gyro);
  gyro.start();
}

if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: freq });
  hrm.addEventListener("reading", () => {
    const today = new Date();
    /*const hrmData = JSON.stringify({
      timestamp: to2Digits((today.getMonth()+1))+'-'+to2Digits(today.getDate())+'-'+ today.getFullYear() + " " + to2Digits(today.getHours()) + ":" + to2Digits(today.getMinutes()) + ":" + to2Digits(today.getSeconds()) + ":" + today.getMilliseconds(),
      heartRate: hrm.heartRate ? hrm.heartRate.toFixed(2) : 0
    });*/
    
    if(collecting){
      sentObj.heart_rate.push({
        timestamp: Date.now(),
        heartRate: hrm.heartRate ? hrm.heartRate.toFixed(2) : 0
      })
    }

  });
  sensors.push(hrm);
  hrm.start();
}

const seconds = 0;
const pollingInterval = 5;
const spaceLimitKB = 12;
clock.granularity = "seconds";
clock.ontick = (evt) => {
  if(!collecting)
    return;
  
  display.poke();
  seconds++;
  if(seconds < pollingInterval){
    return;
  }
  
  seconds = 0;
  const objMemoryKB = memorySizeOf(sentObj) / 1024.0;
  console.log("Object size(KB): " + objMemoryKB);
    if(objMemoryKB > spaceLimitKB){
      sendFile();
    }
}