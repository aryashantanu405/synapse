# packages/services/code-execution-service/Dockerfile.java
FROM ubuntu:latest
# THE FIX: Install 'coreutils'
RUN apt-get update && apt-get install -y default-jdk coreutils
WORKDIR /app