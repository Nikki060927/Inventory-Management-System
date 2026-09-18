package util;

/**
 * ValidationUtil - Input Validation Utility
 * 
 * Centralizes basic, beginner-friendly validation logic for products,
 * categories, suppliers, stock, and sales.
 */
public class ValidationUtil {

    public static void requireNonEmpty(String val, String fieldName) {
        if (val == null || val.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required and cannot be empty.");
        }
    }

    public static void requirePositive(double val, String fieldName) {
        if (val <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than 0.");
        }
    }

    public static void requirePositive(int val, String fieldName) {
        if (val <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than 0.");
        }
    }

    public static void requireNonNegative(int val, String fieldName) {
        if (val < 0) {
            throw new IllegalArgumentException(fieldName + " cannot be negative.");
        }
    }

    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) return true; // Optional field
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) return true; // Optional field
        return phone.replaceAll("[\\s\\-\\(\\)\\+]", "").matches("^\\d{7,15}$");
    }
}
