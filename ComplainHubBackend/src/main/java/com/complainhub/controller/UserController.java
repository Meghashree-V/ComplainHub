package com.complainhub.controller;

import com.complainhub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/user", "/api/users"})
@CrossOrigin(origins = "*")
public class UserController {

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editUser(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return userService.editUser(id, payload);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/all-auth")
    public ResponseEntity<?> getAllAuthUsers() {
        return userService.getAllAuthUsers();
    }
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        String name = payload.get("name");
        String role = payload.getOrDefault("role", "student");
        String department = payload.getOrDefault("department", "");
        String studentId = payload.getOrDefault("studentId", "");
        String status = payload.getOrDefault("status", "active");
        String blockReason = payload.getOrDefault("blockReason", "");
        return userService.signup(email, password, name, role, department, studentId, status, blockReason);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        return userService.signin(email, password);
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        return userService.adminLogin(email, password);
    }

    @RequestMapping(value = {"/block/{id}"}, method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<?> blockUser(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String blockReason = payload.get("blockReason");
        return userService.blockUser(id, blockReason);
    }

    @RequestMapping(value = {"/unblock/{id}"}, method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<?> unblockUser(@PathVariable String id) {
        return userService.unblockUser(id);
    }
}
