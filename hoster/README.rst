Hosts domains from an S3 Bucket. Top folders are treated as hostnames.

Environment
===========

* **AWS_KEY**
* **AWS_SECRET**
* **AWS_BUCKET**
* **AWS_REGION**
* **DOMAIN_NAME**
* **LANDING_URL**
* **REDIRECT_PROTOCOL** http or https


Ports
=====

* **8000** Public Port
* **8100** RPC Port


Serve
=====

Content is served by directly piping non-privileged S3 requests from a bucket.
Top level folders are served when host matches: `foldername.DOMAIN_NAME`
Associating a Host to a Domain will serve the host folder at the specified domain and redirect `foldername.DOMAIN_NAME` to the Domain.
Associating a Redirect to a Domain will cause a redirect to domain is host matches redirect.



RPC
===

Your Port Number Will Vary (if you run docker). State is stored in the S3 Bucket.


View State:

::

  curl http://127.0.0.1:32913/


Associate Host to Domain:

::

  curl -i -d "{\"awesome-client\": \"www.awesome.io\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-domain-names


Set Domain Redirect:

::

  curl -i -d "{\"awesome.io\": \"www.awesome.io\"}" -H "Content-Type: application/json" http://127.0.0.1:32913/set-redirect-names
