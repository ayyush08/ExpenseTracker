package com.userservice.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;


//to let spring store an instance of objectmapper the moment server starts
@Configuration
public class UserConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new tools.jackson.databind.ObjectMapper();
    }
}
