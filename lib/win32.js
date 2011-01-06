const {components} = require("chrome");
const ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;

let types = {};

types.HANDLE = ctypes.voidptr_t;
types.GUID = ctypes.StructType("GUID",
  [{ "Data1"  : ctypes.unsigned_long },
   { "Data2"  : ctypes.unsigned_short },
   { "Data3"  : ctypes.unsigned_short },
   { "Data4"  : ctypes.uint8_t.array(8) }
  ]);
  
types.PCTSTR = ctypes.char.ptr;
types.LPCTSTR = ctypes.char.ptr;
types.HWND = types.HANDLE;
types.DWORD = ctypes.unsigned_long;

exports.types = types;
