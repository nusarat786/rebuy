import { Product, IProduct, ProductCondition, ProductStatus } from '../Model/ProductModel';
import { User } from '../Model/UserModel';
import { currentUnixTimestampMs } from '../Helper/getIsoDate';
// If you have a similar interface for pagination & sorting, you can import it.
// For example:
// import { IGetAllProductsWithPaginationSorting } from '../Controller/ProductController';


class ProductService {
  /**
   * Create a new product
   * @param productData Product data
   * @returns The created product object
   */
  public async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    await product.save();
    return product.toObject();
  }

  /**
   * Find a product by its ID
   * @param id Product ID
   * @returns The found product or null if not found
   */
  public async findProductById(id: string): Promise<IProduct | null> {
    //return Product.findById(id);
    const product = await Product.findById(id)
    .populate('mainCategory') // Populate mainCategory details
    .populate('subCategory') // Populate subCategory details
    .populate('location') // Populate location details
    .populate('seller', 'name email id') // Populate seller details with selected fields
    .populate('likedBy', 'name email id') // Populate likedBy users with selected fields
    .exec();


    return product;
  }


  /**
   * Update a product by its ID
   * @param id Product ID
   * @param productData Partial product data to update
   * @returns The updated product or null if not found
   */
  public async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
    if(!updatedProduct){
      return null;
    }
    console.log(updatedProduct);
    return updatedProduct.toObject();
  }



  /**
   * Delete a product by its ID
   * @param id Product ID
   * @returns The deleted product or null if not found
   */
  public async deleteProduct(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id);
  }

  /**
   * Increment the view count of a product
   * @param id Product ID
   * @returns The updated product or null if not found
   */
  public async incrementViewCount(id: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  /**
   * Like a product by adding a user to the likedBy array.
   * Prevents duplicate likes.
   * @param productId Product ID
   * @param userId User ID
   * @returns The updated product or null if not found
   */
  public async likeProduct(productId: string, userId: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $addToSet: { likedBy: userId } }, // addToSet prevents duplicates
      { new: true }
    );
  }

  /**
   * Unlike a product by removing a user from the likedBy array.
   * @param productId Product ID
   * @param userId User ID
   * @returns The updated product or null if not found
   */
  public async unlikeProduct(productId: string, userId: string): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $pull: { likedBy: userId } },
      { new: true }
    );
  }

  /**
   * Retrieve all products with pagination and sorting.
   * Adjust the interface as necessary if you have a dedicated request type.
   * @param reqBody Object containing pagination and sorting options.
   * @returns Array of products.
   */
  public async getAllProductsWithPaginationSorting(reqBody: {
    page: number;
    limit: number;
    sortField: string;
    sortOrder: 'ASC' | 'DESC';
  }): Promise<IProduct[]> {
    const skip = (reqBody.page - 1) * reqBody.limit;
    const sortOrder = reqBody.sortOrder === 'ASC' ? 1 : -1;
    return Product.find()
      .skip(skip)
      .limit(reqBody.limit)
      .sort({ [reqBody.sortField]: sortOrder });
  }

  /**
   * Get the total number of products.
   * @returns The total count of products.
   */
  public async getTotalProducts(): Promise<number> {
    return Product.countDocuments();
  }

  /**
   * Search products based on a specific field using a regex match.
   * @param searchField The field to search (e.g., "title" or "description").
   * @param search The search string.
   * @returns Array of products that match the search criteria.
   */
  public async searchProducts(searchField: string, search: string): Promise<IProduct[]> {
    return Product.find({ [searchField]: { $regex: search, $options: 'i' } });
  }

  /**
   * Update the status of a product.
   * @param productId Product ID
   * @param status New status for the product
   * @returns The updated product or null if not found
   */
  public async updateProductStatus(productId: string, status: ProductStatus): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { status },
      { new: true }
    );
  }

  /**
   * Add or update dynamic fields of a product.
   * @param productId Product ID
   * @param dynamicFields An object containing key-value pairs to set on the dynamicFields map
   * @returns The updated product or null if not found
   */
  public async updateDynamicFields(productId: string, dynamicFields: Record<string, any>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $set: { dynamicFields } },
      { new: true }
    );
  }


  // Method to get the number of products published by a user in the last 90 days
  async getProductCountInLast90Days(userId: string) {
    const currentTime = currentUnixTimestampMs();
    const ninetyDaysAgo = currentTime - (90 * 24 * 60 * 60 * 1000);

    // Count the number of products published by the user in the last 90 days
    const productCount = await Product.countDocuments({
      seller: userId, // Assuming `seller` is the field in Product model that refers to User
      publishedAt: { $gte: new Date(ninetyDaysAgo) }
      // , // Published in the last 90 days
      // status: { $in: [ProductStatus.Active, ProductStatus.Sold, ProductStatus.Expired] }
    });



    return productCount;
  }



}




export default ProductService;
