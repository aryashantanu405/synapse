# This is the generic "toolbox" image for our Java environment.

# Step 1: Start from a basic Ubuntu operating system.
FROM ubuntu:latest

# Step 2: Update the package manager and install the Java Development Kit (JDK).
# The JDK includes both the Java compiler (javac) and the runtime (java).
RUN apt-get update && apt-get install -y openjdk-17-jdk

# Step 3: Set a working directory inside the container.
# This will be the "workbench" where the user's code is placed at runtime.
WORKDIR /app

