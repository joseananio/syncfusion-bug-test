#!/bin/bash

printf "Waiting for ng serve to start up "
while true
do
  sleep 1
  printf "."
  if grep -q "Compiled successfully." serve.log
  then
    echo " done."
    echo "ng serve successfully started."
    exit 0
  fi
done
