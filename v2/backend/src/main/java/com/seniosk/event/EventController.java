package com.seniosk.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.seniosk.session.LearnerOwner;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value="/api/sessions/{id}/events", produces="application/json")
public class EventController {
    private final EventService events;
    public EventController(EventService events) { this.events=events; }
    public record Batch(@NotNull @Size(min=1,max=20) List<@NotNull JsonNode> events) {}
    public record Ack(List<UUID> acknowledgedIds) {}

    @PostMapping
    @Operation(summary="Persist an atomic batch of training events",
        description="Each event must conform to v2/contracts/event.schema.json. A batch contains one owned session; identical replays are acknowledged. Any conflict rolls back the entire batch.",
        parameters=@Parameter(name="X-CSRF-TOKEN",in=ParameterIn.HEADER,required=true))
    @ApiResponse(responseCode="200",description="All event IDs acknowledged after transaction commit")
    @ApiResponse(responseCode="400",description="Invalid batch or event",content=@Content)
    @ApiResponse(responseCode="403",description="Invalid CSRF",content=@Content)
    @ApiResponse(responseCode="404",description="Session not found",content=@Content)
    @ApiResponse(responseCode="409",description="Event ID or sequence conflict",content=@Content)
    public ResponseEntity<Ack> ingest(@PathVariable UUID id,@Valid @RequestBody Batch batch,HttpServletRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new Ack(events.ingest(LearnerOwner.current(request),id,batch.events())));
    }
}
