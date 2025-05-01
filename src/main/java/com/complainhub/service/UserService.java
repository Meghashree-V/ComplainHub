package com.complainhub.service;

import com.google.firebase.auth.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    public ResponseEntity<?> signup(String email, String password, String name, String role, String department, String studentId, String status, String blockReason) {
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password)
                    .setDisplayName(name)
                    .setEmailVerified(false);
            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

            // Store additional info in Firestore
            Firestore db = FirestoreClient.getFirestore();
            Map<String, Object> userData = new HashMap<>();
            userData.put("uid", userRecord.getUid());
            userData.put("email", email);
            userData.put("name", name);
            userData.put("role", role);
            userData.put("department", department);
            userData.put("studentId", studentId);
            userData.put("status", status);
            userData.put("blockReason", blockReason);
            db.collection("users").document(userRecord.getUid()).set(userData);

            return ResponseEntity.ok(userData);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // Upsert user data in Firestore if missing (for existing Auth users)
    public void upsertUserDataIfMissing(String uid, String email, String name, String role) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            com.google.api.core.ApiFuture<com.google.cloud.firestore.DocumentSnapshot> future = db.collection("users").document(uid).get();
            com.google.cloud.firestore.DocumentSnapshot document = future.get();
            if (document.exists()) return;
            Map<String, Object> userData = new HashMap<>();
            userData.put("uid", uid);
            userData.put("email", email);
            userData.put("name", name);
            userData.put("role", role);
            userData.put("department", "");
            userData.put("studentId", "");
            userData.put("status", "active");
            userData.put("blockReason", "");
            db.collection("users").document(uid).set(userData);
        } catch (Exception ignored) {}
    }

    public ResponseEntity<?> signin(String email, String password) {
        // Firebase Admin SDK does not support password verification directly.
        // In production, use custom tokens or verify ID tokens from frontend.
        // Here, return error or instruct to use frontend for password sign-in.
        return ResponseEntity.status(501).body("Signin with password is not supported on backend. Please use frontend Firebase Auth and send ID token to backend.");
    }

    public ResponseEntity<?> adminLogin(String email, String password) {
        // Similar to signin, but also check for admin role in Firestore
        return ResponseEntity.status(501).body("Admin login with password is not supported on backend. Please use frontend Firebase Auth and send ID token to backend. Optionally, check role in backend.");
    }

    public ResponseEntity<?> getAllUsers() {
        try {
            Firestore db = FirestoreClient.getFirestore();
            java.util.List<com.google.cloud.firestore.QueryDocumentSnapshot> documents = db.collection("users").get().get().getDocuments();
            java.util.List<java.util.Map<String, Object>> users = new java.util.ArrayList<>();
            for (com.google.cloud.firestore.QueryDocumentSnapshot doc : documents) {
                users.add(doc.getData());
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch users: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getAllAuthUsers() {
        try {
            java.util.List<java.util.Map<String, Object>> users = new java.util.ArrayList<>();
            com.google.firebase.auth.ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);
            for (com.google.firebase.auth.ExportedUserRecord user : page.iterateAll()) {
                java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("uid", user.getUid());
                userMap.put("email", user.getEmail());
                userMap.put("displayName", user.getDisplayName());
                userMap.put("phoneNumber", user.getPhoneNumber());
                userMap.put("photoUrl", user.getPhotoUrl());
                userMap.put("providerId", user.getProviderId());
                userMap.put("emailVerified", user.isEmailVerified());
                userMap.put("disabled", user.isDisabled());
                users.add(userMap);
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch auth users: " + e.getMessage());
        }
    }

    public ResponseEntity<?> blockUser(String id, String blockReason) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "blocked");
            updates.put("blockReason", blockReason);
            db.collection("users").document(id).update(updates);
            return ResponseEntity.ok("User blocked successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to block user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> unblockUser(String id) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "active");
            updates.put("blockReason", "");
            db.collection("users").document(id).update(updates);
            return ResponseEntity.ok("User unblocked successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to unblock user: " + e.getMessage());
        }
    }
}
