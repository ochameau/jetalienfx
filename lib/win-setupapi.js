const {components} = require("chrome");
const ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;
const win32 = require("win32");


let lib = ctypes.open("setupapi.dll");

exports.consts = {
  DIGCF_PRESENT : 2,
  DIGCF_DEVICEINTERFACE : 16,
  INVALID_HANDLE_VALUE : 0,
  ERROR_INSUFFICIENT_BUFFER : 122,
  SPDRP_HARDWAREID : 1,
  SPDRP_FRIENDLYNAME : 12,
  SPDRP_LOCATION_INFORMATION : 13,
  ERROR_NO_MORE_ITEMS : 259
};

let types = {};

types.HDEVINFO = ctypes.int;
types.SP_DEVICE_INTERFACE_DATA = ctypes.StructType("SP_DEVICE_INTERFACE_DATA",
  [{ "cbSize"  : win32.types.DWORD },
   { "InterfaceClassGuid"  : win32.types.GUID },
   { "Flags"  : win32.types.DWORD },
   { "Reserved"  : ctypes.unsigned_long.ptr }]);

exports.types = types;

/*HDEVINFO SetupDiGetClassDevs(
  __in_opt  const GUID *ClassGuid,
  __in_opt  PCTSTR Enumerator,
  __in_opt  HWND hwndParent,
  __in      DWORD Flags
);*/
exports.SetupDiGetClassDevs = 
lib.declare( "SetupDiGetClassDevsA", ctypes.winapi_abi, types.HDEVINFO,
    win32.types.GUID.ptr,
    win32.types.PCTSTR,
    win32.types.HWND,
    win32.types.DWORD
  );



/*BOOL SetupDiEnumDeviceInterfaces(
  __in      HDEVINFO DeviceInfoSet,
  __in_opt  PSP_DEVINFO_DATA DeviceInfoData,
  __in      const GUID *InterfaceClassGuid,
  __in      DWORD MemberIndex,
  __out     PSP_DEVICE_INTERFACE_DATA DeviceInterfaceData
);*/
exports.SetupDiEnumDeviceInterfaces = 
lib.declare( "SetupDiEnumDeviceInterfaces", ctypes.winapi_abi, ctypes.bool,
    types.HDEVINFO,
    ctypes.voidptr_t,
    win32.types.GUID.ptr,
    win32.types.DWORD,
    types.SP_DEVICE_INTERFACE_DATA.ptr
  );

/*BOOL SetupDiGetDeviceInterfaceDetail(
  __in       HDEVINFO DeviceInfoSet,
  __in       PSP_DEVICE_INTERFACE_DATA DeviceInterfaceData,
  __out_opt  PSP_DEVICE_INTERFACE_DETAIL_DATA DeviceInterfaceDetailData,
  __in       DWORD DeviceInterfaceDetailDataSize,
  __out_opt  PDWORD RequiredSize,
  __out_opt  PSP_DEVINFO_DATA DeviceInfoData
);*/
exports.SetupDiGetDeviceInterfaceDetail = 
lib.declare( "SetupDiGetDeviceInterfaceDetailW", ctypes.winapi_abi, ctypes.bool,
    types.HDEVINFO,
    types.SP_DEVICE_INTERFACE_DATA.ptr,
    ctypes.voidptr_t,
    win32.types.DWORD,
    win32.types.DWORD.ptr,
    ctypes.voidptr_t
  );
