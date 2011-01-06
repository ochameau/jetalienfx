const {components} = require("chrome");
const ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;

const win32 = require("win32");
const setupapi = require("win-setupapi");
const kernel32 = require("win-kernel32");
const hid = require("win-hid");

// Search for a device file handle
// from its vendor ID and product ID
// As device may have multiple product IDs, pProductIds is an array of IDs.
function getDeviceWithProviderAndProductId(pVendorId, pProductIds) {
  let guid = new win32.types.GUID();
  
  hid.HidD_GetHidGuid(guid.address());
  
  let hDevInfo = setupapi.SetupDiGetClassDevs(guid.address(), null, null, setupapi.consts.DIGCF_PRESENT | setupapi.consts.DIGCF_DEVICEINTERFACE);
  
  let deviceInterfaceData = new setupapi.types.SP_DEVICE_INTERFACE_DATA();
  deviceInterfaceData.cbSize = setupapi.types.SP_DEVICE_INTERFACE_DATA.size;
  let dw = 0;
  while (setupapi.SetupDiEnumDeviceInterfaces(hDevInfo, null, guid.address(), dw++, deviceInterfaceData.address()))
  {
    let dwRequiredSize = win32.types.DWORD(0);
    if (setupapi.SetupDiGetDeviceInterfaceDetail(hDevInfo,deviceInterfaceData.address(),null,0,dwRequiredSize.address(),null))
      return;
    
    let TEMPORARY_STRUCT = ctypes.StructType("SP_DEVICE_INTERFACE_DETAIL_DATA",
      [{ "cbSize"  : win32.types.DWORD },
       { "DevicePath" : ctypes.jschar.array(dwRequiredSize.value-win32.types.DWORD.size)}]);
    
    let deviceInterfaceDetailData = new TEMPORARY_STRUCT();
    // Hack found in scanwin32.py -> SIZEOF_SP_DEVICE_INTERFACE_DETAIL_DATA_A from pygsm project!
    // without this hack, SetupDiGetDeviceInterfaceDetail is going to fail
    deviceInterfaceDetailData.cbSize = win32.types.DWORD.size+ctypes.jschar.size; 
    
    
    if (!setupapi.SetupDiGetDeviceInterfaceDetail(hDevInfo, deviceInterfaceData.address(), deviceInterfaceDetailData.address(), dwRequiredSize.value, null, null)) {
      continue;
    }
    
    let DevicePath = deviceInterfaceDetailData.DevicePath.readString();
    console.log(DevicePath);
    let hDevice = kernel32.CreateFile(DevicePath, kernel32.consts.FILE_GENERIC_WRITE | kernel32.consts.FILE_GENERIC_READ, kernel32.consts.FILE_SHARE_READ | kernel32.consts.FILE_SHARE_WRITE, null, kernel32.consts.OPEN_EXISTING, 0, null);
    if (hDevice != kernel32.consts.INVALID_HANDLE_VALUE)
    {
      let attributes = new hid.types.HIDD_ATTRIBUTES();
      attributes.Size = hid.types.HIDD_ATTRIBUTES.size;
      if (hid.HidD_GetAttributes(hDevice, attributes.address()) && (console.log("vendor:"+attributes.VendorID+"/"+attributes.ProductID) || true) && ((attributes.VendorID == pVendorId) && (pProductIds.indexOf(attributes.ProductID))!=-1))
      {
        return hDevice;
      }
    }
  }
  return null;
}

// Global device handle, opened once
let hDeviceHandle = null;
function getDevice() {
  if (!hDeviceHandle)
    hDeviceHandle = getDeviceWithProviderAndProductId(0x187c, [0x511,0x512,0x514]);
  if (!hDeviceHandle)
    console.error("jetalienfx: Unable to find/open AlienFX device!");
  return hDeviceHandle;
}

