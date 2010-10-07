#!/bin/sh
rel=$1
out=`dirname $0`/sdk/archive
pre=xulrunner-${rel}.en-US
win32=${pre}.win32.sdk.zip
macppc=${pre}.mac-powerpc.sdk.tar.bz2
macintel=${pre}.mac-i386.sdk.tar.bz2
mirrorbase=http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/
mirrorrel=${mirrorbase}/${rel}/sdk/
if [ ! $1 ]; then
    echo "No release provided"
    exit 1
elif [ `wget -O - ${mirrorbase} | grep -c ${rel}` -ne 1 ]; then
    echo "Check version supplied"
    exit 1
fi
wget -c -P ${out} ${mirrorrel}{${win32},${macppc},${macintel}}