USE employees_DB;

INSERT INTO department (name)
VALUES ('Accounting'),('Technology'),('Marketing'),('R&D'),('HR');

INSERT INTO role (title,salary, department_id)
VALUES ('Executive',90000,4),('Operations',80000,5),('Project Manager',60000,2),('Accountant',75000,1),('Analyst',80085,2);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("vanilla", "johnson",1),("Employee2", "Lastname2",2),("firstname3", "lastname3", 3),("firstName4", "firstname5", 4),("firstname5", "lastname5", 5),("firstname6", "lastname6", 1),("firstname7", "lastname7", 2),("firstname8", "lastname8", 3);