function WriteCommand( command ){
  let device = getDevice();
  if (!device) return;
  
  let Buffer = new (ctypes.uint8_t.array(9))(command);
  var BytesWritten = new win32.types.DWORD(0);
  console.log("try to write : "+Buffer+" on "+device);
  var result = kernel32.WriteFile(device, Buffer, 9, BytesWritten.address(), null);
  if (BytesWritten.value!= 9) console.log("<<<<<------------- error in length");
  console.log("written:"+result + "-"+ BytesWritten.value);
  return BytesWritten.value;
}
function ReadDevice(pData, pDataLength){
  let device = getDevice();
  if (!device) return;
  
  var BytesRead = win32.types.DWORD(0);
  console.log("try to read : "+pDataLength);
  var result = kernel32.ReadFile(device, pData, 8, BytesRead.address(), null);
  if (BytesRead.value!= 8) console.log("<<<<<------------- error in length");
  console.log("read:"+result+" - "+BytesRead.value);
  return BytesRead.value;
}

const BLOCK_LOAD_ON_BOOT = 0x01;
const BLOCK_STANDBY = 0x02;
const BLOCK_AC_POWER = 0x05;
const BLOCK_CHARGING = 0x06;
const BLOCK_BAT_POWER = 0x08;

exports.REGIONS = {
  RIGHT_KEYBOARD : 0x0001, 
  MIDDLE_RIGHT_KEYBOARD : 0x0002, 
  LEFT_KEYBOARD : 0x0004, 
  MIDDLE_LEFT_KEYBOARD : 0x0008, 
  POWER_BUTTON_2 : 0x0010, 
  RIGHT_SPEAKER : 0x0020, 
  LEFT_SPEAKER : 0x0040,
  ALIEN_HEAD : 0x0080, 
  ALIEN_NAME : 0x0100, 
  TOUCH_PAD : 0x0200, 
  MEDIA_BAR : 0x1c00,
  POWER_BUTTON : 0x2000, 
  POWER_BUTTON_EYES : 0x4000, 
};

const START_BYTE = 0x02;

const COMMAND_END_STORAGE = 0x00;// = End Storage block (See storage)
const COMMAND_SET_MORPH_COLOR = 0x01;// = Set morph color (See set commands)
const COMMAND_SET_BLINK_COLOR = 0x02;// = Set blink color (See set commands)
const COMMAND_SET_COLOR = 0x03;// = Set color (See set commands)
const COMMAND_LOOP_BLOCK_END = 0x04;// = Loop Block end (See loops)
const COMMAND_TRANSMIT_EXECUTE = 0x05;// = End transmition and execute
const COMMAND_GET_STATUS = 0x06;// = Get device status (see get device status)
const COMMAND_RESET = 0x07;// = Reset (See reset)
const COMMAND_SAVE_NEXT = 0x08;// = Save next instruction in storage block (see storage)
const COMMAND_SAVE = 0x09;// = Save storage data (See storage)
const COMMAND_BATTERY_STATE = 0x0F;// = Set batery state (See set commands)
const COMMAND_SET_SPEED = 0x0E;// = Set display speed (see set speed)

const RESET_TOUCH_CONTROLS = 0x01;
const RESET_SLEEP_LIGHTS_ON = 0x02;
const RESET_ALL_LIGHTS_OFF = 0x03;
const RESET_ALL_LIGHTS_ON = 0x04;

const STATE_BUSY = 0x11;
const STATE_READY = 0x10;
const STATE_UNKNOWN_COMMAND = 0x12;

var gIdx = 1;
function changeColor(region, r, g, b) {
  var RG = r & 0xF0;
  RG = RG | ((g >> 4) & 0x0F);
  var B = b & 0xF0;
  
  var b1 = (region >> 16) & 0xFF;
  var b2 = (region >> 8) & 0xFF;
  var b3 = (region) & 0xFF;
  WriteCommand([START_BYTE, COMMAND_SET_COLOR, (gIdx)&0xff, b1, b2, b3, RG, b, 0]);  
}
function changeColorBlink(region, r, g, b) {
  var RG = r & 0xF0;
  RG = RG | ((g >> 4) & 0x0F);
  var B = b & 0xF0;
  
  var b1 = (region >> 16) & 0xFF;
  var b2 = (region >> 8) & 0xFF;
  var b3 = (region) & 0xFF;
  WriteCommand([START_BYTE, COMMAND_SET_BLINK_COLOR, (gIdx)&0xff, b1, b2, b3, RG, b, 0]);  
}
function changeColorMorph(region, r, g, b, c2r, c2g, c2b) {
console.log(region+"/"+r+"/"+g+"/"+b+"/"+c2r+"/"+c2g+"/"+c2b);
  var RG = r & 0xF0;
  RG = RG | ((g >> 4) & 0x0F);
  var B = b & 0xF0;
  B = B | ((c2r >> 4) & 0x0F);
  
  var RG2 = c2g & 0xF0;
  RG2 = RG2 | (( c2b >> 4) & 0x0F);
    
  var b1 = ((region >> 16) & 0xFF);
  var b2 = ((region >> 8) & 0xFF);
  var b3 = ((region) & 0xFF);
  
  WriteCommand([START_BYTE, COMMAND_SET_MORPH_COLOR, (gIdx)&0xff, b1, b2, b3, RG, B, RG2]);  
}

