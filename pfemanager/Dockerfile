# Étape 1 : Build du projet avec Maven
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY . .
# 1. On donne les droits au fichier (c'est ça qui corrige le bug !)
RUN chmod +x ./mvnw 
# 2. On compile
RUN ./mvnw clean package -DskipTests

# Étape 2 : Exécution de l'application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]