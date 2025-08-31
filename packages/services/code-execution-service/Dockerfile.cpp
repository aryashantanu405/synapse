# Dockerfile.toolbox

# Step A: Start with a basic OS
FROM ubuntu:latest

# Step B: Install the C++ compiler tools. This is the only setup we need.
RUN apt-get update && apt-get install -y g++

# Step C: Set a working directory inside the container.
# This will be the "workbench" area where we place our code.
WORKDIR /app