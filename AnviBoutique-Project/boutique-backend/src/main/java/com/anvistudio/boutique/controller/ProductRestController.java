package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.model.Product;
import com.anvistudio.boutique.model.Review;
import com.anvistudio.boutique.service.ProductService;
import com.anvistudio.boutique.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for the Product catalog.
 * Replaces the traditional @Controller to serve JSON data to the React frontend.
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000") // Enable React dev server access
public class ProductRestController {

    private final ProductService productService;
    private final ReviewService reviewService;

    public ProductRestController(ProductService productService, ReviewService reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }

    /**
     * GET /api/products
     * Returns a filtered and sorted list of products.
     */
    @GetMapping
    public ResponseEntity<List<Product>> getFilteredProducts(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String keyword) {

        List<Product> products = productService.getFilteredProducts(
                category, sortBy, minPrice, maxPrice, status, color, keyword);
        
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/featured
     * Returns the top 8 latest products for the homepage.
     */
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getDisplayableProducts());
    }

    /**
     * GET /api/products/{id}
     * Returns individual product details including reviews and average ratings.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable Long id) {
        Optional<Product> productOptional = productService.getProductById(id);

        if (productOptional.isEmpty() || !productOptional.get().getIsAvailable()) {
            return ResponseEntity.notFound().build();
        }

        Product product = productOptional.get();
        List<Review> reviews = reviewService.getApprovedReviewsForProduct(id);
        double averageRating = reviewService.getAverageRating(id);
        long reviewCount = reviewService.getReviewCount(id);

        // Build a combined response object for React
        Map<String, Object> response = new HashMap<>();
        response.put("product", product);
        response.put("reviews", reviews);
        response.put("averageRating", averageRating);
        response.put("reviewCount", reviewCount);

        // Fetch related products (Category-based)
        List<Product> related = productService.getProductsByCategoryOrAll(product.getCategory());
        related.removeIf(p -> p.getId().equals(id));
        response.put("relatedProducts", related.subList(0, Math.min(related.size(), 4)));

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/products/categories
     * Utility endpoint to get the list of available categories for filters.
     */
    @GetMapping("/categories")
    public ResponseEntity<String[]> getCategories() {
        return ResponseEntity.ok(new String[]{
                "Sarees", "Lehengas", "Kurtis", "Long Frocks", "Mom & Me", "Crop Top – Skirts",
                "Handlooms", "Casual Frocks", "Ready To Wear", "Dupattas", "Kids wear",
                "Dress Material", "Blouses", "Fabrics"
        });
    }
}