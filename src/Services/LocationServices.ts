import { Location, ILocation } from "../Model/LocationModel"; // Import the Location model

class LocationService {

  // Create a new location
  async createLocation(locationData: Partial<ILocation>): Promise<ILocation> {
    const location = new Location(locationData);
    return await location.save();
  }

  // Retrieve a location by ID
  async getLocationById(id: number): Promise<ILocation | null> {
    return await Location.findOne({ id }).exec();
  }

  async getLocationBy_Id(_id: string): Promise<ILocation | null> {
    return await Location.findOne({_id }).exec();
  }


  // Retrieve all locations
  async getAllLocations(): Promise<ILocation[]> {
    return await Location.find({}).exec();
  }


  // Update a location by ID
  async updateLocation(id: number, updateData: Partial<ILocation>): Promise<ILocation | null> {
    return await Location.findOneAndUpdate({ id }, updateData, { new: true }).exec();
  }

  // Delete a location by ID
  async deleteLocation(id: number): Promise<ILocation | null> {
    return await Location.findOneAndDelete({ id }).exec();
  }

  // Bulk insert locations from an array
  async bulkInsertLocations(locations: any): Promise<any> {
    return await Location.insertMany(locations);
  }

  // Get locations by type
  async getLocationsByType(type: 'CITY' | 'NEIGHBOURHOOD' | 'STATE' | 'COUNTRY'): Promise<ILocation[]> {
    return await Location.find({ type }).exec();
  }

  // Get locations by parentId
  async getLocationsByParentId(parentId: number): Promise<ILocation[]> {
    return await Location.find({ parentId }).exec();
  }

  // Get paginated locations
  async getPaginatedLocations(startIndex: number, limit: number): Promise<ILocation[]> {
    return await Location.find({})
      .skip(startIndex)
      .limit(limit)
      .exec();
  }

  // Get total count of locations
  async getTotalLocations(): Promise<number> {
    return await Location.countDocuments().exec();
  }

  // Bulk insert multiple locations
  async insertManyLocations(locations: Partial<ILocation[]>): Promise<ILocation[]> {
    return await Location.insertMany(locations);
  }

  // async getPaginatedAndSortedLogs(
  //   startIndex: number,
  //   limit: number,
  //   sortField: keyof ILocation = 'name',
  //   sortOrder: 'asc' | 'desc' = 'asc',
  //   type?: 'CITY' | 'NEIGHBOURHOOD' | 'STATE' | 'COUNTRY' // Make type optional
  // ): Promise<ILocation[]> {
  //   const sortDirection = sortOrder === 'asc' ? 1 : -1;

  //   //const query = type ? { type } : {};

  //   return await Location.find({type:"COUNTRY"})
  //     .sort({ [sortField]: sortDirection })
  //     .skip(startIndex)
  //     .limit(limit)
  //     .exec();
  // }

  async getPaginatedAndSortedLogs(
    startIndex: number,
    limit: number,
    sortField: keyof ILocation = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
    type?: 'CITY' | 'NEIGHBOURHOOD' | 'STATE' | 'COUNTRY' // Make type optional
  ): Promise<ILocation[]> {
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Dynamically construct the query based on the `type` parameter
    const query = type ? { type } : {};

    return await Location.find(query) // Use the dynamic query
      .sort({ [sortField]: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .exec();
  }


  // Retrieve the count of all locations by type
  async getAllLocationsByType(type?: 'CITY' | 'NEIGHBOURHOOD' | 'STATE' | 'COUNTRY'): Promise<number> {
    // Dynamically construct the query based on the `type` parameter
    const query = type ? { type } : {};
    return await Location.countDocuments(query).exec(); // Use countDocuments for counting
  }

  async getChildLocation(locationId: string,sortOrder: 'asc' | 'desc' = 'asc'): Promise<ILocation[] | null> {
    return await Location.find({ parentId: locationId }).sort({ name: sortOrder }).lean().exec();
  }


  async searchLocation(searchTerm: string): Promise<ILocation[] | null> {
    return await Location.find({ name: { $regex: searchTerm, $options: 'i' } }).lean(). exec();
  }

  async getLocationByName(name: string): Promise<ILocation | null> {
    return await Location.findOne({ name: name }).lean().exec();
  }

}


export default LocationService;
