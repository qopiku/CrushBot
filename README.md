# CRUSHBOT
> Anonymous Chat Bot for WhatsApp

## Getting Started

### Requirements
1. [NodeJS v14.15.x (and npm)](https://nodejs.org/en/)
2. [RethinkDB](https://rethink.com/)

### Install
1. Clone this repository
   ```bash
   $ git clone https://github.com/sProDev/CrushBot.git
   $ cd CrushBot
   ```
2. Install the dependencies
   ```bash
   $ npm install --save
   ```
3. Customize your .env file

### Usage
Run the Whatsapp Bot

- Regular node
  ```bash
  $ npm run start
  ```
- PM2
  ```bash
  $ pm2 start start.js
  $ pm2 monit
  ```
- PM2 with cronjob (restart after 5 hours)
  ```bash
  $ pm2 start start.js --cron "* */5 * * *"
  $ pm2 monit
  ```

After running it you need to scan the QR Code

## Troubleshooting
Make sure all the necessary dependencies are installed: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

Fix Stuck on linux, install google chrome stable: 
```bash
$ wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
$ sudo apt install ./google-chrome-stable_current_amd64.deb
```

## Additional Information

### Legal
WhatsApp are not allowing user using External Automation<br>
**USE AT YOUR OWN RISK**

### License
[sProDev License](https://github.com/sProDev/CrushBot/blob/main/LICENSE)
