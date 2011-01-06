const {components} = require("chrome");
const ctypes = components.utils.import("resource://gre/modules/ctypes.jsm").ctypes;
const win32 = require("win32");

let lib = ctypes.open("kernel32.dll");


let consts = {};

consts.DELETE = (0x00010000);
consts.READ_CONTROL = (0x00020000);
consts.WRITE_DAC = (0x00040000);
consts.WRITE_OWNER = (0x00080000);
consts.SYNCHRONIZE = (0x00100000);

consts.STANDARD_RIGHTS_REQUIRED = (0x000F0000);

consts.STANDARD_RIGHTS_READ = (consts.READ_CONTROL);
consts.STANDARD_RIGHTS_WRITE = (consts.READ_CONTROL);
consts.STANDARD_RIGHTS_EXECUTE = (consts.READ_CONTROL);

consts.STANDARD_RIGHTS_ALL = (0x001F0000);

consts.SPECIFIC_RIGHTS_ALL = (0x0000FFFF);


consts.FILE_READ_DATA = ( 0x0001 ); //  file & pipe
consts.FILE_LIST_DIRECTORY = ( 0x0001 ); //  directory

consts.FILE_WRITE_DATA = ( 0x0002 ); //  file & pipe
consts.FILE_ADD_FILE = ( 0x0002 ); //  directory

consts.FILE_APPEND_DATA = ( 0x0004 ); //  file
consts.FILE_ADD_SUBDIRECTORY = ( 0x0004 ); //  directory
consts.FILE_CREATE_PIPE_INSTANCE = ( 0x0004 ); //  named pipe

consts.FILE_READ_EA = ( 0x0008 ); //  file & directory
consts.FILE_WRITE_EA = ( 0x0010 ); //  file & directory

consts.FILE_EXECUTE = ( 0x0020 ); //  file
consts.FILE_TRAVERSE = ( 0x0020 ); //  directory

consts.FILE_DELETE_CHILD = ( 0x0040 ); //  directory

consts.FILE_READ_ATTRIBUTES = ( 0x0080 ); //  all

consts.FILE_WRITE_ATTRIBUTES = ( 0x0100 ); //  all

consts.FILE_ALL_ACCESS = (consts.STANDARD_RIGHTS_REQUIRED | consts.SYNCHRONIZE | 0x1FF);

consts.FILE_GENERIC_READ = (consts.STANDARD_RIGHTS_READ     |
                            consts.FILE_READ_DATA           |
                            consts.FILE_READ_ATTRIBUTES     |
                            consts.FILE_READ_EA             |
                            consts.SYNCHRONIZE);

consts.FILE_GENERIC_WRITE = ( consts.STANDARD_RIGHTS_WRITE    |
                              consts.FILE_WRITE_DATA          |
                              consts.FILE_WRITE_ATTRIBUTES    |
                              consts.FILE_WRITE_EA            |
                              consts.FILE_APPEND_DATA         |
                              consts.SYNCHRONIZE);

consts.FILE_GENERIC_EXECUTE = ( consts.STANDARD_RIGHTS_EXECUTE  |
                                consts.FILE_READ_ATTRIBUTES     |
                                consts.FILE_EXECUTE             |
                                consts.SYNCHRONIZE);

consts.FILE_FLAG_RANDOM_ACCESS = 0x10000000;
consts.FILE_FLAG_OVERLAPPED    = 0x40000000;

