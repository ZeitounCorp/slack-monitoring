#!/usr/bin/env bash
#
# Auto Install script for the slack bot
#
{ # this ensures the entire script is downloaded #

# Defining colors for echo outputs
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
# End defining colors

bash_has() {
  type "$1" > /dev/null 2>&1
}

echo -e "${YELLOW}=> Beginning installation of the Slack Monitoring Bot${NC}"

install_api() {
  if bash_has "git"; then
    echo -e "${YELLOW}-> Cloning now the api at ~/slack-monitoring${NC}"
    command git clone https://github.com/ZeitounCorp/slack-monitoring.git
  else
    echo -e "${YELLOW}-> We first need to install Git.${NC}\n"
    command sudo apt install git-all
    echo -e "${BLUE}-> Git is now installed, cloning now the api at ~/slack-monitoring.${NC}\n"
    command git clone https://github.com/ZeitounCorp/slack-monitoring.git
  fi
  echo -e "${GREEN}-> Api is now installed at ~/slack-monitoring${NC}\n"
  echo -e "${YELLOW}-> Now installing the dependencies using npm install${NC}"
  npmInstall
}

npmInstall() {
  command cd ~/slack-monitoring
  npm install
  echo -e "${GREEN}-> Dependencies are now installed${NC}\n"
  echo -e "⚠️${YELLOW} Don't forget to cd ~/slack-monitoring, nano .env and add fields: [API_KEY, SLACK_API_KEY, PORT]. Once done, run while being in ~/slack-monitoring: pm2 start ecosystem.config.js --watch ${NC}⚠️"
}

main() {
  install_api
}

# Running the Script
main

} # this ensures the entire script is downloaded #
