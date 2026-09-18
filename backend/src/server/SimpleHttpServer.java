package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import model.*;
import service.*;
import util.JsonUtil;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.*;

/**
 * SimpleHttpServer - Core Java 21 Lightweight REST Server
 * 
 * Implements REST endpoints for the React frontend using pure Java standard library
 * (com.sun.net.httpserver.HttpServer). No Spring Boot, no external container needed.
 */
public class SimpleHttpServer {

    private final int port;
    private HttpServer server;

    private final ProductService productService = new ProductService();
    private final CategoryService categoryService = new CategoryService();
    private final SupplierService supplierService = new SupplierService();
    private final StockService stockService = new StockService();
    private final SaleService saleService = new SaleService();
    private final ReportService reportService = new ReportService();

    public SimpleHttpServer(int port) {
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api", new ApiHandler());
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()); // Java 21 Virtual Threads
        server.start();
        System.out.println("==================================================");
        System.out.println("SMART STATIONERY REST API SERVER STARTED");
        System.out.println("Port: " + port + " | Base URL: http://localhost:" + port + "/api");
        System.out.println("Powered by: Java 21 LTS Virtual Threads & JDBC");
        System.out.println("==================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("Server stopped.");
        }
    }

    private class ApiHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Apply CORS headers for React frontend
            addCorsHeaders(exchange);

            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> queryParams = parseQueryParams(query);

            try {
                // Route dispatching
                if (path.startsWith("/api/products")) {
                    handleProducts(exchange, method, path, queryParams);
                } else if (path.startsWith("/api/categories")) {
                    handleCategories(exchange, method, path);
                } else if (path.startsWith("/api/suppliers")) {
                    handleSuppliers(exchange, method, path);
                } else if (path.startsWith("/api/stock")) {
                    handleStock(exchange, method, path);
                } else if (path.startsWith("/api/sales")) {
                    handleSales(exchange, method, path);
                } else if (path.startsWith("/api/reports")) {
                    handleReports(exchange, method, path);
                } else {
                    sendError(exchange, 404, "Endpoint not found: " + path);
                }
            } catch (IllegalArgumentException e) {
                sendError(exchange, 400, e.getMessage());
            } catch (IllegalStateException e) {
                sendError(exchange, 409, e.getMessage());
            } catch (Exception e) {
                e.printStackTrace();
                sendError(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }
    }

    // -------------------------------------------------------------
    // PRODUCTS ENDPOINTS
    // -------------------------------------------------------------
    private void handleProducts(HttpExchange ex, String method, String path, Map<String, String> q) throws Exception {
        String sub = path.replace("/api/products", "");

        if (sub.isEmpty() || sub.equals("/")) {
            if ("GET".equals(method)) {
                String search = q.get("search");
                Integer catId = q.get("category") != null ? Integer.parseInt(q.get("category")) : null;
                String status = q.get("status");
                List<Product> list = productService.getAllProducts(search, catId, status);
                sendJson(ex, 200, JsonUtil.toJson(list));
            } else if ("POST".equals(method)) {
                String body = readBody(ex);
                Map<String, String> m = JsonUtil.parse(body);
                Product p = new Product();
                p.setProductName(m.get("productName"));
                p.setSku(m.get("sku"));
                p.setBarcode(m.get("barcode"));
                p.setCategoryId(parseInt(m.get("categoryId"), "Category ID"));
                p.setSupplierId(parseInt(m.get("supplierId"), "Supplier ID"));
                p.setUnitPrice(parseDouble(m.get("unitPrice"), "Unit Price"));
                p.setQuantity(parseInt(m.get("quantity"), "Quantity"));
                p.setReorderPoint(parseInt(m.get("reorderPoint"), "Reorder Point"));
                p.setBinLocation(m.get("binLocation"));

                Product created = productService.addProduct(p);
                sendJson(ex, 201, JsonUtil.toJson(created));
            } else {
                sendError(ex, 405, "Method Not Allowed");
            }
        } else {
            int id = parsePathId(sub);
            if ("GET".equals(method)) {
                Product p = productService.getProductById(id);
                sendJson(ex, 200, JsonUtil.toJson(p));
            } else if ("PUT".equals(method)) {
                String body = readBody(ex);
                Map<String, String> m = JsonUtil.parse(body);
                Product p = new Product();
                p.setProductId(id);
                p.setProductName(m.get("productName"));
                p.setSku(m.get("sku"));
                p.setBarcode(m.get("barcode"));
                p.setCategoryId(parseInt(m.get("categoryId"), "Category ID"));
                p.setSupplierId(parseInt(m.get("supplierId"), "Supplier ID"));
                p.setUnitPrice(parseDouble(m.get("unitPrice"), "Unit Price"));
                p.setReorderPoint(parseInt(m.get("reorderPoint"), "Reorder Point"));
                p.setBinLocation(m.get("binLocation"));

                Product updated = productService.updateProduct(p);
                sendJson(ex, 200, JsonUtil.toJson(updated));
            } else if ("DELETE".equals(method)) {
                productService.deleteProduct(id);
                sendJson(ex, 200, "{\"success\":true,\"message\":\"Product deleted successfully\"}");
            } else {
                sendError(ex, 405, "Method Not Allowed");
            }
        }
    }

    // -------------------------------------------------------------
    // CATEGORIES ENDPOINTS
    // -------------------------------------------------------------
    private void handleCategories(HttpExchange ex, String method, String path) throws Exception {
        String sub = path.replace("/api/categories", "");
        if (sub.isEmpty() || sub.equals("/")) {
            if ("GET".equals(method)) {
                sendJson(ex, 200, JsonUtil.toJson(categoryService.getAllCategories()));
            } else if ("POST".equals(method)) {
                Map<String, String> m = JsonUtil.parse(readBody(ex));
                Category c = new Category(m.get("categoryName"));
                Category created = categoryService.addCategory(c);
                sendJson(ex, 201, JsonUtil.toJson(created));
            } else {
                sendError(ex, 405, "Method Not Allowed");
            }
        } else {
            int id = parsePathId(sub);
            if ("GET".equals(method)) {
                sendJson(ex, 200, JsonUtil.toJson(categoryService.getCategoryById(id)));
            } else if ("PUT".equals(method)) {
                Map<String, String> m = JsonUtil.parse(readBody(ex));
                Category c = new Category(id, m.get("categoryName"));
                sendJson(ex, 200, JsonUtil.toJson(categoryService.updateCategory(c)));
            } else if ("DELETE".equals(method)) {
                categoryService.deleteCategory(id);
                sendJson(ex, 200, "{\"success\":true,\"message\":\"Category deleted successfully\"}");
            } else {
                sendError(ex, 405, "Method Not Allowed");
            }
        }
    }

    // -------------------------------------------------------------
    // SUPPLIERS ENDPOINTS
    // -------------------------------------------------------------
    private void handleSuppliers(HttpExchange ex, String method, String path) throws Exception {
        String sub = path.replace("/api/suppliers", "");
        if (sub.isEmpty() || sub.equals("/")) {
            if ("GET".equals(method)) {
                sendJson(ex, 200, JsonUtil.toJson(supplierService.getAllSuppliers()));
            } else if ("POST".equals(method)) {
                Map<String, String> m = JsonUtil.parse(readBody(ex));
                Supplier s = new Supplier(0, m.get("supplierName"), m.get("phone"), m.get("email"), m.get("address"), m.get("status"));
                sendJson(ex, 201, JsonUtil.toJson(supplierService.addSupplier(s)));
            } else {
                sendError(ex, 405, "Method Not Allowed");
            }
        } else {
            int id = parsePathId(sub);
            if ("GET".equals(method)) {
                sendJson(ex, 200, JsonUtil.toJson(supplierService.getSupplierById(id)));
            } else if ("PUT".equals(method)) {
                Map<String, String> m = JsonUtil.parse(readBody(ex));
                Supplier s = new Supplier(id, m.get("supplierName"), m.get("phone"), m.get("email"), m.get("address"), m.get("status"));
                sendJson(ex, 200, JsonUtil.toJson(supplierService.updateSupplier(s)));
            } else if ("DELETE".equals(method)) {
                supplierService.deleteSupplier(id);
                sendJson(ex, 200, "{\"success\":true,\"message\":\"Supplier deleted successfully\"}");
            } else {
                sendError(ex, 405, "Method Not Allowed");
            }
        }
    }

    // -------------------------------------------------------------
    // STOCK OPERATIONS ENDPOINTS
    // -------------------------------------------------------------
    private void handleStock(HttpExchange ex, String method, String path) throws Exception {
        if ("/api/stock/history".equals(path) && "GET".equals(method)) {
            sendJson(ex, 200, JsonUtil.toJson(stockService.getTransactionHistory()));
            return;
        }

        if (!"POST".equals(method)) {
            sendError(ex, 405, "Method Not Allowed");
            return;
        }

        Map<String, String> m = JsonUtil.parse(readBody(ex));
        int productId = parseInt(m.get("productId"), "Product ID");
        int quantity = parseInt(m.get("quantity"), "Quantity");
        String remarks = m.get("remarks");

        StockTransaction tx;
        if ("/api/stock/inward".equals(path)) {
            tx = stockService.recordInward(productId, quantity, remarks);
        } else if ("/api/stock/outward".equals(path)) {
            tx = stockService.recordOutward(productId, quantity, remarks);
        } else if ("/api/stock/damaged".equals(path)) {
            tx = stockService.recordDamaged(productId, quantity, remarks);
        } else {
            sendError(ex, 404, "Stock endpoint not found: " + path);
            return;
        }
        sendJson(ex, 200, JsonUtil.toJson(tx));
    }

    // -------------------------------------------------------------
    // SALES ENDPOINTS
    // -------------------------------------------------------------
    private void handleSales(HttpExchange ex, String method, String path) throws Exception {
        if ("GET".equals(method)) {
            sendJson(ex, 200, JsonUtil.toJson(saleService.getAllSales()));
        } else if ("POST".equals(method)) {
            Map<String, String> m = JsonUtil.parse(readBody(ex));
            int productId = parseInt(m.get("productId"), "Product ID");
            int quantitySold = parseInt(m.get("quantitySold"), "Quantity Sold");
            Sale sale = saleService.recordSale(productId, quantitySold);
            sendJson(ex, 201, JsonUtil.toJson(sale));
        } else {
            sendError(ex, 405, "Method Not Allowed");
        }
    }

    // -------------------------------------------------------------
    // REPORTS & DASHBOARD ENDPOINTS
    // -------------------------------------------------------------
    private void handleReports(HttpExchange ex, String method, String path) throws Exception {
        if (!"GET".equals(method)) {
            sendError(ex, 405, "Method Not Allowed");
            return;
        }

        if ("/api/reports/dashboard".equals(path)) {
            sendJson(ex, 200, JsonUtil.toJson(reportService.getDashboardSummary()));
        } else if ("/api/reports/low-stock".equals(path)) {
            sendJson(ex, 200, JsonUtil.toJson(reportService.getLowStockReport()));
        } else if ("/api/reports/valuation".equals(path)) {
            sendJson(ex, 200, JsonUtil.toJson(reportService.getValuationReport()));
        } else if ("/api/reports/stock-movement".equals(path)) {
            sendJson(ex, 200, JsonUtil.toJson(reportService.getStockMovementReport()));
        } else {
            sendError(ex, 404, "Report endpoint not found: " + path);
        }
    }

    // -------------------------------------------------------------
    // HTTP UTILITIES & CORS
    // -------------------------------------------------------------
    private void addCorsHeaders(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
    }

    private void sendJson(HttpExchange ex, int statusCode, String jsonResponse) throws IOException {
        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendError(HttpExchange ex, int statusCode, String message) throws IOException {
        String json = "{\"success\":false,\"error\":\"" + escapeJson(message) + "\"}";
        sendJson(ex, statusCode, json);
    }

    private String readBody(HttpExchange ex) throws IOException {
        try (InputStream is = ex.getRequestBody();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    private int parsePathId(String sub) {
        if (sub.startsWith("/")) sub = sub.substring(1);
        try {
            return Integer.parseInt(sub);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid ID in URL: " + sub);
        }
    }

    private int parseInt(String val, String name) {
        if (val == null || val.trim().isEmpty()) {
            throw new IllegalArgumentException(name + " is required.");
        }
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(name + " must be a valid integer.");
        }
    }

    private double parseDouble(String val, String name) {
        if (val == null || val.trim().isEmpty()) {
            throw new IllegalArgumentException(name + " is required.");
        }
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(name + " must be a valid number.");
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.trim().isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String val = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                map.put(key, val);
            }
        }
        return map;
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    // -------------------------------------------------------------
    // STATIC FRONTEND FILE HANDLER
    // -------------------------------------------------------------
    private class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.startsWith("/api")) {
                // Ignore, handled by ApiHandler
                return;
            }

            if (path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            File baseDir = new File("frontend");
            if (!baseDir.exists()) {
                baseDir = new File("../frontend");
            }

            File file = new File(baseDir, path.startsWith("/") ? path.substring(1) : path);
            if (!file.exists() || file.isDirectory()) {
                String notFound = "<h1>404 Not Found</h1><p>Resource " + path + " not found.</p>";
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, notFound.getBytes(StandardCharsets.UTF_8).length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
                return;
            }

            String contentType = "text/plain";
            if (path.endsWith(".html")) contentType = "text/html; charset=UTF-8";
            else if (path.endsWith(".css")) contentType = "text/css; charset=UTF-8";
            else if (path.endsWith(".js")) contentType = "application/javascript; charset=UTF-8";
            else if (path.endsWith(".svg")) contentType = "image/svg+xml";
            else if (path.endsWith(".png")) contentType = "image/png";
            else if (path.endsWith(".ico")) contentType = "image/x-icon";
            else if (path.endsWith(".json")) contentType = "application/json; charset=UTF-8";

            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            byte[] bytes = java.nio.file.Files.readAllBytes(file.toPath());
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }
}