consts.FILE_SHARE_READ = 0x00000001;
consts.FILE_SHARE_WRITE = 0x00000002;
consts.FILE_SHARE_DELETE = 0x00000004;
consts.FILE_ATTRIBUTE_READONLY = 0x00000001;
consts.FILE_ATTRIBUTE_HIDDEN = 0x00000002;
consts.FILE_ATTRIBUTE_SYSTEM = 0x00000004;
consts.FILE_ATTRIBUTE_DIRECTORY = 0x00000010;
consts.FILE_ATTRIBUTE_ARCHIVE = 0x00000020;
consts.FILE_ATTRIBUTE_DEVICE = 0x00000040;
consts.FILE_ATTRIBUTE_NORMAL = 0x00000080;
consts.FILE_ATTRIBUTE_TEMPORARY = 0x00000100;
consts.FILE_ATTRIBUTE_SPARSE_FILE = 0x00000200;
consts.FILE_ATTRIBUTE_REPARSE_POINT = 0x00000400;
consts.FILE_ATTRIBUTE_COMPRESSED = 0x00000800;
consts.FILE_ATTRIBUTE_OFFLINE = 0x00001000;
consts.FILE_ATTRIBUTE_NOT_CONTENT_INDEXED = 0x00002000;
consts.FILE_ATTRIBUTE_ENCRYPTED = 0x00004000;
consts.FILE_ATTRIBUTE_VIRTUAL = 0x00010000;
consts.FILE_NOTIFY_CHANGE_FILE_NAME = 0x00000001;
consts.FILE_NOTIFY_CHANGE_DIR_NAME = 0x00000002;
consts.FILE_NOTIFY_CHANGE_ATTRIBUTES = 0x00000004;
consts.FILE_NOTIFY_CHANGE_SIZE = 0x00000008;
consts.FILE_NOTIFY_CHANGE_LAST_WRITE = 0x00000010;
consts.FILE_NOTIFY_CHANGE_LAST_ACCESS = 0x00000020;
consts.FILE_NOTIFY_CHANGE_CREATION = 0x00000040;
consts.FILE_NOTIFY_CHANGE_SECURITY = 0x00000100;
consts.FILE_ACTION_ADDED = 0x00000001;
consts.FILE_ACTION_REMOVED = 0x00000002;
consts.FILE_ACTION_MODIFIED = 0x00000003;
consts.FILE_ACTION_RENAMED_OLD_NAME = 0x00000004;
consts.FILE_ACTION_RENAMED_NEW_NAME = 0x00000005;
consts.MAILSLOT_NO_MESSAGE = -1;
consts.MAILSLOT_WAIT_FOREVER = -1;
consts.FILE_CASE_SENSITIVE_SEARCH = 0x00000001;
consts.FILE_CASE_PRESERVED_NAMES = 0x00000002;
consts.FILE_UNICODE_ON_DISK = 0x00000004;
consts.FILE_PERSISTENT_ACLS = 0x00000008;
consts.FILE_FILE_COMPRESSION = 0x00000010;
consts.FILE_VOLUME_QUOTAS = 0x00000020;
consts.FILE_SUPPORTS_SPARSE_FILES = 0x00000040;
consts.FILE_SUPPORTS_REPARSE_POINTS = 0x00000080;
consts.FILE_SUPPORTS_REMOTE_STORAGE = 0x00000100;
consts.FILE_VOLUME_IS_COMPRESSED = 0x00008000;
consts.FILE_SUPPORTS_OBJECT_IDS = 0x00010000;
consts.FILE_SUPPORTS_ENCRYPTION = 0x00020000;
consts.FILE_NAMED_STREAMS = 0x00040000;
consts.FILE_READ_ONLY_VOLUME = 0x00080000;
consts.FILE_SEQUENTIAL_WRITE_ONCE = 0x00100000;
consts.FILE_SUPPORTS_TRANSACTIONS = 0x00200000;


consts.CREATE_NEW         = 1;
consts.CREATE_ALWAYS      = 2;
consts.OPEN_EXISTING      = 3;
consts.OPEN_ALWAYS        = 4;
consts.TRUNCATE_EXISTING  = 5

exports.consts=consts;


/*DWORD WINAPI GetLastError(void);*/
exports.GetLastError = 
lib.declare( "GetLastError", ctypes.winapi_abi, win32.types.DWORD );

/*HANDLE WINAPI CreateFile(
  __in      LPCTSTR lpFileName,
  __in      DWORD dwDesiredAccess,
  __in      DWORD dwShareMode,
  __in_opt  LPSECURITY_ATTRIBUTES lpSecurityAttributes,
  __in      DWORD dwCreationDisposition,
  __in      DWORD dwFlagsAndAttributes,
  __in_opt  HANDLE hTemplateFile
);*/
exports.CreateFile = 
lib.declare( "CreateFileW", ctypes.winapi_abi, win32.types.HANDLE,
    ctypes.jschar.ptr,
    win32.types.DWORD,
    win32.types.DWORD,
    ctypes.voidptr_t,
    win32.types.DWORD,
    win32.types.DWORD,
    win32.types.HANDLE);

/*BOOL WINAPI CloseHandle(
  __in  HANDLE hObject
);*/
exports.CloseHandle = 
lib.declare( "CloseHandle", ctypes.winapi_abi, ctypes.bool,
    win32.types.HANDLE);
    
/*BOOL WINAPI WriteFile(
  __in         HANDLE hFile,
  __in         LPCVOID lpBuffer,
  __in         DWORD nNumberOfBytesToWrite,
  __out_opt    LPDWORD lpNumberOfBytesWritten,
  __inout_opt  LPOVERLAPPED lpOverlapped
);*/
exports.WriteFile = 
lib.declare( "WriteFile", ctypes.winapi_abi, ctypes.bool,
    win32.types.HANDLE,
    ctypes.voidptr_t,
    win32.types.DWORD,
    win32.types.DWORD.ptr,
    ctypes.voidptr_t);

/*BOOL WINAPI ReadFile(
  __in         HANDLE hFile,
  __out        LPVOID lpBuffer,
  __in         DWORD nNumberOfBytesToRead,
  __out_opt    LPDWORD lpNumberOfBytesRead,
  __inout_opt  LPOVERLAPPED lpOverlapped
);*/
exports.ReadFile = 
lib.declare( "ReadFile", ctypes.winapi_abi, ctypes.bool,
    win32.types.HANDLE,
    ctypes.voidptr_t,
    win32.types.DWORD,
    win32.types.DWORD.ptr,
    ctypes.voidptr_t);
