package com.complainhub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/user/signup",
                    "/api/user/signin",
                    "/api/auth/verifyToken",
                    "/api/user/admin/login"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/complaint/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/complaint/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/complaint/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/complaint/**").permitAll()
                .anyRequest().permitAll()
            )
            .cors(cors -> {});
        return http.build();
    }
}
