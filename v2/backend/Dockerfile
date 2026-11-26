FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S seniosk && adduser -S -G seniosk seniosk
WORKDIR /app
COPY --from=build /app/target/seniosk-0.1.0-SNAPSHOT.jar app.jar
USER seniosk
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
