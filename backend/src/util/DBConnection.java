package util;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * DBConnection - Database Connection Utility
 * 
 * Provides centralized, thread-safe database connections using plain JDBC.
 * Reads connection settings from external db.properties or environment variables
 * to avoid hardcoding credentials.
 */
public class DBConnection {

    private static String url = "jdbc:mysql://localhost:3306/inventory_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static String username = "root";
    private static String password = "root";

    static {
        loadConfiguration();
        try {
            // Explicitly load MySQL JDBC Type 4 Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("CRITICAL ERROR: MySQL JDBC Driver not found in classpath!");
            e.printStackTrace();
        }
    }

    private static void loadConfiguration() {
        Properties props = new Properties();
        File configFile = new File("db.properties");
        
        try {
            if (configFile.exists()) {
                try (InputStream fis = new FileInputStream(configFile)) {
                    props.load(fis);
                }
            } else {
                // Try to load from classpath resources
                try (InputStream is = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
                    if (is != null) {
                        props.load(is);
                    }
                }
            }

            if (props.getProperty("db.url") != null) {
                url = props.getProperty("db.url").trim();
            }
            if (props.getProperty("db.username") != null) {
                username = props.getProperty("db.username").trim();
            }
            if (props.getProperty("db.password") != null) {
                password = props.getProperty("db.password").trim();
            }

            // Also check environment variables as overrides
            if (System.getenv("DB_URL") != null) url = System.getenv("DB_URL");
            if (System.getenv("DB_USERNAME") != null) username = System.getenv("DB_USERNAME");
            if (System.getenv("DB_PASSWORD") != null) password = System.getenv("DB_PASSWORD");

        } catch (Exception e) {
            System.out.println("Notice: Using default database connection settings (" + e.getMessage() + ")");
        }
    }

    /**
     * Obtains a new database connection.
     * @return active java.sql.Connection instance
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    /**
     * Safely closes one or more database resources (Connection, Statement, ResultSet).
     * Useful in finally blocks to prevent resource leaks.
     */
    public static void close(AutoCloseable... resources) {
        for (AutoCloseable res : resources) {
            if (res != null) {
                try {
                    res.close();
                } catch (Exception ignored) {
                }
            }
        }
    }

    /**
     * Safely rolls back a transaction if an error occurred.
     */
    public static void rollback(Connection conn) {
        if (conn != null) {
            try {
                conn.rollback();
            } catch (SQLException ignored) {
            }
        }
    }
}
