import { GoogleGenAI, Type } from "@google/genai";
import type { Restaurant, GeolocationCoordinates } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        restaurants: {
            type: Type.ARRAY,
            description: "A list of restaurants found.",
            items: {
                type: Type.OBJECT,
                properties: {
                    restaurantName: {
                        type: Type.STRING,
                        description: "The name of the restaurant.",
                    },
                    category: {
                        type: Type.STRING,
                        description: "The main category of food served (e.g., Ramen, Sushi, Italian).",
                    },
                    tabelogRating: {
                        type: Type.NUMBER,
                        description: "The numerical rating from Tabelog.",
                    },
                    tabelogUrl: {
                        type: Type.STRING,
                        description: "The direct URL to the restaurant's page on the English version of Tabelog.",
                    },
                    address: {
                        type: Type.STRING,
                        description: "The full physical address of the restaurant.",
                    },
                    googleMapsUrl: {
                        type: Type.STRING,
                        description: "A Google Maps URL that points to the restaurant's address.",
                    },
                    featuredDishImage: {
                        type: Type.STRING,
                        description: "A URL for an image of a featured or popular dish from the restaurant. Should be an empty string if no image is found.",
                    },
                },
                required: [
                    "restaurantName",
                    "category",
                    "tabelogRating",
                    "tabelogUrl",
                    "address",
                    "googleMapsUrl",
                    "featuredDishImage",
                ],
            },
        },
    },
    required: ["restaurants"],
};


export const fetchRestaurants = async (locationQuery: string, coords: GeolocationCoordinates | null): Promise<Restaurant[]> => {
  let locationPromptPart = `near the location: "${locationQuery}"`;
  if (coords && locationQuery === "My Current Location") {
      locationPromptPart = `near the coordinates latitude ${coords.latitude} and longitude ${coords.longitude}`;
  }
  
  const prompt = `
    Find top-rated restaurants on tabelog.com/en/ ${locationPromptPart}.
    Search for restaurants with a Tabelog rating of 3.3 or higher.
    Return up to 40 results if possible, sorted by rating in descending order.

    For each restaurant, provide the following details:
    1. Restaurant Name
    2. Category (e.g., Ramen, Sushi, Italian)
    3. Tabelog Rating as a number
    4. A direct URL to its English Tabelog page
    5. Its full address
    6. A Google Maps URL for the address.
    7. A URL for an image of a featured or popular dish. If no suitable image can be found, return an empty string.
    
    If no restaurants are found that meet the criteria, return an empty list.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text;
    if (!jsonString) {
        console.error("Gemini API returned an empty response.");
        return [];
    }

    const parsedResponse = JSON.parse(jsonString);
    return parsedResponse.restaurants || [];
  } catch (error) {
    console.error("Error fetching restaurants from Gemini API:", error);
    throw new Error("Failed to fetch restaurant data. Please check your API key and network connection.");
  }
};