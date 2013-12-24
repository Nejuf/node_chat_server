A simple TCP chat server made using NodeJS.  It also has a web interface that uses Web Sockets.  The web socket server relays information to and from the TCP server, so CLI and web users share the same chat rooms.

You can currently it out on the command line with telnet:

    telnet 54.201.112.102 8080

Or by visiting the site from a browser. http://54.201.112.102:3000

Port list:
* TCP Server - 8080
* Web Socket Server - 8000
* HTTP Server - 3000
