-- Create the databases required by each microservice
CREATE DATABASE IF NOT EXISTS authservice;
CREATE DATABASE IF NOT EXISTS userservice;
CREATE DATABASE IF NOT EXISTS expenseservice;

-- Grant the Spring user full access to each database
GRANT ALL PRIVILEGES ON authservice.* TO 'springuser'@'%';
GRANT ALL PRIVILEGES ON userservice.* TO 'springuser'@'%';
GRANT ALL PRIVILEGES ON expenseservice.* TO 'springuser'@'%';
FLUSH PRIVILEGES;
