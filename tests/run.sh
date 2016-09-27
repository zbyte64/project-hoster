#!/bin/bash
set -e

until nc -v -z hoster 8100; do echo Waiting for Hoster; sleep 1; done

npm test
