package com.seniosk.grading;

import com.seniosk.session.LearnerOwner;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/sessions/{id}", produces = "application/json")
public class GradingController {
    private final GradingService grading;
    public GradingController(GradingService grading) { this.grading = grading; }

    @PostMapping("/submit")
    @Operation(summary = "Grade a simulated order and finalize the owned training session",
        description = "A replay of the same normalized order, payment and active time returns the stored result. Different submissions after completion return 409.",
        parameters = @Parameter(name = "X-CSRF-TOKEN", in = ParameterIn.HEADER, required = true))
    @ApiResponse(responseCode = "200", description = "Stored grade, including an identical replay")
    @ApiResponse(responseCode = "400", description = "Invalid order", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "Missing or invalid CSRF", content = @Content)
    @ApiResponse(responseCode = "404", description = "Session not found", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "Conflicting or finalized session", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<GradeResult> submit(@PathVariable UUID id, @Valid @RequestBody SubmissionRequest input,
                                               HttpServletRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(grading.submit(LearnerOwner.current(request), id, input));
    }

    @GetMapping("/result")
    @Operation(summary = "Read the stored result for an owned session")
    @ApiResponse(responseCode = "200", description = "Stored grade")
    @ApiResponse(responseCode = "404", description = "Session or result not found", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<GradeResult> result(@PathVariable UUID id, HttpServletRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(grading.result(LearnerOwner.current(request), id));
    }
}
