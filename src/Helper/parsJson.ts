import fs from "fs";


// Method to parse JSON data from a file
export const parseLocationData = (filePath: string): Array<{
    id: number;
    name: string;
    type: "CITY" | "NEIGHBOURHOOD" | "STATE" | "COUNTRY";
    longitude: number;
    latitude: number;
    parentId?: number;
  }> => {
    try {
      // Read the file
      const fileContent = fs.readFileSync(filePath, "utf-8");
  
      // Parse JSON content
      const jsonData = JSON.parse(fileContent);
  
      // Ensure the file contains a valid `data` array
      if (!Array.isArray(jsonData.data)) {
        throw new Error("Invalid file format: 'data' array not found.");
      }
  
      return jsonData.data;
    } catch (error : any) {
      throw new Error(`Error parsing location data: ${error.message}`);
    }
  };