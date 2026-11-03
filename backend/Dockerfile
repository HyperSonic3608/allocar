FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml ./
COPY src ./src
RUN mvn -B -ntp package

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN groupadd --system allocar && useradd --system --gid allocar allocar
COPY --from=build --chown=allocar:allocar /build/target/*.jar /app/backend.jar
USER allocar
ENV SPRING_PROFILES_ACTIVE=supabase
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-jar", "/app/backend.jar"]
