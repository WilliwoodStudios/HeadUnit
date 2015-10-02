/*
 * This file is auto-generated.  DO NOT MODIFY.
 * Original file: D:\\git\\Workshop12\\HeadUnit\\java\\Boss\\bosswebcontent\\src\\main\\aidl\\com\\workshoptwelve\\brainiac\\boss\\webcontent\\IWebContent.aidl
 */
package com.workshoptwelve.brainiac.boss.webcontent;
public interface IWebContent extends android.os.IInterface
{
/** Local-side IPC implementation stub class. */
public static abstract class Stub extends android.os.Binder implements com.workshoptwelve.brainiac.boss.webcontent.IWebContent
{
private static final java.lang.String DESCRIPTOR = "com.workshoptwelve.brainiac.boss.webcontent.IWebContent";
/** Construct the stub at attach it to the interface. */
public Stub()
{
this.attachInterface(this, DESCRIPTOR);
}
/**
 * Cast an IBinder object into an com.workshoptwelve.brainiac.boss.webcontent.IWebContent interface,
 * generating a proxy if needed.
 */
public static com.workshoptwelve.brainiac.boss.webcontent.IWebContent asInterface(android.os.IBinder obj)
{
if ((obj==null)) {
return null;
}
android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
if (((iin!=null)&&(iin instanceof com.workshoptwelve.brainiac.boss.webcontent.IWebContent))) {
return ((com.workshoptwelve.brainiac.boss.webcontent.IWebContent)iin);
}
return new com.workshoptwelve.brainiac.boss.webcontent.IWebContent.Stub.Proxy(obj);
}
@Override public android.os.IBinder asBinder()
{
return this;
}
@Override public boolean onTransact(int code, android.os.Parcel data, android.os.Parcel reply, int flags) throws android.os.RemoteException
{
switch (code)
{
case INTERFACE_TRANSACTION:
{
reply.writeString(DESCRIPTOR);
return true;
}
case TRANSACTION_getWebContent:
{
data.enforceInterface(DESCRIPTOR);
java.lang.String _arg0;
_arg0 = data.readString();
android.os.ParcelFileDescriptor _arg1;
if ((0!=data.readInt())) {
_arg1 = android.os.ParcelFileDescriptor.CREATOR.createFromParcel(data);
}
else {
_arg1 = null;
}
int _result = this.getWebContent(_arg0, _arg1);
reply.writeNoException();
reply.writeInt(_result);
return true;
}
}
return super.onTransact(code, data, reply, flags);
}
private static class Proxy implements com.workshoptwelve.brainiac.boss.webcontent.IWebContent
{
private android.os.IBinder mRemote;
Proxy(android.os.IBinder remote)
{
mRemote = remote;
}
@Override public android.os.IBinder asBinder()
{
return mRemote;
}
public java.lang.String getInterfaceDescriptor()
{
return DESCRIPTOR;
}
@Override public int getWebContent(java.lang.String path, android.os.ParcelFileDescriptor output) throws android.os.RemoteException
{
android.os.Parcel _data = android.os.Parcel.obtain();
android.os.Parcel _reply = android.os.Parcel.obtain();
int _result;
try {
_data.writeInterfaceToken(DESCRIPTOR);
_data.writeString(path);
if ((output!=null)) {
_data.writeInt(1);
output.writeToParcel(_data, 0);
}
else {
_data.writeInt(0);
}
mRemote.transact(Stub.TRANSACTION_getWebContent, _data, _reply, 0);
_reply.readException();
_result = _reply.readInt();
}
finally {
_reply.recycle();
_data.recycle();
}
return _result;
}
}
static final int TRANSACTION_getWebContent = (android.os.IBinder.FIRST_CALL_TRANSACTION + 0);
}
public int getWebContent(java.lang.String path, android.os.ParcelFileDescriptor output) throws android.os.RemoteException;
}
