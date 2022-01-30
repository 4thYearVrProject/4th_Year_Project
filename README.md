# Camera_Computer:

# Headset_Computer:

# How to run

## Hosting the stream

1. Download the codebase, and install the dependencies using

```console

```

2. The devices must run on the same local network. To connect computer to the same local network, LogMeIn Hamachi is used. The streaming computer should host the VPN.

3. Start the server using the following code in the command line while in the project directory.

```console
node server
```

This should give the response

```console
Server is running on port 4040
```

4. Begin hosting the stream by going to:
   > http://localhost:4040/Camera_Computer/Stream.html

On this page the video and audio sources can be selected.

5. The stream can be terminated by closing the browser window.

## Connecting to the stream

1. Download the codebase, and install the dependencies using

```console

```

2. The devices must run on the same local network. To connect computer to the same local network, LogMeIn Hamachi is used. The viewing computer will connect to the VPN created by the streaming computer.

3. The viewing computer can then connect to the stream by connecting to the url below, after replacing the IP address with the IP address from LogMeIn Hamachi.

   > http://<INSERT CAMERA COMPUTER IP ADDRESS>:4040/Headset_Computer/View.html

4. The viewing can be terminated by closing the browser window.
