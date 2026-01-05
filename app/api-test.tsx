import { logAPIConfig, testBackendConnection } from "@/lib/api-health";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function APITestScreen() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logAPIConfig();
    runTest();
  }, []);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testBackendConnection();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        status: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Frontend-Backend Connection Test</Text>

        {loading ? (
          <Text style={styles.loading}>Testing connection...</Text>
        ) : testResult ? (
          <>
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor:
                    testResult.status === "success" ? "#d4edda" : "#f8d7da",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      testResult.status === "success" ? "#155724" : "#721c24",
                  },
                ]}
              >
                Status: {testResult.status.toUpperCase()}
              </Text>
              <Text style={styles.message}>{testResult.message}</Text>
              {testResult.baseURL && (
                <Text style={styles.detail}>
                  Backend URL: {testResult.baseURL}
                </Text>
              )}
            </View>

            {testResult.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorMessage}>
                  {testResult.error.toString()}
                </Text>
              </View>
            )}
          </>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={runTest}>
          <Text style={styles.buttonText}>
            {loading ? "Testing..." : "Run Test Again"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Connection Info:</Text>
          <Text style={styles.infoText}>
            • Frontend running on: localhost:8081
          </Text>
          <Text style={styles.infoText}>
            • Backend running on: localhost:5000/api
          </Text>
          <Text style={styles.infoText}>• Testing endpoint: /api/health</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  loading: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  resultBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 10,
    color: "#333",
  },
  detail: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  errorBox: {
    padding: 15,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b6b",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#856404",
  },
  errorMessage: {
    fontSize: 12,
    color: "#856404",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    fontFamily: "monospace",
  },
});
