#!/bin/bash
set -e

until nc -v -z postgresql 5432; do echo Waiting for Database; sleep 1; done

npm start
