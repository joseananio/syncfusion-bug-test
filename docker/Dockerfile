FROM node:12.14.1-buster

RUN apt update && \
    apt -y install unzip wget chromium

RUN wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.2.0.1227-linux.zip && \
    mkdir -p /opt && \
    unzip sonar-scanner-cli-3.2.0.1227-linux.zip -d /opt && \
    ln -s /opt/sonar-scanner-3.2.0.1227-linux/bin/sonar-scanner /usr/bin/sonar-scanner && \
    rm -f sonar-scanner-cli-3.2.0.1227-linux.zip

RUN dpkg --add-architecture armhf && \
    apt update && \
    apt -y install qemu-user qemu gcc-arm-linux-gnueabihf libssl-dev:armhf zlib1g-dev:armhf jq screen
