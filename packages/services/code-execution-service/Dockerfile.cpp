# packages/services/code-execution-service/Dockerfile.cpp
FROM ubuntu:latest
# THE FIX: Install 'coreutils' which contains the 'timeout' command
RUN apt-get update && apt-get install -y g++ coreutils
WORKDIR /app