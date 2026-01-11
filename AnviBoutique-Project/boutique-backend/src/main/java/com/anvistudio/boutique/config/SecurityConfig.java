package com.anvistudio.boutique.config;

import com.anvistudio.boutique.security.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter, UserDetailsService userDetailsService) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

   @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(passwordEncoder());
        authProvider.setUserDetailsService(userDetailsService);
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/products/**", "/api/verify/**", "/api/newsletter/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/customer/**", "/api/cart/**", "/api/wishlist/**", "/api/payment/**").hasRole("CUSTOMER")
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}






// package com.anvistudio.boutique.config;

// import com.anvistudio.boutique.security.JwtRequestFilter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.CorsConfigurationSource;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// import java.util.Arrays;
// import java.util.List;

// /**
//  * Modern Security Configuration for a decoupled React + Spring Boot architecture.
//  * Implements Stateless JWT authentication and CORS support.
//  */
// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     private final JwtRequestFilter jwtRequestFilter;

//     public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
//         this.jwtRequestFilter = jwtRequestFilter;
//     }

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     /**
//      * Required for AuthRestController to perform manual authentication during login.
//      */
//     @Bean
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
//         return authConfig.getAuthenticationManager();
//     }

//     @Bean
//     public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
//         DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
//         authProvider.setUserDetailsService(userDetailsService);
//         authProvider.setPasswordEncoder(passwordEncoder());
//         return authProvider;
//     }


//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//             // 1. Enable CORS and Disable CSRF (standard for stateless JWT APIs)
//             .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//             .csrf(csrf -> csrf.disable())
            
//             // 2. Set Session Management to STATELESS
//             .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
//             // 3. Define Endpoint Access Rules
//             .authorizeHttpRequests(auth -> auth
//                 // Publicly accessible endpoints
//                 .requestMatchers("/api/auth/**", "/api/products/**", "/api/verify/**", "/api/newsletter/**").permitAll()
//                 // Role-based protected endpoints
//                 .requestMatchers("/api/admin/**").hasRole("ADMIN")
//                 .requestMatchers("/api/customer/**", "/api/cart/**", "/api/wishlist/**", "/api/payment/**").hasRole("CUSTOMER")
//                 // All other requests require authentication
//                 .anyRequest().authenticated()
//             );

//         // 4. Add the JWT filter before the standard UsernamePasswordAuthenticationFilter
//         http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }

//     /**
//      * CORS configuration to allow the React frontend (port 3000) to communicate with this API.
//      */
//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();
//         configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Match your React dev URL
//         configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
//         configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
//         configuration.setAllowCredentials(true);
//         // configuration.setExposedHeaders(List.of("Authorization"));
        
//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);
//         // source.registerCorsConfiguration("/**", source);
//         return source;
//     }
// }