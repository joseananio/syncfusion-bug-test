#!/bin/bash

printf "Waiting for backend to start up "

COUNTER=0
NUMSECONDS=300  # wait interval - if the backend hasn't started up after 5 minutes, it's probably not going to.

while [ $COUNTER -lt $NUMSECONDS ]
do
  sleep 1
  let COUNTER=COUNTER+1
  printf "."
  if grep -q "Application started." backend.log
  then
    echo " done."
    echo "Backend successfully started."
    exit 0
  fi

done


echo " timeout after 5 minutes."
cat ./backend.log
exit 1
