Hosts domains from IPFS.

Environment
===========

* **IPFS_API_URL** Path to IPFS api
* **DOMAIN_NAME**
* **LANDING_URL**
* **REDIRECT_PROTOCOL** http or https


Ports
=====

* **8000** Public Port
* **8100** RPC Port


Serve
=====

1. A hostname is associated to an IPFS (directory) object that acts as a sitemap
2. A domain may be associated to a hostname and will be the target of hostname redirects (canonical domain)
3. An extra domain may be pointed to a hostname which will cause a redirect to the canonical address


RPC
===

Your Port Number Will Vary (if you run docker). State is stored on IPFS and is looked up through IPNS.


View State:

::

  curl http://127.0.0.1:32913/


Associate Hostname to IPFS object:

::

  curl -i -d "{\"awesome-client\": \"DEADBEAF\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-hostnames


Associate Host to Domain:

::

  curl -i -d "{\"awesome-client\": \"www.awesome.io\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-domain-names


Set Domain Redirect:

::

  curl -i -d "{\"awesome.io\": \"awesome-client\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-redirect-names
