# Performs image detection by making a call to Azure Cognitive Services
FROM curlimages/curl:7.71.1

# Bypass k8s volume ownership issues
USER root
RUN mkdir /out \
  && apk add jq
VOLUME /out

ENV API_KEY=''
ENV SERVICE_NAME=''

COPY ./start.sh /start.sh
CMD ["/bin/sh", "/start.sh"]
