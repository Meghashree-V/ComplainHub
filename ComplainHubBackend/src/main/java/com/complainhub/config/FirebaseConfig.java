package com.complainhub.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void init() {
        // Log the GOOGLE_APPLICATION_CREDENTIALS environment variable
        String envCreds = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        System.out.println("[FIREBASE CONFIG] GOOGLE_APPLICATION_CREDENTIALS=" + envCreds);

        try {
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
            System.out.println("[FIREBASE CONFIG] Attempting to load firebase-service-account.json from classpath: " + (serviceAccount != null));
            if (serviceAccount == null) {
                System.err.println("[FIREBASE CONFIG] firebase-service-account.json NOT FOUND in classpath!");
                throw new RuntimeException("firebase-service-account.json not found in classpath");
            } else {
                System.out.println("[FIREBASE CONFIG] firebase-service-account.json found and loaded.");
            }
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("[FIREBASE CONFIG] Firebase initialized successfully.");
            }
        } catch (Exception e) {
            System.err.println("[FIREBASE CONFIG] Error initializing Firebase: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
