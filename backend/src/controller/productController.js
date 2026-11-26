import fs from "fs";
import Product from "../model/product.model.js";
import cloudinary from "../config/cloudinary.js";

const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search && typeof search === "string") {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.name = { $regex: escaped, $options: "i" };
        }

        if (category && typeof category === "string") {
            query.category = category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ message: "Products found", products });
    } catch (error) {
        console.error("GetProducts Error:", error.message);
        return res.status(500).json({ message: "Internal server error fetching products" });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product found", product });
    } catch (error) {
        console.error("GetProductById Error:", error.message);
        return res.status(500).json({ message: "Internal server error fetching product" });
    }
};

const createProduct = async (req, res) => {
    let tempFilePath = req.file?.path;
    try {
        const { name, description, price, category, stock } = req.body;

        if (!name || !description || price === undefined || !category || stock === undefined) {
            return res.status(400).json({ message: "All product fields are required" });
        }

        const parsedPrice = Number(price);
        const parsedStock = Number(stock);

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ message: "Price must be a valid non-negative number" });
        }

        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ message: "Stock must be a non-negative integer" });
        }

        let imageUrl = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "shopnext_products"
            });
            imageUrl = result.secure_url;
        } else {
            return res.status(400).json({ message: "Product image is required" });
        }

        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            category: category.trim(),
            stock: parsedStock,
            imageUrl
        });

        const createdProduct = await product.save();
        return res.status(201).json(createdProduct);
    } catch (error) {
        console.error("CreateProduct Error:", error.message);
        return res.status(500).json({ message: "Internal server error creating product" });
    } finally {
        // Securely delete temporary multer upload file to prevent disk exhaustion
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (unlinkErr) {
                console.error("Failed to delete temp file:", unlinkErr.message);
            }
        }
    }
};

const updateProduct = async (req, res) => {
    let tempFilePath = req.file?.path;
    try {
        const { name, description, price, category, stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (name !== undefined) product.name = name.trim();
        if (description !== undefined) product.description = description.trim();
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ message: "Price must be a valid non-negative number" });
            }
            product.price = parsedPrice;
        }
        if (category !== undefined) product.category = category.trim();
        if (stock !== undefined) {
            const parsedStock = Number(stock);
            if (!Number.isInteger(parsedStock) || parsedStock < 0) {
                return res.status(400).json({ message: "Stock must be a non-negative integer" });
            }
            product.stock = parsedStock;
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "shopnext_products"
            });
            product.imageUrl = result.secure_url;
        }

        const updatedProduct = await product.save();
        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("UpdateProduct Error:", error.message);
        return res.status(500).json({ message: "Internal server error updating product" });
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (unlinkErr) {
                console.error("Failed to delete temp file:", unlinkErr.message);
            }
        }
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await product.deleteOne();
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("DeleteProduct Error:", error.message);
        return res.status(500).json({ message: "Internal server error deleting product" });
    }
};

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
