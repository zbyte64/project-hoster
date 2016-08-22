

RPC
===

Updates domain doc as well as hoster.


Associate Domain to Host:

::

  curl -i -d "{\"hostname\": \"derrin-gibbs-industrial-services\", \"domain\": \"www.derringibbs.com\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-domain


Associate a Redirect domain to a Host

::

  curl -i -d "{\"hostname\": \"derrin-gibbs-industrial-services\", \"domain\": \"derringibbs.com\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-redirect-domain