function setSpeed(s) {
  var speed = Math.max(100, Math.min(s*1000, 1000));
  speed = (speed /100)*100;
  var b1 = (speed >> 8) & 0xFF;
  var b2 = speed & 0xFF;
  WriteCommand([START_BYTE, COMMAND_SET_SPEED, b1, b2, 0, 0, 0, 0, 0]);  
}
function transmitAndExecute() {
  WriteCommand([START_BYTE,COMMAND_TRANSMIT_EXECUTE,0,0,0,0,0,0,0]);
}
function finishSave() {
  WriteCommand([START_BYTE,COMMAND_SAVE,0,0,0,0,0,0,0]);
}
function finishLoop() {
  WriteCommand([START_BYTE,COMMAND_LOOP_BLOCK_END,0,0,0,0,0,0,0]);
}
function saveNext() {
  WriteCommand([START_BYTE,COMMAND_SAVE_NEXT,0,0,0,0,0,0,0]);
}
function reset(type) {
  WriteCommand([START_BYTE,COMMAND_RESET,type,0,0,0,0,0,0]);
}
function isBusy() {
  let len = WriteCommand([START_BYTE,COMMAND_GET_STATUS,0,0,0,0,0,0,0]);
  if (len!=9) return true;
  var a="lklklk";
  for(var i=0; i<2000000;i++) a+="oioioiioioiopiopiopiopiopi";
  let Buffer = new (ctypes.uint8_t.array(8))([0x00 ,0 ,0x00 ,0x00 ,0x00 ,0x00 ,0x00 ,0x00]);
  let len = ReadDevice(Buffer,1);
  return Buffer[0]==STATE_BUSY || Buffer[0]!=STATE_READY;
}
function waitForReady(callback) {
  return require("timer").setTimeout(callback,300);
  // isBusy as ReadDevice/ReadFile doesn't appear to work :(
  if (!isBusy())
    callback();
  else
    require("timer").setTimeout(function () {
      waitForReady(callback);
    },1000);
}

exports.setColorsTransitions = function setColorsTransitions(region, colors, speed) {
  reset(RESET_ALL_LIGHTS_ON);
  waitForReady(function () {
    setSpeed(speed?speed:0);
    //changeColor(region, r, g, b);
    //finishLoop();
    for(var i=0; i<colors.length-1; i++) {
      var c=colors[i];
      var c2=colors[i+1];
      changeColorMorph(region, c[0], c[1], c[2], c2[0], c2[1], c2[2]);
    }
    changeColorMorph(region, colors[colors.length-1][0], colors[colors.length-1][1], colors[colors.length-1][2], colors[0][0], colors[0][1], colors[0][2]);
    finishLoop();
    transmitAndExecute();
    if (typeof onDone == "function")
      onDone.apply(null,[]);
  });
}

exports.setColor = function AlienFxSetColor(region, r, g, b, onDone) {
  console.log("setColor : "+b);
  reset(RESET_ALL_LIGHTS_ON);
  waitForReady(function () {
    changeColor(region, r, g, b);
    finishLoop();
    transmitAndExecute();
    if (typeof onDone == "function")
      onDone.apply(null,[]);
  });
}

require("unload").when(
  function() {
    if (hDeviceHandle)
      kernel32.CloseHandle(hDeviceHandle);
  });
