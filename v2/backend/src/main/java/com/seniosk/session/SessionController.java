package com.seniosk.session;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.ProblemDetail;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api", produces = "application/json")
public class SessionController {
    private final SessionService service;
    public SessionController(SessionService service) { this.service = service; }

    public record StartRequest(@NotBlank @Pattern(regexp = "^[a-z][a-z0-9-]{0,63}$") String scenarioId,
                               @NotNull @Min(1) @Max(1000000) Integer version,
                               @NotBlank @Pattern(regexp = "standard") String uiVariant) {}
    public record MissionView(UUID id, String templateId, String instruction) {}
    public record SessionView(UUID id, String scenarioId, int scenarioVersion, String uiVariant,
                              TrainingSession.Status status, Instant startedAt, MissionView mission) {}
    public record CsrfView(String headerName, String token) {}

    @GetMapping("/csrf")
    @Operation(summary = "Obtain a session-bound CSRF token for write requests")
    public ResponseEntity<CsrfView> csrf(@Parameter(hidden = true) CsrfToken token) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(new CsrfView(token.getHeaderName(), token.getToken()));
    }

    @PostMapping("/sessions")
    @Operation(summary = "Start an isolated training session and assign a mission",
        description = "First obtain a CSRF token from GET /api/csrf and retain the same session cookie.",
        parameters = @Parameter(name = "X-CSRF-TOKEN", in = ParameterIn.HEADER, required = true))
    @ApiResponse(responseCode = "201", description = "Session created")
    @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "Missing or invalid CSRF", content = @Content)
    @ApiResponse(responseCode = "404", description = "Scenario not found", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<SessionView> start(@Valid @RequestBody StartRequest input, HttpSession httpSession) {
        UUID owner = LearnerOwner.getOrCreate(httpSession);
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
            .body(view(service.start(owner, input.scenarioId(), input.version(), input.uiVariant())));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Read a training session owned by this browser")
    @ApiResponse(responseCode = "200", description = "Owned training session")
    @ApiResponse(responseCode = "404", description = "Absent or owned by another browser", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<SessionView> detail(@PathVariable UUID id, HttpServletRequest request) {
        UUID owner = LearnerOwner.current(request);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(view(service.read(owner, id)));
    }

    private static SessionView view(SessionRepository.StoredSession stored) {
        var s = stored.session();
        var m = stored.mission();
        return new SessionView(s.id(), s.scenarioId(), s.scenarioVersion(), s.uiVariant(), s.status(),
            s.startedAt(), new MissionView(m.id(), m.templateId(), m.instruction()));
    }
}
