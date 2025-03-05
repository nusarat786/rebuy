import express, { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../Helper/apiResponse';
import { validateAdmin } from '../Helper/validationMethods';
import { Admin, IAdmin, Role } from '../Model/AdminModel';
import LocationService from '../Services/LocationServices';
import getClientIp from '../Helper/getIp';
import dotenv from "dotenv";
import { ILocation } from '../Model/LocationModel';
import { parseLocationData } from '../Helper/parsJson';
dotenv.config();


interface GetLocationBody {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    sortField?: string;
    type?: 'CITY' | 'NEIGHBOURHOOD' | 'STATE' | 'COUNTRY'; 
}

interface IAdminLogin {
    adminEmail: string;
    password: string
}
export class LocationController {

    private locationService: LocationService;

    constructor(){
        this.locationService = new LocationService();
    }

    public addAllCountries = async (req: Request<{}, {},{} >, res: Response, next: NextFunction) => {
        try{
            const countries = parseLocationData('./src/Helper/locData/country.json');
            const num = await this.locationService.bulkInsertLocations(countries);

            if(!num.length){
                throw new Error("Something went wrong. Please try again later");
            }

            res.status(200).json({success:true,message:"Countries added successfully"});
        }catch(error){
            next(error);
        }

    }

    public addAllStates = async (req: Request<{}, {},{} >, res: Response, next: NextFunction) => {
        try{
            const state = parseLocationData('./src/Helper/locData/state.json');
            const num = await this.locationService.bulkInsertLocations(state);

            if(!num.length){
                throw new Error("Something went wrong. Please try again later");
            }

            res.status(200).json(new ApiResponse(200,"States added successfully",num));
        }catch(error){
            next(error);
        }

    }

    public addAllCities = async (req: Request<{}, {},{} >, res: Response, next: NextFunction) => {
        try{
            const city = parseLocationData('./src/Helper/locData/city.json');
            const num = await this.locationService.bulkInsertLocations(city);

            if(!num.length){
                throw new Error("Something went wrong. Please try again later");
            }

            res.status(200).json(new ApiResponse(200,"Cities added successfully",num));
        }catch(error){
            next(error);
        }

    }

    public getLocation = async (req: Request<{}, {},{} >, res: Response, next: NextFunction) => {
        try {

            const data = await this.locationService.getAllLocations();
            const count = await this.locationService.getTotalLocations();

            res.status(200).json(new ApiResponse(200,"Location fetched successfully",{data,count}));

        }catch(error){
            next(error);
        }
    }


    public getPaginatedLocations = async (req: Request<{}, {}, {}, { startIndex: number, limit: number, type: string }>, res: Response, next: NextFunction) => {
        try {
            const { startIndex, limit, type } = req.query;

            if (!startIndex || !limit || !type) {
                return res.status(400).json(new ApiResponse(400, "Invalid query parameters", null));
            }

            const data = await this.locationService.getLocationsByType(type as 'CITY' | 'NEIGHBOURHOOD' | 'STATE' | 'COUNTRY');
            const paginatedData = data.slice(Number(startIndex), Number(startIndex) + Number(limit));

            if (!paginatedData.length) {
                return res.status(404).json(new ApiResponse(404, "No locations found", null));
            }

            res.status(200).json(new ApiResponse(200, "Paginated locations fetched successfully", paginatedData));
        } catch (error) {
            next(error);
        }
    }


    public addAllNeighbourhood = async (req: Request<{}, {},{} >, res: Response, next: NextFunction) => {
        try{
            const neighbourhood = parseLocationData('./src/Helper/locData/neighbourhood.json');
            const num = await this.locationService.bulkInsertLocations(neighbourhood);

            if(!num.length){
                throw new Error("Something went wrong. Please try again later");
            }

            res.status(200).json(new ApiResponse(200,"Neighbour added successfully",num));
        }catch(error){
            next(error);
        }
    }

    public getCountries = async (req: Request<{}, {},{} >, res: Response, next: NextFunction) => {
        try {
            const data = await this.locationService.getLocationsByType('COUNTRY');

            if(!data.length){
                throw new Error("Something went wrong. Please try again later");
            }
            res.status(200).json(new ApiResponse(200,"Countries fetched successfully",data));
        } catch (error) {
            next(error);
        }
    }

    
    // public getFilteredLocations = async (req: Request<{}, {}, GetLocationBody >, res: Response, next: NextFunction) => {
    //     try {
    //         const locationBody: GetLocationBody = req.body;

    //         locationBody.page = locationBody.page || 1;
    //         locationBody.limit = locationBody.limit || 10;
    //         locationBody.sortOrder = locationBody.sortOrder || 'asc';
    //         const sortOn = locationBody.sortField as keyof ILocation || 'name' as keyof ILocation;
    //         locationBody.type = locationBody.type || 'COUNTRY';
    //         const count =await this.locationService.getTotalLocations();


            

    //         if(locationBody.page<1){
    //             throw new Error("Invalid page number");
    //         }

    //         if(locationBody.limit<1){
    //             throw new Error("Invalid limit number");
    //         }
            
    //         const paginationInfo = {
    //             page: locationBody.page,
    //             limit: locationBody.limit,
    //             sortOn,
    //             sortOrder: locationBody.sortOrder,
    //             type: locationBody.type,
    //             totalPages: Math.ceil(count / locationBody.limit),
    //         }

    //         if(locationBody.page>paginationInfo.totalPages) {
    //             throw new Error("Invalid page number");
    //         }

    //         const locations = await this.locationService.getPaginatedAndSortedLogs(locationBody.page,locationBody.limit,sortOn,locationBody.sortOrder,locationBody.type);

    //         // if(!locations.length){
    //         //     throw new Error("Something went wrong. Please try again later");
    //         // }

    //         res.status(200).json(new ApiResponse(200,"Locations fetched successfully",{
    //              locations,
    //             paginationInfo}));
    //     }catch(error){
    //         next(error);
    //     }
    // }

    public getFilteredLocations = async (req: Request<{}, {}, GetLocationBody>, res: Response, next: NextFunction) => {
        try {
            const locationBody: GetLocationBody = req.body;
    
            // Defaults
            locationBody.page = locationBody.page || 1;
            locationBody.limit = locationBody.limit || 10;
            locationBody.sortOrder = locationBody.sortOrder || 'asc';
            locationBody.type = locationBody.type || 'COUNTRY';
            const sortOn: keyof ILocation = locationBody.sortField as keyof ILocation || 'name' as keyof ILocation;
    
            // Validation
            if (locationBody.page < 1) throw new Error("Page number must be greater than 0");
            if (locationBody.limit < 1) throw new Error("Limit must be greater than 0");
    
            const count = await this.locationService.getAllLocationsByType(locationBody.type);
            const totalPages = count === 0 ? 0 : Math.ceil(count / locationBody.limit);
    
            if (locationBody.page > totalPages) {
                throw new Error(`Invalid page number. Total pages: ${totalPages}`);
            }
    
            const startIndex = (locationBody.page - 1) * locationBody.limit;
    
            // Fetch locations
            const locations = await this.locationService.getPaginatedAndSortedLogs(
                startIndex,
                locationBody.limit,
                sortOn,
                locationBody.sortOrder,
                locationBody.type
            );
    
            // Response
            const paginationInfo = {
                page: locationBody.page,
                limit: locationBody.limit,
                sortOn,
                sortOrder: locationBody.sortOrder,
                type: locationBody.type,
                totalPages,
            };
    
            res.status(200).json(new ApiResponse(200, "Locations fetched successfully", { locations, paginationInfo }));
        } catch (error) {
            next(error);
        }
    };

    
    public getAllChildLocations = async (req: Request<{}, {}, {parentLocationId:string}>, res: Response, next: NextFunction) => {
        try {
            const {parentLocationId} = req.body;

            if(!parentLocationId){
                throw new Error("Location id is required");
            }

            const location = await this.locationService.getChildLocation(parentLocationId);

            if(!location){
                throw new Error("Location not found");
            }

            res.status(200).json(new ApiResponse(200, "Locations fetched successfully", { location,count:location.length }));
        } catch (error) {
            next(error);
        }
    }; 
    
    public searchLocation = async (req: Request<{}, {}, {searchTerm:string}>, res: Response, next: NextFunction) => {
        try {
            const {searchTerm} = req.body;
            if(!searchTerm){
                throw new Error("Search term is required");
            }

            
            const location = await this.locationService.searchLocation(searchTerm);
            res.status(200).json(new ApiResponse(200, "Locations fetched successfully", { location }));
        } catch (error) {
            next(error);
        }
    };

    public getLocationById = async (req: Request<{}, {}, {locationId:number}>, res: Response, next: NextFunction) => {
        try {
            const {locationId} = req.body;

            if(!locationId){
                throw new Error("Location id is required");
            }

            const location = await this.locationService.getLocationById(locationId);

            if(!location){
                throw new Error("Location not found");
            }
            res.status(200).json(new ApiResponse(200, "Location fetched successfully", { location }));
        } catch (error) {
            next(error);
        }
    };

    public createLocation = async (req: Request<{}, {}, ILocation>, res: Response, next: NextFunction) => {
        try {
            const locationData :ILocation = req.body;

            if (!locationData.name || !locationData.type) {
                throw new Error("Name and type are required fields");
            }

            if(!locationData.parentId){
                throw new Error("Parent id is required");
            }

            if(!locationData.type){
                throw new Error("Type is required");
            }

            if(!locationData.id){
                throw new Error("id is required");
            }

            if(!locationData.longitude){
                throw new Error("longitude is required");
            }

            if(!locationData.latitude){
                throw new Error("latitude is required");
            }

            if(locationData.type !== "CITY" && locationData.type !== "NEIGHBOURHOOD" && locationData.type !== "STATE" && locationData.type !== "COUNTRY"){
                throw new Error("Invalid type");
            }


            const location = await this.locationService.getLocationById(locationData.id);

            if(location){
                throw new Error("Location with this id already exists");
            }

            const locationByName = await this.locationService.getLocationByName(locationData.name);

            if(locationByName){
                throw new Error("Location with this name already exists");
            }

            const locationByParentId = await this.locationService.getLocationById(locationData.parentId);

            if(!locationByParentId){
                throw new Error("Parent location not found");
            }

            const newLocation = await this.locationService.createLocation(locationData);

            res.status(201).json(new ApiResponse(201, "Location created successfully", newLocation));
        } catch (error) {
            next(error);
        }
    };

    public updateLocation = async (req: Request<{}, {}, ILocation >, res: Response, next: NextFunction) => {
        try {
            const updateData :ILocation = req.body;

            if(!updateData.id){
                throw new Error("id is required");
            }

            if(!updateData.name){
                throw new Error("Name is required");
            }

            if(!updateData.type){
                throw new Error("Type is required");
            }
            if(!updateData.longitude){
                throw new Error("longitude is required");
            }
            if(!updateData.latitude){
                throw new Error("latitude is required");
            }

            if(!updateData.parentId){
                throw new Error("Parent id is required");
            }
            if(updateData.type !== "CITY" && updateData.type !== "NEIGHBOURHOOD" && updateData.type !== "STATE" && updateData.type !== "COUNTRY"){
                throw new Error("Invalid type");
            }

            const location = await this.locationService.getLocationById(updateData.id);

            if(!location){
                throw new Error("Location not found");
            }

            const locationByParentId = await this.locationService.getLocationById(updateData.parentId);

            if(!locationByParentId){
                throw new Error("Parent location not found");
            }

            const locationByName = await this.locationService.getLocationByName(updateData.name);

            if(locationByName && locationByName.id !== updateData.id){
                throw new Error("Location with this name already exists");
            }

            const updatedLocation = await this.locationService.updateLocation(updateData.id, updateData);

            if (!updatedLocation) {
                throw new Error("Location not found");
            }

            res.status(200).json(new ApiResponse(200, "Location updated successfully", updatedLocation));
        } catch (error) {
            next(error);
        }
    };

    public deleteLocation = async (req: Request<{}, {}, { id: number }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.body;

            if (!id) {
                throw new Error(" ID is required");
            }

            const deleted = await this.locationService.deleteLocation(id);

            if (!deleted) {
                throw new Error("Location not found");
            }

            res.status(200).json(new ApiResponse(200, "Location deleted successfully", null));
        } catch (error) {
            next(error);
        }
    };

    

    
    
}