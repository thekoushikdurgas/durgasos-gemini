/**
 * @file This file defines the tools (functions) that the Durgas Assistant can use.
 * These definitions are provided to the Gemini model, allowing it to request
 * actions to be performed within the OS via function calling.
 */
import { FunctionDeclaration, Type } from "@google/genai";
import { APPS } from "../apps";

// Generate a comma-separated list of available app names for the model's description.
const appNames = APPS.map(app => app.name.toLowerCase()).join(', ');

/**
 * An array of function declarations that are provided to the Gemini model.
 */
export const assistantTools: FunctionDeclaration[] = [
  {
    name: "openApp",
    description: "Opens an application on the DurgasOS desktop.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        appName: {
          type: Type.STRING,
          description: `The name of the app to open. Available apps: ${appNames}.`,
        },
      },
      required: ["appName"],
    },
  },
  {
    name: "closeApp",
    description: "Closes an application on the DurgasOS desktop. Can also close all apps.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        appName: {
          type: Type.STRING,
          description: "The name of the app to close. Use 'all' to close all open applications.",
        },
      },
      required: ["appName"],
    },
  },
  {
    name: "createFolder",
    description: "Creates a new folder in a specified location.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        folderName: {
          type: Type.STRING,
          description: "The name for the new folder.",
        },
        location: {
          type: Type.STRING,
          description: "The location to create the folder in. Common locations are 'Desktop', 'Documents', 'Pictures', 'Videos'.",
        },
      },
      required: ["folderName", "location"],
    },
  },
  {
      name: "setSystemTheme",
      description: "Changes the system's visual theme.",
      parameters: {
          type: Type.OBJECT,
          properties: {
              theme: {
                  type: Type.STRING,
                  description: "The theme to set. Can be 'light' or 'dark'."
              }
          },
          required: ["theme"]
      }
  },
  {
      name: "answerGeneralQuestion",
      description: "Use this function for any general knowledge questions or queries that don't involve controlling the operating system. For example 'What is the capital of France?' or 'Summarize the plot of Hamlet'.",
      parameters: {
          type: Type.OBJECT,
          properties: {
              query: {
                  type: Type.STRING,
                  description: "The user's question."
              }
          },
          required: ["query"]
      }
  }
];
