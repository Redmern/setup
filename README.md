start nodejs app from boot:
- sudo npm install pm2 -g
- (login as root user) sudo su
- pm2 start webserver.js
- pm2 startup systemd
- pm2 save

https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn

read/write acces for dev:
sudo chown -R username path 
