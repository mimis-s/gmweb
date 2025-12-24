FROM alpine

WORKDIR /app

COPY gmweb .

CMD ["./gmweb"]