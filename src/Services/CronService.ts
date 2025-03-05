import cron from 'node-cron';
import { Product, ProductStatus } from '../Model/ProductModel';
import { User } from '../Model/UserModel';
import { currentUnixTimestampMs } from '../Helper/getIsoDate';


// Assuming currentUnixTimestampMs() returns the current Unix timestamp in milliseconds
const updateExpiredProducts = async () => {
    const expirationThreshold = currentUnixTimestampMs() - (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
  
    await Product.updateMany(
      { publishedAt: { $lte: expirationThreshold }, status: ProductStatus.Active },
      { $set: { status: ProductStatus.Expired } }
    );
  
    console.log('✅ Expired products updated successfully.');
  };
  




// Schedule the jobs
cron.schedule('0 0 * * *', updateExpiredProducts);  // Runs daily at midnight
   // Runs every Sunday at 3 AM

console.log('🚀 Cron jobs initialized.');

// Export functions for manual execution if needed
export { updateExpiredProducts}