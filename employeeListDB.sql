DROP DATABASE IF EXISTS employees_DB;
CREATE DATABASE employees_DB;

USE employees_DB;

CREATE TABLE department(
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30)
);

CREATE TABLE role(
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(2) NOT NULL,
  departmentName VARCHAR(30) NOT NULL REFERENCES department(name) ON DELETE CASCADE
);

CREATE TABLE employee(
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name  VARCHAR(30) NOT NULL,
  departmentName VARCHAR(30) NOT NULL REFERENCES department(name) ON DELETE CASCADE,
  roleID INT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  manager_id INT default 0
);


INSERT INTO employee (first_name, last_name, departmentName, roleID, manager_id)
VALUES ("vanilla", "johnson",'accounting',1, 100);

INSERT INTO employee (first_name, last_name, departmentName, roleID, manager_id)
VALUES ("test2", "test20",'marketing', 2, 200);

INSERT INTO employee (first_name, last_name, departmentName, roleID, manager_id)
VALUES ("etst3", "test30",'marketing',3, 300);

