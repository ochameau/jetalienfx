const {components} = require("chrome");
const ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;
const win32 = require("win32");


let lib = ctypes.open("hid.dll");

let types = {};

/*typedef struct _HIDD_ATTRIBUTES {
  ULONG  Size;
  USHORT VendorID;
  USHORT ProductID;
  USHORT VersionNumber;
} HIDD_ATTRIBUTES, *PHIDD_ATTRIBUTES;*/
types.HIDD_ATTRIBUTES = ctypes.StructType("HIDD_ATTRIBUTES",
   [{ "Size"  : ctypes.unsigned_long },
    { "VendorID"  : ctypes.unsigned_short },
    { "ProductID"  : ctypes.unsigned_short },
    { "VersionNumber"  : ctypes.unsigned_short }]);

exports.types = types;

/*void __stdcall HidD_GetHidGuid(
  __out  LPGUID HidGuid
);*/
exports.HidD_GetHidGuid = 
lib.declare( "HidD_GetHidGuid", ctypes.winapi_abi, ctypes.void_t,
    win32.types.GUID.ptr
  );


  
/*BOOLEAN __stdcall HidD_GetAttributes(
  __in   HANDLE HidDeviceObject,
  __out  PHIDD_ATTRIBUTES Attributes
);*/
exports.HidD_GetAttributes = 
lib.declare( "HidD_GetAttributes", ctypes.winapi_abi, ctypes.bool,
    win32.types.HANDLE,
    types.HIDD_ATTRIBUTES.ptr);

