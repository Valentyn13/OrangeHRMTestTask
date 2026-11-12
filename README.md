Example of links on the project, configure base url from them
https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index
https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/7 - my info page

2 roles
Admin and ESS

Username:fffffe3343 
Password:1234rrR
Role: ESS

Username:Admin
Password: admin123
Role: Admin

Configure env file, create a setup for the playwright project, where it will reuse authentication, use fixtures for page objects, configure ability to run tests for different roles


Go to login page https://opensource-demo.orangehrmlive.com/web/index.php/auth/login and using playwright MCP create a page object model for it

After login admin lands on https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index

and ESS user lands on https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index but it has different view
