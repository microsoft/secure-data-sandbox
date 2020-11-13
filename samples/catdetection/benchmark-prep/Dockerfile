# Pulls data from an external API to prepare it for processing
FROM curlimages/curl:7.71.1

# Bypass k8s volume ownership issues
USER root
RUN mkdir /out
VOLUME /out

COPY ./start.sh /start.sh
ENTRYPOINT ["/bin/sh", "/start.sh"]
