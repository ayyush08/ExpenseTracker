# ── Build stage ────────────────────────────────────────────────
FROM gradle:jdk21 AS build
WORKDIR /project

# Copy Gradle wrapper and config first (layer caching for dependencies)
COPY gradle/ gradle/
COPY gradlew settings.gradle ./
COPY app/build.gradle app/build.gradle

# Download dependencies (cached unless build.gradle changes)
RUN ./gradlew :app:dependencies --no-daemon || true

# Copy the full source and build the fat JAR
COPY . .
RUN ./gradlew :app:bootJar --no-daemon -x test

# ── Runtime stage ─────────────────────────────────────────────
FROM amazoncorretto:21-alpine
WORKDIR /app

COPY --from=build /project/app/build/libs/*.jar app.jar

EXPOSE 9898

ENTRYPOINT ["java", "-jar", "app.jar"]
