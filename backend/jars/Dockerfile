# FROM amazoncorretto:21
# COPY app.jar app.jar
# ENTRYPOINT ["java","-jar","/app.jar"]

 #TODO: build auth,user image again
FROM amazoncorretto:21

WORKDIR /app

COPY expense-service-0.0.1-SNAPSHOT.jar /app/expense-service-0.0.1-SNAPSHOT.jar


EXPOSE 9820

ENTRYPOINT ["java", "-jar", "expense-service-0.0.1-SNAPSHOT.jar"]

