package com.seniosk.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {
    private final AuthenticationManager authentication;
    private final HttpSessionSecurityContextRepository repository;
    public AdminAuthController(AuthenticationManager authentication, HttpSessionSecurityContextRepository repository) {
        this.authentication=authentication; this.repository=repository;
    }
    public record LoginRequest(@NotBlank @Size(max=80) String username,
        @NotBlank @Size(max=72) @JsonProperty(access=JsonProperty.Access.WRITE_ONLY) String password) {
        @Override public String toString() { return "LoginRequest[redacted]"; }
    }
    public record AdminView(boolean authenticated) {}
    @PostMapping("/login")
    @Operation(summary="Authenticate an administrator",parameters=@Parameter(name="X-CSRF-TOKEN",in=ParameterIn.HEADER,required=true))
    @ApiResponse(responseCode="200",description="Authenticated")
    @ApiResponse(responseCode="400",description="Invalid input")
    @ApiResponse(responseCode="401",description="Invalid credentials or administrator disabled")
    @ApiResponse(responseCode="403",description="Invalid CSRF")
    public ResponseEntity<AdminView> login(@Valid @RequestBody LoginRequest input,HttpServletRequest request,HttpServletResponse response) {
        try {
            var principal=authentication.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(input.username(),input.password()));
            request.getSession(true);
            request.changeSessionId();
            var context=SecurityContextHolder.createEmptyContext();
            context.setAuthentication(principal);
            SecurityContextHolder.setContext(context);
            repository.saveContext(context,request,response);
            new HttpSessionCsrfTokenRepository().saveToken(null,request,response);
            return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new AdminView(true));
        } catch(AuthenticationException ex) {
            return ResponseEntity.status(401).cacheControl(CacheControl.noStore()).build();
        }
    }
    @GetMapping("/me")
    @Operation(summary="Check administrator session")
    @ApiResponse(responseCode="200",description="Administrator authenticated")
    @ApiResponse(responseCode="401",description="Not authenticated")
    @ApiResponse(responseCode="403",description="Insufficient role")
    public ResponseEntity<AdminView> me(){
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new AdminView(true));
    }
    @PostMapping("/logout")
    @Operation(summary="Clear administrator authentication only",parameters=@Parameter(name="X-CSRF-TOKEN",in=ParameterIn.HEADER,required=true))
    @ApiResponse(responseCode="204",description="Logged out")
    @ApiResponse(responseCode="401",description="Not authenticated")
    @ApiResponse(responseCode="403",description="Invalid CSRF or insufficient role")
    public ResponseEntity<Void> logout(HttpServletRequest request,HttpServletResponse response){
        SecurityContextHolder.clearContext();
        repository.saveContext(SecurityContextHolder.createEmptyContext(),request,response);
        new HttpSessionCsrfTokenRepository().saveToken(null,request,response);
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }
}
