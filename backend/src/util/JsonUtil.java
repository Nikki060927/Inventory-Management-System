package util;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;

/**
 * JsonUtil - Pure Core Java JSON Serializer & Parser
 * 
 * Provides beginner-friendly JSON serialization and parsing using only standard Java 21
 * libraries (Zero external framework dependencies required).
 */
public class JsonUtil {

    /**
     * Converts any Java Object, Map, or List into a valid JSON string.
     */
    public static String toJson(Object obj) {
        if (obj == null) return "null";

        if (obj instanceof String) {
            return "\"" + escape((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof Collection<?>) {
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : (Collection<?>) obj) {
                if (!first) sb.append(",");
                sb.append(toJson(item));
                first = false;
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof Map<?, ?>) {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) obj).entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(escape(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }

        // For POJO objects: serialize all fields that have standard getter methods
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        Method[] methods = obj.getClass().getMethods();

        for (Method method : methods) {
            String name = method.getName();
            if (method.getParameterCount() == 0 && !name.equals("getClass")) {
                String key = null;
                if (name.startsWith("get") && name.length() > 3) {
                    key = Character.toLowerCase(name.charAt(3)) + name.substring(4);
                } else if (name.startsWith("is") && name.length() > 2) {
                    key = Character.toLowerCase(name.charAt(2)) + name.substring(3);
                }

                if (key != null) {
                    try {
                        Object val = method.invoke(obj);
                        if (!first) sb.append(",");
                        sb.append("\"").append(key).append("\":").append(toJson(val));
                        first = false;
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        sb.append("}");
        return sb.toString();
    }

    /**
     * Parses a flat/simple JSON string into a Map of key-value pairs.
     */
    public static Map<String, String> parse(String json) {
        Map<String, String> map = new LinkedHashMap<>();
        if (json == null || json.trim().isEmpty()) return map;

        String s = json.trim();
        if (s.startsWith("{")) s = s.substring(1);
        if (s.endsWith("}")) s = s.substring(0, s.length() - 1);

        boolean inQuotes = false;
        StringBuilder currentKey = new StringBuilder();
        StringBuilder currentValue = new StringBuilder();
        boolean parsingKey = true;

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if (c == '\"' && (i == 0 || s.charAt(i - 1) != '\\')) {
                inQuotes = !inQuotes;
                continue;
            }

            if (!inQuotes) {
                if (c == ':' && parsingKey) {
                    parsingKey = false;
                    continue;
                } else if (c == ',') {
                    putClean(map, currentKey.toString(), currentValue.toString());
                    currentKey.setLength(0);
                    currentValue.setLength(0);
                    parsingKey = true;
                    continue;
                }
            }

            if (parsingKey) {
                currentKey.append(c);
            } else {
                currentValue.append(c);
            }
        }

        if (currentKey.length() > 0) {
            putClean(map, currentKey.toString(), currentValue.toString());
        }

        return map;
    }

    private static void putClean(Map<String, String> map, String key, String val) {
        String k = key.trim();
        String v = val.trim();
        if (k.startsWith("\"") && k.endsWith("\"")) k = k.substring(1, k.length() - 1);
        if (v.startsWith("\"") && v.endsWith("\"")) v = v.substring(1, v.length() - 1);
        if ("null".equalsIgnoreCase(v)) v = null;
        map.put(k, v);
    }

    private static String escape(String raw) {
        if (raw == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            switch (c) {
                case '\"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default: sb.append(c); break;
            }
        }
        return sb.toString();
    }
}
