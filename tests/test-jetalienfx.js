
exports.internalTest = function(test) {
  test.assert(true);

  let {components} = require("chrome");
  let ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;

  let timer = require("timer");
  
  let win32 = require("win32");
  let kernel32 = require("win-kernel32");
  //\\?\hid#vid_187c&pid_0514#6&119c959f&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}
  var path = "\\\\?\\hid#vid_187c&pid_0514#6&119c959f&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}";
   
  let file = kernel32.CreateFile(path, kernel32.consts.FILE_GENERIC_WRITE | kernel32.consts.FILE_GENERIC_READ, kernel32.consts.FILE_SHARE_READ | kernel32.consts.FILE_SHARE_WRITE, null, kernel32.consts.OPEN_EXISTING, 0, null);
  
  test.assert(file);
  console.log("file: "+file);
  console.log("path: "+path);
  
  function loop() {
    let input = [ 0x02,0x06,0,0,0,0,0,0,0 ];
    let Buffer = new (ctypes.uint8_t.array(input.length))(input);
    let BytesWritten = new win32.types.DWORD(0);
    test.assert( kernel32.WriteFile(file, Buffer, input.length, BytesWritten.address(), null) );
    test.assertEqual( BytesWritten.value, input.length );
    if (BytesWritten.value==0)
      timer.setTimeout(loop, 2000);
    else {
      console.log("BytesWritten : "+BytesWritten.value);
      timer.setTimeout(function () {
      //let Buffer = new (ctypes.uint8_t.array(8))([0x02,0x06, 0, 0, 0, 0, 0, 0]);
      let BytesRead = win32.types.DWORD(0);
      kernel32.ReadFile(file, Buffer, 8, BytesRead.address(), null);
      //test.assert( kernel32.ReadFile(file, Buffer, 8, BytesRead.address(), null) );
      //test.assertEqual( BytesRead.value, 8 );
      console.log("BytesRead : "+BytesRead.value);
      if (BytesRead.value==0)
        timer.setTimeout(loop, 10);
      }, 500);
    }
  }
  
  loop();
  function read() {
    let Buffer = new (ctypes.uint8_t.array(9))([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    let BytesRead = win32.types.DWORD(0);
    kernel32.ReadFile(file, Buffer, 1, BytesRead.address(), null);
    //test.assert( kernel32.ReadFile(file, Buffer, 8, BytesRead.address(), null) );
    //test.assertEqual( BytesRead.value, 8 );
    console.log("BytesRead : "+BytesRead.value);
    if (BytesRead.value==0)
      timer.setTimeout(read, 1000);
    else
      read();
  }
  
  /*
  byte Buffer[] = { 0x00 ,0x06 ,0x00 ,0x00 ,0x00 ,0x00 ,0x00 ,0x00 ,0x00 };
  WriteDevice(Buffer,9);
  ReadDevice(Buffer,9);
  return Buffer[1];
  */
  timer.setTimeout(function () {
    kernel32.CloseHandle(file);
  }, 9000);
  test.waitUntilDone(10000);
}

exports.testTransitions = function(test) {
  
  test.assert(true);
  return;
  
  var alienfx = require("jetalienfx");
  
  test.waitUntilDone(10000);
  
  alienfx.setColorsTransitions(alienfx.REGIONS.RIGHT_SPEAKER,[[0xff,0,0],[0,0xff,0],[0,0,0xff]],100);
  
}

exports.testFastChange = function(test) {
  
  test.assert(true);
  return;
  
  var alienfx = require("jetalienfx");
  
  test.waitUntilDone(10000);
  
  let i = 1;
  function step() {
    alienfx.setColor(alienfx.REGIONS.RIGHT_SPEAKER, 0,0,16*i++ & 0xFF,function () {
      if (i<=255/16)
        require("timer").setTimeout(step, 10);
      else
        test.done();
    });
  }
  step();
  
  
}
