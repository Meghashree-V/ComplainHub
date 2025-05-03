package com.complainhub.controller;

import com.complainhub.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/complaint")
@CrossOrigin(origins = "*")
public class ComplaintController {
        @Autowired
    private ComplaintService complaintService;

    @PostMapping("/create")
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, Object> payload) {
        return complaintService.createComplaint(payload);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @GetMapping("/user/{uid}")
    public ResponseEntity<?> getComplaintsByUser(@PathVariable String uid) {
        return complaintService.getComplaintsByUser(uid);
    }

    // ADMIN: Update complaint status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return complaintService.updateComplaintStatus(id, payload);
    }

    // ADMIN: Add comment to complaint
    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addAdminComment(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return complaintService.addAdminComment(id, payload);
    }
}
