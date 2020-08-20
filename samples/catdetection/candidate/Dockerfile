# Performs image detection by making a call to Azure Cognitive Services
FROM curlimages/curl:7.71.1

USER root
RUN mkdir /out \
  && chown curl_user:curl_group /out \
  && apk add jq
VOLUME /out

ENV API_KEY=''
ENV SERVICE_NAME=''

USER curl_user
COPY ./start.sh /start.sh
CMD ["/bin/sh", "/start.sh"]
