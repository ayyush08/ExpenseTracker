# ── Build stage ────────────────────────────────────────────────
FROM gradle:jdk21 AS build
WORKDIR /project

# Copy Gradle wrapper and config first (layer caching for dependencies)
COPY gradle/ gradle/
COPY gradlew settings.gradle build.gradle ./

# Download dependencies (cached unless build.gradle changes)
RUN ./gradlew dependencies --no-daemon || true

# Copy the full source and build the fat JAR
COPY . .
RUN ./gradlew bootJar --no-daemon -x test

# ── Runtime stage ─────────────────────────────────────────────
FROM amazoncorretto:21-alpine
WORKDIR /app

COPY --from=build /project/build/libs/*.jar app.jar

EXPOSE 9810

ENTRYPOINT ["java", "-jar", "app.jar"]
