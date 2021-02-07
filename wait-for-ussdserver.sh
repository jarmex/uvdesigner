#!/bin/bash
set -e
echo "Initiating..."

until curl --output /dev/null --silent --head --fail "$USSDSERVER_URL"; do
  >&2 echo "USSD Server is unavailable - sleeping"
  sleep 1
done
>&2 echo "USSD Server is up"
#source /usr/local/bin/docker-entrypoint
exec /docker-entrypoint.sh $@
