import { Express, Request, Response } from "express";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();
const PORT: string = process.env.PORT || '4000';
const DEPLOYED_URL = process.env.DEPLYED_URL || ' '

// Swagger configuration options
const options: any = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DEMO API",
            description: "Learning Swagger",
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Local Development Server",
            },
            {
                url: DEPLOYED_URL,
                description: "Hosted Development Server",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT", // Optional
                },
            },
            schemas: {
                AddUserRequestBody: {
                    type: "object",
                    required: ["name", "email", "dob", "isActive"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Nusarat",
                        },
                        email: {
                            type: "string",
                            example: "nusarat@example.com",
                        },
                        dob: {
                            type: "string",
                            format: "date",
                            example: "2002-10-02",
                        },
                        isActive: {
                            type: "boolean",
                            example: true,
                        },
                    },
                },
                AddAdminRequestBody: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Nusarat",
                            description: "The full name of the admin.",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "nusarat@example.com",
                            description: "The email address of the admin.",
                        },
                        password: {
                            type: "string",
                            minLength: 6,
                            example: "password123",
                            description: "The password for the admin account. Must be at least 6 characters long.",
                        },
                    },
                },
                
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/**/*.ts", "./dist/src/routes/**/*.js"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Function to serve Swagger UI and Docs
function swaggerDocs(app: express.Application) {
    // Swagger UI documentation page
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Swagger JSON format documentation
    app.get("/docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`Docs available at http://localhost:${PORT}/docs`);
    console.log(`Download JSON doc at http://localhost:${PORT}/docs.json`);
}

export default swaggerDocs;











