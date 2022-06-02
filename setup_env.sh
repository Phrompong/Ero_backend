#!/bin/bash
bash -c "echo MAX_CLUSTERS='$MAX_CLUSTERS' >> .env"
bash -c "echo SECRET='$SECRET' >> .env"
bash -c "echo PORT='$PORT' >> .env"
bash -c "echo CONNECTION_STRING='$CONNECTION_STRING' >> .env"
bash -c "echo DATABASE_NAME='$DATABASE_NAME' >> .env"
bash -c "echo IPADDRESS_URI='$IPADDRESS_URI' >> .env"
bash -c "echo DATABASE_USERNAME='$DATABASE_USERNAME' >> .env"
bash -c "echo DATABASE_PASSWORD='$DATABASE_PASSWORD' >> .env"
