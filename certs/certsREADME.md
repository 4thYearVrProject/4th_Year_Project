# Certificate creation README
This is the readme for how the certificates were created for this 4th year project. This guide is taken from [here](https://github.com/nodejs/help/issues/253)
## Genertae the CA

The first step is to create the CA invloves generatings a key
```
openssl genrsa -des3 -passout pass:4YrDre4m -out $ROOTPATH/certs/ca.key 4096
``` 

The second step is to create the certificate being used

```
openssl req -new -x509 -days 365 -key certs/ca/ca.key -out certs/ca/ca.crt -passin pass:4YrDre4m
```

These fields were used 
Country Name: CA
Province Name: Ontario
Organization Name: Carleton University
Organization Unit Name: VR Remote Project
Common Name: server
Email address: "left blank"

## Server
First step is to generate the server key

``` 
openssl genrsa -out certs/server/server.key 4096
```

Next thing is to create the server certificate

```
openssl req -new -key certs/server/server.key -out certs/server/server.csr -passout pass:4YrDre4m
```

The fields used were 
Country Name: CA
Province Name: Ontario
Organization Name: Carleton University
Organization Unit Name: VR Remote Project
Common Name: server
Email address: "left blank"

The final step for the server certificates is to sign the server cert with te

```
openssl x509 -req -days 365 -passin pass:4YrDre4m -in certs/server/server.csr -CA certs/ca/ca.crt -CAkey certs/ca/ca.key -set_serial 01 -out certs/server/server.crt
```
## Users

The first step is to create a key for the user. The name of the key can be anything you like as this will be assoicated with the user. The name ```marc.key``` was chosen
```
openssl genrsa -out certs/clients/marc.key 4096
```

The second ting to do is to create the .csr file. 

```
openssl req -new -key certs/clients/marc.key -out certs/clients/marc.csr -passout pass:4YrDre4m

```

The third step is to create the user certificate that is signed with the certificate authority

```
openssl x509 -req -days 365 -passin pass:4YrDre4m -in certs/clients/marc.csr -CA certs/ca/ca.crt -CAkey certs/ca/ca.key -set_serial 01 -out certs/clients/marc.crt
```

The last step is to create the browser certificate 

```
openssl pkcs12 -export -out certs/clients/marc.pfx -inkey certs/clients/marc.key -in certs/clients/marc.crt
```
