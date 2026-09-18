import server.SimpleHttpServer;
import util.DatabaseInitializer;

/**
 * Main - Backend Bootstrap Entry Point
 * 
 * 1. Checks and initializes MySQL database tables and seed data.
 * 2. Starts the Java 21 REST HTTP server on port 8080.
 * 3. Exposes clean REST API endpoints for the React frontend.
 */
public class Main {

    private static final int PORT = 8080;

    public static void main(String[] args) {
        System.out.println("******************************************************************");
        System.out.println("*        SMART STATIONERY INVENTORY MANAGEMENT SYSTEM            *");
        System.out.println("*            Core Java 21 + JDBC + MySQL Backend                 *");
        System.out.println("******************************************************************");

        try {
            // Step 1: Ensure database schema & seed data are initialized
            System.out.println("\n[1/2] Verifying database connectivity & tables...");
            DatabaseInitializer.initialize();

            // Step 2: Start REST API HTTP Server
            System.out.println("\n[2/2] Starting REST API HTTP Server on port " + PORT + "...");
            SimpleHttpServer server = new SimpleHttpServer(PORT);
            server.start();

            // Add clean shutdown hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\nShutting down Smart Stationery server...");
                server.stop();
            }));

            System.out.println("\n>>> Server is LIVE at: http://localhost:" + PORT + "/api");
            System.out.println(">>> Ready to accept REST requests from React frontend or Postman.");
            System.out.println(">>> Press Ctrl+C in this terminal to stop the server.\n");

        } catch (Exception e) {
            System.err.println("\nFailed to start Smart Stationery Backend Server!");
            e.printStackTrace();
        }
    }
}
