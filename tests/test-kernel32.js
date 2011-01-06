const {components} = require("chrome");
const ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;

exports.testLoops = function(test) {
  
  let win32 = require("win32");
  let kernel32 = require("win-kernel32");
  
  let file = kernel32.CreateFile("c:\\test.txt", kernel32.consts.FILE_GENERIC_WRITE | kernel32.consts.FILE_GENERIC_READ, kernel32.consts.FILE_SHARE_READ | kernel32.consts.FILE_SHARE_WRITE, null, kernel32.consts.OPEN_EXISTING, 0, null);
  
  let input = ['a'.charCodeAt(0),'b'.charCodeAt(0),'c'.charCodeAt(0),'d'.charCodeAt(0)];
  let Buffer = new (ctypes.uint8_t.array(input.length))(input);
  let BytesWritten = new win32.types.DWORD(0);
  test.assert( kernel32.WriteFile(file, Buffer, input.length, BytesWritten.address(), null) );
  test.assertEqual( BytesWritten.value, input.length );
  
  kernel32.CloseHandle(file);
  
  let file = kernel32.CreateFile("c:\\test.txt", kernel32.consts.FILE_GENERIC_WRITE | kernel32.consts.FILE_GENERIC_READ, kernel32.consts.FILE_SHARE_READ | kernel32.consts.FILE_SHARE_WRITE, null, kernel32.consts.OPEN_EXISTING, 0, null);
  
  let Buffer = new (ctypes.uint8_t.array(4))([0, 0, 0, 0]);
  let BytesRead = win32.types.DWORD(0);
  test.assert( kernel32.ReadFile(file, Buffer, 4, BytesRead.address(), null) );
  test.assertEqual( BytesRead.value, 4 );
  
  kernel32.CloseHandle(file);
  
}

