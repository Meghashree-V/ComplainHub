package com.complainhub.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import org.springframework.web.client.RestTemplate;

/**
 * Service class for handling complaints
 */
@Service
public class ComplaintService {
    private final String COMPLAINTS_COLLECTION = "complaints";

    /**
     * Creates a new complaint
     *
     * @param payload Complaint payload
     * @return ResponseEntity with complaint ID and success message
     */
    public ResponseEntity createComplaint(Map<String, Object> payload) {
        try {
            // Enforce presence of 'uid' in the payload
            if (!payload.containsKey("uid") || payload.get("uid") == null || payload.get("uid").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Missing 'uid' in complaint payload. Complaint must be associated with a user.");
            }
            Firestore db = FirestoreClient.getFirestore();
            payload.put("timestamp", new Date());
            ApiFuture<DocumentReference> future = db.collection(COMPLAINTS_COLLECTION).add(payload);
            Map<String, Object> response = new HashMap<>();
            response.put("id", future.get().getId());
            response.put("message", "Complaint created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating complaint: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getAllComplaints() {
        try {
            System.out.println("[ComplaintService] Fetching all complaints from Firestore...");
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection(COMPLAINTS_COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Map<String, Object>> complaints = new ArrayList<>();
            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> data = doc.getData();
                // For admin, include all fields from the complaint document
                Map<String, Object> complaint = new HashMap<>(data);
                // Add the document ID
                complaint.put("id", doc.getId());
                // ML Priority integration: Only add if not already present
                if (!complaint.containsKey("priority") && complaint.get("description") != null) {
                    String description = complaint.get("description").toString();
                    String priority = getPriorityFromML(description);
                    complaint.put("priority", priority);
                }
                complaints.add(complaint);
            }
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            System.err.println("[ComplaintService] Error fetching complaints:");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching complaints: " + e.getMessage());
        }
    }

    // Helper to call Flask ML API
    private String getPriorityFromML(String complaintText) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "http://localhost:5001/predict";
            Map<String, String> request = new HashMap<>();
            request.put("text", complaintText);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Object priority = response.getBody().get("priority");
            return priority != null ? priority.toString() : "Unknown";
        } catch (Exception e) {
            System.err.println("[ML] Error fetching priority: " + e.getMessage());
            return "Unknown";
        }
    }

    public ResponseEntity<?> getComplaintsByUser(String uid) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection(COMPLAINTS_COLLECTION).whereEqualTo("uid", uid).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Map<String, Object>> complaints = new ArrayList<>();
            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> complaint = doc.getData();
                complaint.put("id", doc.getId());
                complaints.add(complaint);
            }
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching user's complaints: " + e.getMessage());
        }
    }

    // ADMIN: Update complaint status
    public ResponseEntity<?> updateComplaintStatus(String id, Map<String, Object> payload) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection(COMPLAINTS_COLLECTION).document(id);
            Map<String, Object> updateMap = new HashMap<>();
            if (payload.containsKey("status")) {
                updateMap.put("status", payload.get("status"));
            }
            if (payload.containsKey("updatedBy")) {
                updateMap.put("updatedBy", payload.get("updatedBy"));
            }
            updateMap.put("updatedAt", new Date());
            // Update status fields
            ApiFuture<WriteResult> future = docRef.update(updateMap);
            future.get();

            // Append to 'updates' array in Firestore
            Map<String, Object> updateEntry = new HashMap<>();
            updateEntry.put("by", payload.getOrDefault("updatedBy", "admin"));
            updateEntry.put("date", new Date());
            updateEntry.put("status", payload.get("status"));
            if (payload.containsKey("description")) {
                updateEntry.put("description", payload.get("description"));
            }
            ApiFuture<WriteResult> updatesFuture = docRef.update("updates", FieldValue.arrayUnion(updateEntry));
            updatesFuture.get();

            return ResponseEntity.ok("Complaint status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating complaint status: " + e.getMessage());
        }
    }

    // ADMIN: Add comment to complaint
    public ResponseEntity<?> addAdminComment(String id, Map<String, Object> payload) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection(COMPLAINTS_COLLECTION).document(id);
            Map<String, Object> comment = new HashMap<>();
            comment.put("userId", payload.getOrDefault("userId", "admin"));
            comment.put("userName", payload.getOrDefault("userName", "Admin"));
            comment.put("content", payload.get("content"));
            comment.put("createdAt", new Date());
            ApiFuture<WriteResult> arrayUnionFuture = docRef.update("comments", FieldValue.arrayUnion(comment));
            arrayUnionFuture.get();
            return ResponseEntity.ok("Comment added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding comment: " + e.getMessage());
        }
    }
}
