Writes website content to IPFS


Environment
===========

* **IPFS_API_URL** Path to IPFS api
* **SECRET** Secret key for validating JWT
* **HOSTER_RPC_URL** Path to hoster api


Ports
=====

* **8000** Public Port


API
===

**HTTP Header** `Authorization: Bearer [JWT]`; token must encode a value for the key `hostname`

**/upload ** Accepts multipart request to upload a file, returns JSON with the url and identifier

**/publish** Accepts a JSON dictionary of paths to identifiers

**/set-domain** Accepts JSON object with key `domain` to set the canonical domain.

**/set-redirect-domain** Accepts JSON object with key `domain` to set a redirect domain.
