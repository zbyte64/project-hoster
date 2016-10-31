#!/bin/bash
set -e

until nc -v -z ipfs 5001; do echo Waiting for IPFS; sleep 1; done

npm start
