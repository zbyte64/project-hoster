FROM node:6.4-slim
MAINTAINER Jason Kraus "jason@montagable.com"

RUN apt-get update && apt-get install -y netcat

RUN mkdir /opt/app
WORKDIR /opt/app
ADD ./ /opt/app
RUN npm install


CMD ["bash", "run.sh"]
