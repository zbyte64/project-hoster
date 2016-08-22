Writes website content to an S3 Bucket.


Environment
===========

* **AWS_KEY**
* **AWS_SECRET**
* **AWS_BUCKET**
* **AWS_REGION**
* **SECRET** Secret key for validating JWT


Ports
=====

* **8000** Public Port


API
===

**HTTP Header** `Authorization: Bearer [JWT]`; token must encode a value for the key `hostname`

**/publish** Accepts multipart requests and each attached file will be published.

**/set-domain** Accepts JSON object with key `domain` to set the canonical domain.

**/set-redirect-domain** Accepts JSON object with key `domain` to set a redirect domain.
