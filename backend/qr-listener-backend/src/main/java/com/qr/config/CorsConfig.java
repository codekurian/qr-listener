package com.qr.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                    // Local development
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:8080",
                    
                    // A2 Hosting HTTP (port 8080)
                    "http://graceshoppee.tech:8080",
                    "http://www.graceshoppee.tech:8080",
                    "http://graceshoppee.tech",
                    "http://www.graceshoppee.tech",
                    
                    // A2 Hosting HTTPS (port 8443)
                    "https://graceshoppee.tech:8443",
                    "https://www.graceshoppee.tech:8443",
                    "https://graceshoppee.tech",
                    "https://www.graceshoppee.tech",
                    
                    // Direct frontend access (if needed)
                    "http://graceshoppee.tech:3000",
                    "http://www.graceshoppee.tech:3000",
                    "http://45.4.172.217:3000",
                    "http://45.4.172.217:8080"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
