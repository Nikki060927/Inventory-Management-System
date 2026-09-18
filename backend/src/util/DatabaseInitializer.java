package util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.Statement;

/**
 * DatabaseInitializer
 * Executes database/schema.sql through JDBC to set up tables and seed data automatically.
 */
public class DatabaseInitializer {

    public static void initialize() {
        File schemaFile = new File("../database/schema.sql");
        if (!schemaFile.exists()) {
            schemaFile = new File("database/schema.sql");
        }

        if (!schemaFile.exists()) {
            System.err.println("Warning: schema.sql file not found at " + schemaFile.getAbsolutePath());
            return;
        }

        System.out.println("Initializing database using schema from: " + schemaFile.getAbsolutePath());

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             BufferedReader br = new BufferedReader(new FileReader(schemaFile))) {

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("--") || line.isEmpty()) {
                    continue;
                }
                sb.append(line).append(" ");
                if (line.endsWith(";")) {
                    String sql = sb.toString().trim();
                    sql = sql.substring(0, sql.length() - 1).trim();
                    if (!sql.isEmpty()) {
                        try {
                            stmt.execute(sql);
                        } catch (Exception e) {
                            System.out.println("Notice on executing SQL: " + e.getMessage());
                        }
                    }
                    sb.setLength(0);
                }
            }
            System.out.println("Database tables and seed data initialized successfully!");
        } catch (Exception e) {
            System.err.println("Database initialization error: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        initialize();
    }
}
