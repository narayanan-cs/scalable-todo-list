# scalable-todo-list
A mostly ChatGPT generated CRUD API todo list app that features
* Web Server
* MongoDB
* OAuth2
* Ignite Cache Server
* Search using Elastic Search
* Logging  - ELK
* Idempotent APIs
* API Gateway - OAUTH2, routing, validation, security
* Keep session out of server
* Automated Tests via CI pipeline
# Installation
It is like all other codebase setups in nodejs
# Usage
 Create a database 'todo'. One has to make GitHub the OAuth2 provider. Then signup (/auth/register) and sign in (/auth/login) into GitHub. When signing up, one has to see that the users collection is populated with github profile info. Then one can play with the CRUD Todo APIs.

# License
Free to explore and use
Note:
Create a .env file in this folder and fill it with the following info:

MONGO_URI=mongodb://localhost:27017/todo
IGNITE_URI=http://localhost:8080/ignite
