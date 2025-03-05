import { Router } from 'express';
import { LocationController } from '../../Controller/LocationController';
import authMiddleware from '../../Middleware/authMiddleware';
const router = Router();

const locationController :LocationController = new LocationController();




router.post('/admin/location/addCountries',authMiddleware ,locationController.addAllCountries.bind(locationController));

router.post('/admin/location/addCities',authMiddleware ,locationController.addAllCities.bind(locationController));

router.post("/admin/location/addStates",authMiddleware ,locationController.addAllStates.bind(locationController));

router.post("/admin/location/addNeighbourHood",authMiddleware ,locationController.addAllNeighbourhood.bind(locationController));

router.get('/admin/location/getLocation',authMiddleware ,locationController.getLocation.bind(locationController));

router.get('/admin/location/getCountries',authMiddleware ,locationController.getCountries.bind(locationController));

router.post('/admin/location/getFilteredLocations',authMiddleware ,locationController.getFilteredLocations.bind(locationController));

router.post('/admin/location/getAllChildLocations',authMiddleware ,locationController.getAllChildLocations.bind(locationController));

router.post('/admin/location/searchLocation',authMiddleware ,locationController.searchLocation.bind(locationController));

router.post('/admin/location/getLocationById',authMiddleware ,locationController.getLocationById.bind(locationController));

router.post('/admin/location/addLocation',authMiddleware ,locationController.createLocation.bind(locationController));

router.post('/admin/location/updateLocation',authMiddleware ,locationController.updateLocation.bind(locationController));

router.post('/admin/location/deleteLocation',authMiddleware ,locationController.deleteLocation.bind(locationController));

export default router;