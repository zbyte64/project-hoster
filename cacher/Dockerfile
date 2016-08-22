FROM        ubuntu:14.04.2
MAINTAINER Jason Kraus "jason@montagable.com"

# Update the package repository and install applications
RUN apt-get update -qq && \
  apt-get upgrade -yqq && \
  apt-get -yqq install varnish && \
  apt-get -yqq clean

# Make our custom VCLs available on the container
ADD default.vcl /etc/varnish/default.vcl

ADD start.sh /start.sh
RUN chmod +x /start.sh

# Expose volumes to be able to use data containers
#VOLUMES ["/var/lib/varnish", "/etc/varnish"]

# Expose port 80
EXPOSE 80

CMD ["/start.sh"]
