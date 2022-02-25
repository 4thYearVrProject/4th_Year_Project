#!/bin/bash
if test $# -ne 3
then
    echo "Wrong number of arguments"
    exit 1
fi

ROOTPATH="$1"
FQDN=$2
PASSWORD=$3
RSABITS=4096

# make directories to work from
mkdir -p $ROOTPATH/{server,client,ca,tmp}

PATH_CA=$ROOTPATH/ca
PATH_SERVER=$ROOTPATH/server
PATH_CLIENT=$ROOTPATH/client
PATH_TMP=$ROOTPATH/tmp

######
# CA #
######

openssl genrsa -des3 -passout pass:$PASSWORD -out $PATH_TMP/ca.key $RSABITS

# Create Authority Certificate
openssl req -new -x509 -days 365 -key $PATH_TMP/ca.key -out $PATH_CA/ca.crt -passin pass:$PASSWORD -subj "/C=CA/ST=Ontario /L=Ottawa /O=Carleton University /CN=."

##########
# SERVER #
##########

# Generate server key
openssl genrsa -out $PATH_SERVER/server.key $RSABITS

# Generate server cert
openssl req -new -key $PATH_SERVER/server.key -out $PATH_TMP/server.csr -passout pass:$PASSWORD -subj "/C=CA/ST=Ontario /L=Ottawa /O=Carleton University /CN=localhost"

# Sign server cert with self-signed cert
openssl x509 -req -days 365 -passin pass:$PASSWORD -in $PATH_TMP/server.csr -CA $PATH_CA/ca.crt -CAkey $PATH_TMP/ca.key -set_serial 01 -out $PATH_SERVER/server.crt

##########
# CLIENT #
##########

openssl genrsa -out $PATH_CLIENT/client.key $RSABITS

openssl req -new -key $PATH_CLIENT/client.key -out $PATH_TMP/client.csr -passout pass:$PASSWORD -subj "/C=FR/ST=./L=./O=ACME Signing Authority Inc/CN=CLIENT"

openssl x509 -req -days 365 -passin pass:$PASSWORD -in $PATH_TMP/client.csr -CA $PATH_CA/ca.crt -CAkey $PATH_TMP/ca.key -set_serial 01 -out $PATH_CLIENT/client.crt

openssl pkcs12 -export -out $PATH_CLIENT/client.pfx -inkey $PATH_CLIENT/client.key -in $PATH_CLIENT/client.crt

exit 0