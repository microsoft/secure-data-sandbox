# Pulls data from an external API to prepare it for processing
FROM curlimages/curl:7.71.1

USER root
RUN mkdir /out \
  && chown curl_user:curl_group /out
VOLUME /out

USER curl_user
COPY ./start.sh /start.sh
CMD ["/bin/sh", "/start.sh"]
