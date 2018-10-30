#!/bin/bash

if ps --no-headers -C obs
then
  exit 1
else
  exit 0
fi
