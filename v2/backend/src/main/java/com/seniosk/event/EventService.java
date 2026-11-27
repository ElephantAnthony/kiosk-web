package com.seniosk.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.seniosk.scenario.ScenarioRepository;
import com.seniosk.session.SessionRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventService {
    private final SessionRepository sessions;
    private final ScenarioRepository scenarios;
    private final EventContract contract;
    private final EventRepository repository;
    public EventService(SessionRepository sessions, ScenarioRepository scenarios, EventContract contract, EventRepository repository) {
        this.sessions=sessions; this.scenarios=scenarios; this.contract=contract; this.repository=repository;
    }
    @Transactional
    public List<UUID> ingest(UUID owner, UUID sessionId, List<JsonNode> batch) {
        if (owner == null) throw missing();
        var s = sessions.findOwnedForUpdate(sessionId,owner).orElseThrow(EventService::missing).session();
        if (batch == null || batch.isEmpty() || batch.size()>20) throw EventContract.invalid();
        var scenario = scenarios.readVersion(s.scenarioId(),s.scenarioVersion());
        var events = new ArrayList<TrainingEvent>();
        var ids = new HashSet<UUID>();
        for (var node : batch) {
            var e=contract.validate(node,scenario);
            if (!sessionId.equals(e.sessionId()) || !s.scenarioId().equals(e.scenarioId())
                || s.scenarioVersion()!=e.scenarioVersion() || !s.uiVariant().equals(e.uiVariant())
                || !ids.add(e.eventId())) throw EventContract.invalid();
            events.add(e);
        }
        // Stable ordering also reduces cross-session UUID conflict deadlocks.
        events.sort(Comparator.comparing(TrainingEvent::eventId));
        for(var e:events) if(!repository.insertOrIdentical(e))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Event identity conflict");
        return events.stream().map(TrainingEvent::eventId).toList();
    }
    private static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"Session not found"); }
}
