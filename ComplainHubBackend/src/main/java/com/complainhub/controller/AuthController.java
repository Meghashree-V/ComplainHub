package com.complainhub.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow all origins for dev; restrict in prod
public class AuthController {

    @Autowired
    private com.complainhub.service.UserService userService;

    @PostMapping("/verifyToken")
    public ResponseEntity<?> verifyToken(@RequestBody TokenRequest tokenRequest) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(tokenRequest.getIdToken());
            // Upsert user data in Firestore if missing
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = (String) decodedToken.getClaims().getOrDefault("name", email);
            String role = "student"; // Default role, adjust if you store roles in custom claims
            userService.upsertUserDataIfMissing(uid, email, name, role);
            return ResponseEntity.ok(decodedToken);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }

    // You can add more endpoints for admin logic, user registration, etc.

    public static class TokenRequest {
        private String idToken;
        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
    }
}
