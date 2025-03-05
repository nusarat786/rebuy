import { Express, Request, Response } from "express";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import path from "path";
import yaml from "yamljs";

//import dbConnect from "../src/Routes";

dotenv.config();
const PORT: string = process.env.PORT || '4000';
const DEPLOYED_URL = process.env.DEPLYED_URL || ' '


const ErrorObj = {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Indicates the success or failure of the request",
        example: false
      },
      message: {
        type: "string",
        description: "Error message",
        example: "An error occurred"
      },
      error: {
        type: "string",
        description: "Detailed error message (only in non-production environments)",
        nullable: true,
        example: "Invalid request"
      },
      errorObj: {
        type: "object",
        description: "Detailed error object with additional information",
        properties: {
          code: {
            type: "string",
            description: "Error code for reference",
            example: "INVALID_REQUEST"
          },
          stackTrace: {
            type: "string",
            description: "Stack trace (only visible in development)",
            nullable: true,
            example: "at /path/to/file.js:23"
          }
        }
      }
    }
  };
  
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
                UserType: {
                    type: "string",
                    enum: ["admin", "user"],
                    description: "The type of the user.",
                },
                IForgotPassword: {
                    type: "object",
                    properties: {
                        otp: {
                            type: "string",
                            description: "OTP for password reset",
                            nullable: true,
                        },
                        otpGeneratedTime: {
                            type: "string",
                            format: "date-time",
                            description: "Time when OTP was generated",
                        },
                        otpExpiryTime: {
                            type: "string",
                            format: "date-time",
                            description: "Expiry time for OTP",
                        },
                    },
                },
                IAuthorization: {
                    type: "object",
                    properties: {
                        jwtToken: {
                            type: "string",
                            description: "JWT token for user authorization",
                            nullable: true,
                        },
                        refreshToken: {
                            type: "string",
                            description: "Refresh token for reauthentication",
                            nullable: true,
                        },
                        loginDate: {
                            type: "string",
                            format: "date-time",
                            description: "Login timestamp",
                            nullable: true,
                        },
                        logoutDate: {
                            type: "string",
                            format: "date-time",
                            description: "Logout timestamp",
                            nullable: true,
                        },
                    },
                },
                IUser: {
                    type: "object",
                    required: ["firstName", "lastName", "email", "password", "phone", "phoneCode", "userType", "createdAt", "authorization", "forgotPassword"],
                    properties: {
                        firstName: {
                            type: "string",
                            example: "Nusarat",
                            description: "The first name of the user.",
                        },
                        lastName: {
                            type: "string",
                            example: "Haveliwala",
                            description: "The last name of the user.",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "nusarathaveliwala@gmail.com",
                            description: "Email address of the user.",
                        },
                        password: {
                            type: "string",
                            example: "Aa#12345",
                            description: "Password for the user account.",
                        },
                        phone: {
                            type: "string",
                            example: "1234567890",
                            description: "Phone number of the user.",
                        },
                        phoneCode: {
                            type: "string",
                            example: "+91",
                            description: "Country code for phone number.",
                        },
                        profilePicture: {
                            type: "string",
                            example: "https://example.com/profile-pic.jpg",
                            description: "URL of the profile picture.",
                            nullable: true,
                        },
                        userType: {
                            $ref: "#/components/schemas/UserType",
                            description: "Type of the user (admin or user).",
                        },
                        city: {
                            type: "string",
                            example: "Vadodara",
                            description: "City where the user is located.",
                            nullable: true,
                        },
                        region: {
                            type: "string",
                            example: "Ajwaroad",
                            description: "State/Region where the user is located.",
                            nullable: true,
                        },
                        country: {
                            type: "string",
                            example: "India",
                            description: "Country where the user is located.",
                            nullable: true,
                        },
                        zip: {
                            type: "string",
                            example: "390017",
                            description: "ZIP code for the user location.",
                            nullable: true,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp of when the user was created.",
                        },
                        authorization: {
                            $ref: "#/components/schemas/IAuthorization",
                            description: "Authorization details for the user.",
                        },
                        forgotPassword: {
                            $ref: "#/components/schemas/IForgotPassword",
                            description: "Forgot password details for the user.",
                        },
                    },
                },
                
                ErrorObj: ErrorObj,

                
               
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: [path.resolve(__dirname, "routes/**/*.ts")]

    //apis: ["./routes/**/*.ts"],
    // apis: ["./Routes/**/*.ts","./routes/*.ts"],
    // "./dist/src/routes/**/*.js"
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

        // Load Swagger YAML file
    const swaggerSpec2 = yaml.load("F:\\Wisedv\\Lerarning Project\\src\\Helper\\Swagger\\v1_doc.yml");

    // Serve Swagger UI
    app.use("/doc-v1", swaggerUi.serve, swaggerUi.setup(swaggerSpec2));


    console.log(`Docs available at http://localhost:${PORT}/docs`);
    console.log(`Download JSON doc at http://localhost:${PORT}/docs.json`);
    console.log(path.resolve(__dirname, "routes/**/*.ts"))
}

export default swaggerDocs;











