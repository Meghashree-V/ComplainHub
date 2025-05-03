package com.complainhub.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ComplaintService {
    private final String COMPLAINTS_COLLECTION = "complaints";

    public ResponseEntity<?> createComplaint(Map<String, Object> payload) {
        try {
            // Ensure studentId is always set
            if (!payload.containsKey("studentId") && payload.containsKey("uid")) {
                payload.put("studentId", payload.get("uid"));
            }
            
            // Log the incoming payload for debugging
            System.out.println("Creating complaint with payload: " + payload);
            
            // Ensure required fields are present
            if (!payload.containsKey("title") || !payload.containsKey("description")) {
                return ResponseEntity.badRequest().body("Missing required fields: title or description");
            }
            
            // Set default values if missing
            if (!payload.containsKey("status")) {
                payload.put("status", "pending");
            }
            if (!payload.containsKey("category")) {
                payload.put("category", "general");
            }
            
            Firestore db = FirestoreClient.getFirestore();
            
            // Always set both createdAt and timestamp fields
            payload.put("createdAt", new Date());
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
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection(COMPLAINTS_COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Map<String, Object>> complaints = new ArrayList<>();
            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> complaint = new HashMap<>();
                complaint.put("id", doc.getId());
                Map<String, Object> data = doc.getData();
                // Fill all required fields with defaults if missing
                complaint.put("title", data.getOrDefault("title", ""));
                complaint.put("description", data.getOrDefault("description", ""));
                complaint.put("category", data.getOrDefault("category", "others"));
                complaint.put("status", data.getOrDefault("status", "pending"));
                complaint.put("priority", data.getOrDefault("priority", "low"));
                complaint.put("studentId", data.getOrDefault("studentId", ""));
                complaint.put("studentName", data.getOrDefault("studentName", ""));
                complaint.put("department", data.getOrDefault("department", ""));
                complaint.put("createdAt", data.getOrDefault("createdAt", new Date()));
                complaint.put("updatedAt", data.getOrDefault("updatedAt", new Date()));
                complaint.put("comments", data.getOrDefault("comments", new ArrayList<>()));
                complaint.put("updates", data.getOrDefault("updates", new ArrayList<>()));
                complaint.put("assignedTo", data.getOrDefault("assignedTo", ""));
                complaint.put("resolvedAt", data.getOrDefault("resolvedAt", null));
                complaint.put("rejectionReason", data.getOrDefault("rejectionReason", ""));
                complaint.put("imageUrl", data.getOrDefault("imageUrl", ""));
                complaints.add(complaint);
            }
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching complaints: " + e.getMessage());
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
