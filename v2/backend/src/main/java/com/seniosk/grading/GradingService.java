package com.seniosk.grading;

import com.seniosk.scenario.Scenario;
import com.seniosk.scenario.Scenario.OrderLine;
import com.seniosk.scenario.ScenarioRepository;
import com.seniosk.session.SessionRepository;
import com.seniosk.session.TrainingSession;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GradingService {
    private final SessionRepository sessions;
    private final ScenarioRepository scenarios;
    private final GradeRepository grades;
    public GradingService(SessionRepository sessions, ScenarioRepository scenarios, GradeRepository grades) {
        this.sessions = sessions; this.scenarios = scenarios; this.grades = grades;
    }

    @Transactional
    public GradeResult submit(UUID owner, UUID id, SubmissionRequest request) {
        if (owner == null) throw notFound();
        // Lock only the owned session row. Concurrent requests serialize in PostgreSQL.
        var stored = sessions.findOwnedForUpdate(id, owner).orElseThrow(GradingService::notFound);
        var session = stored.session();
        var mission = stored.mission();
        var lines = request.order().stream().map(SubmissionRequest.Line::toOrderLine).toList();
        Scenario scenario = scenarios.readVersion(session.scenarioId(), session.scenarioVersion());
        validateOrder(scenario, lines, request.payment());
        var actual = OrderGrader.normalize(lines);

        if (session.status() == TrainingSession.Status.COMPLETED) {
            var prior = grades.find(id).orElseThrow(() -> new IllegalStateException("Completed session lacks result"));
            if (prior.actual().equals(actual) && prior.payment().equals(request.payment())
                    && prior.result().clientActiveMs() == request.clientActiveMs()) {
                return prior.result();
            }
            throw conflict();
        }
        if (session.status() != TrainingSession.Status.ACTIVE) throw conflict();

        var score = OrderGrader.grade(mission.expected(), mission.expectedPayment(), actual, request.payment());
        Instant completed = Instant.now().truncatedTo(ChronoUnit.MICROS);
        if (completed.isBefore(session.startedAt())) completed = session.startedAt();
        long elapsed = Duration.between(session.startedAt(), completed).toMillis();
        var result = new GradeResult(id, score.matched(), score.missing(), score.extra(),
            score.accuracy(), score.paymentMatched(), score.correct(), elapsed, request.clientActiveMs(), completed);
        sessions.markCompleted(id, owner);
        grades.insert(result, actual, request.payment());
        // State and result are committed together, or rolled back together.
        return grades.find(id).orElseThrow().result();
    }

    @Transactional(readOnly = true)
    public GradeResult result(UUID owner, UUID id) {
        if (owner == null || sessions.findOwned(id, owner).isEmpty()) throw notFound();
        return grades.find(id).orElseThrow(GradingService::notFound).result();
    }

    private static void validateOrder(Scenario scenario, List<OrderLine> lines, String payment) {
        if (!scenario.paymentOptions().contains(payment)) throw invalid();
        for (var line : lines) {
            var menu = scenario.menus().stream().filter(m -> m.id().equals(line.menuId()))
                .findFirst().orElseThrow(GradingService::invalid);
            if (!scenario.packingOptions().contains(line.packing())) throw invalid();
            var remaining = new HashSet<>(line.optionIds());
            if (remaining.size() != line.optionIds().size()) throw invalid();
            for (var group : menu.optionGroups()) {
                long count = group.options().stream().filter(o -> remaining.remove(o.id())).count();
                if (count > 1 || (group.required() && count != 1)) throw invalid();
            }
            if (!remaining.isEmpty()) throw invalid();
        }
    }

    private static ResponseStatusException invalid() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid scenario order");
    }
    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Session or result not found");
    }
    private static ResponseStatusException conflict() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Session already finalized with another submission");
    }
}
