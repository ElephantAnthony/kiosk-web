package com.seniosk.admin;

import java.time.LocalDate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class FunnelController {
    private final FunnelService service;
    public FunnelController(FunnelService service){this.service=service;}
    @GetMapping("/funnel")
    @Operation(summary="Aggregate an owned administrator report",description="UTC start-date cohort, exclusive end date, maximum 366 days. Requires administrator session. Observed cumulative stage coverage differs from authoritative server completion.")
    @ApiResponse(responseCode="200",description="Aggregated cohort")
    @ApiResponse(responseCode="400",description="Invalid filter")
    @ApiResponse(responseCode="401",description="Not authenticated")
    @ApiResponse(responseCode="403",description="Insufficient role")
    public ResponseEntity<FunnelService.Funnel> funnel(
        @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required=false) String scenarioId,@RequestParam(required=false) Integer version){
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.report(from,to,scenarioId,version));
    }
}
