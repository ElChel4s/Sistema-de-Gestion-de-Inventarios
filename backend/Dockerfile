# Usar una imagen base de OpenJDK 21 para asegurarse de que la versión de Java sea compatible
FROM openjdk:21-jdk

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo JAR desde la carpeta target al contenedor
COPY target/proyventasqr-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto 8080 para acceder a la aplicación
EXPOSE 8080

# Comando para ejecutar la aplicación Spring Boot al iniciar el contenedor
ENTRYPOINT ["java", "-jar", "app.jar"]
