FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace/backend
COPY backend/pom.xml .
COPY contracts /workspace/contracts
RUN mvn -B -ntp dependency:go-offline
COPY backend/src ./src
RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S seniosk && adduser -S -G seniosk seniosk
WORKDIR /app
COPY --from=build /workspace/backend/target/seniosk-0.1.0-SNAPSHOT.jar app.jar
USER seniosk
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
