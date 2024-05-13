<<<<<<< HEAD
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import errorMiddleware from "../middlewares/error.js";
import routes from "./routes.js";
=======
import express from 'express';
import errorMiddleware from '../middlewares/error.js';
import routes from './routes.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
>>>>>>> main

const app = express();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LogRocket Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "LogRocket",
        url: "https://logrocket.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./src/routers/*.js", "./src/api/routes.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(specs, {
    explorer: true,
    customCssUrl:
      "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
<<<<<<< HEAD
  }),
=======
  })
>>>>>>> main
);

app.use(express.json()).use(routes).use(errorMiddleware);

export default app;
