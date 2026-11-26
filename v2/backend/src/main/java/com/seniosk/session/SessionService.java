package com.seniosk.session;

import com.seniosk.mission.Mission;
import com.seniosk.scenario.Scenario;
import com.seniosk.scenario.ScenarioCatalog;
import com.seniosk.scenario.ScenarioRepository;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessionService {
    private final ScenarioCatalog catalog;
    private final ScenarioRepository scenarios;
    private final SessionRepository sessions;
    public SessionService(ScenarioCatalog catalog, ScenarioRepository scenarios, SessionRepository sessions) {
        this.catalog = catalog; this.scenarios = scenarios; this.sessions = sessions;
    }

    @Transactional
    public SessionRepository.StoredSession start(UUID owner, String scenarioId, int version, String uiVariant) {
        Scenario scenario = catalog.get(scenarioId, version);
        scenarios.ensureVersion(scenario);
        var template = scenario.missions().get(ThreadLocalRandom.current().nextInt(scenario.missions().size()));
        var session = new TrainingSession(UUID.randomUUID(), owner, scenarioId, version, uiVariant,
            TrainingSession.Status.ACTIVE, Instant.now());
        var mission = new Mission(UUID.randomUUID(), session.id(), template.id(), template.instruction(),
            template.expected(), template.payment());
        sessions.insert(session, mission);
        return read(owner, session.id());
    }

    @Transactional(readOnly = true)
    public SessionRepository.StoredSession read(UUID owner, UUID id) {
        if (owner == null) throw notFound();
        return sessions.findOwned(id, owner).orElseThrow(SessionService::notFound);
    }
    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found");
    }
}
