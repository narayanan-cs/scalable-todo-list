const request = require('supertest');
const nock = require('nock');
const app = require('../src/gateway.ts'); // Adjust the path to your app file
const mongoose = require('mongoose');
process.env.CLIENT_ID = 'dummy';
process.env.CLIENT_SECRET = 'dummy';
describe('Todo API', () => {
    let cookie: string; // Declare the cookie variable here
    let todoId: string;

    beforeAll(async () => {

        // Mock the GitHub access token request
        nock('https://github.com')
            .post('/login/oauth/access_token')
            .reply(200, {
                access_token: 'mocked_access_token',
            });

        // Mock user data retrieval
        nock('https://api.github.com')
            .get('/user')
            .reply(200, {
                id: 123,
                login: 'testuser',
                email: 'testuser@example.com',
            });

        // Simulate OAuth login flow
        const loginResponse = await request(app).get('/auth/github/callback?code=mocked_code');
        expect(loginResponse.statusCode).toBe(302); // Expect a redirect after successful login

        // Capture the cookie
        const cookieHeader = loginResponse.headers['set-cookie'];
        if (cookieHeader) {
            cookie = decodeURIComponent(cookieHeader.map((c:string) => c.split(';')[0]).join('; '));
        } else {
            throw new Error('Authentication failed: No cookie returned');
        }
    });

    afterAll(async () => {
        nock.cleanAll(); // Clean all mocks
    });

    describe('CRUD Todo operations', () => {
        // Test creating a todo
        it('should create a todo', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Cookie', cookie) // Use the cookie variable here
                .send({
		    username: 'Ajjy bhai',
		    email: 'test@gmail.com',	
                    title: 'Test Todo',
                    completed: false,
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.title).toBe('Test Todo');
            expect(response.body.completed).toBe(false);
            
            todoId = response.body['_id']; // Store the ID for future tests
        },20000);

        // Test fetching the todo
        it('should fetch the todo by ID', async () => {
            const response = await request(app)
                .get(`/api/todos/test@gmail.com`)
                .set('Cookie', cookie); // Use the cookie variable here

            expect(response.statusCode).toBe(200);
	    const responseBody = JSON.parse(response.body)

            console.log(responseBody[0],"Response Body") 
            expect(responseBody[0]).toHaveProperty('_id', todoId);
            expect(responseBody[0].title).toBe('Test Todo');
        },15000);

        // Test updating the todo
        it('should update the todo', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Cookie', cookie) // Use the cookie variable here
                .send({
		    username: 'Ajjy bhai',
		    email: 'test@gmail.com',	
                    title: 'Updated Test Todo',
                    completed: true,

                });

            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBe('Updated Test Todo');
            expect(response.body.completed).toBe(true);
        },20000);

        // Test deleting the todo
        it('should delete the todo', async () => {
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Cookie', cookie); // Use the cookie variable here
            console.log(response,"delete to do response") 
            expect(response.statusCode).toBe(204); // No content

            // Verify that the todo is deleted
            const fetchResponse = await request(app)
                .get(`/api/todos/test@gmail.com`)
                .set('Cookie', cookie); // Use the cookie variable here
	    console.log(fetchResponse,"response after deleting")
		 let res = JSON.parse(JSON.parse(fetchResponse.res.text))
	     if(!res.length)
		{
		  res = "No todo found"	
		}
            expect(res).toEqual("No todo found"); // Not found
        },20000);
    });
});
