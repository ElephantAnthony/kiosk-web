package com.seniosk.admin;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FunnelRepository {
    private final NamedParameterJdbcTemplate jdbc;
    public FunnelRepository(NamedParameterJdbcTemplate jdbc){this.jdbc=jdbc;}
    // One statement snapshot; aggregate events once per session before joining results.
    static final String SQL = """
        WITH cohort AS (
            SELECT id,scenario_id,scenario_version,status,started_at
            FROM training_session
            WHERE started_at >= :start AND started_at < :end
              AND (CAST(:scenario AS varchar) IS NULL OR scenario_id=:scenario)
              AND (CAST(:version AS integer) IS NULL OR scenario_version=:version)
        ), observed AS (
            SELECT e.session_id, max(e.received_at) AS last_seen,
                bool_or(e.event_type='HELP' AND e.body->'payload'->>'open'='true') AS helped,
                bool_or(e.event_type='STATE_TRANSITION' AND e.body->'payload'->>'to'='MISSION') AS mission,
                bool_or(e.event_type='STATE_TRANSITION' AND e.body->'payload'->>'to'='MENU') AS menu,
                bool_or(e.event_type='STATE_TRANSITION' AND e.body->'payload'->>'to'='CART') AS cart,
                bool_or(e.event_type='STATE_TRANSITION' AND e.body->'payload'->>'to'='PAYMENT') AS payment
            FROM training_event e JOIN cohort c ON c.id=e.session_id
            GROUP BY e.session_id
        ), per_session AS (
            SELECT c.*, coalesce(o.helped,false) AS helped, coalesce(o.mission,false) AS mission,
                coalesce(o.mission AND o.menu,false) AS menu,
                coalesce(o.mission AND o.menu AND o.cart,false) AS cart,
                coalesce(o.mission AND o.menu AND o.cart AND o.payment,false) AS payment,
                greatest(c.started_at,coalesce(o.last_seen,c.started_at)) <= :cutoff AS stale,
                r.correct,r.accuracy,r.server_elapsed_ms
            FROM cohort c LEFT JOIN observed o ON o.session_id=c.id
            LEFT JOIN mission_result r ON r.session_id=c.id AND c.status='COMPLETED'
        )
        SELECT scenario_id,scenario_version, count(*) AS total,
            count(*) FILTER (WHERE status='COMPLETED') AS completed,
            count(*) FILTER (WHERE status='CANCELLED') AS cancelled,
            count(*) FILTER (WHERE status='ACTIVE' AND NOT stale) AS active,
            count(*) FILTER (WHERE status='ACTIVE' AND stale) AS abandoned,
            count(*) FILTER (WHERE correct) AS successful,
            count(accuracy) AS graded, avg(accuracy)::double precision AS avg_accuracy, avg(server_elapsed_ms)::double precision AS avg_elapsed,
            count(*) FILTER (WHERE helped) AS helped,
            count(*) FILTER (WHERE mission) AS mission,
            count(*) FILTER (WHERE menu) AS menu,
            count(*) FILTER (WHERE cart) AS cart,
            count(*) FILTER (WHERE payment) AS payment,
            count(*) FILTER (WHERE payment AND status='COMPLETED' AND accuracy IS NOT NULL) AS funnel_completed
        FROM per_session
        GROUP BY GROUPING SETS ((),(scenario_id,scenario_version))
        ORDER BY scenario_id NULLS FIRST,scenario_version
        """;
    record Aggregate(String scenarioId,Integer version,long total,long completed,long cancelled,long active,long abandoned,
                     long successful,long graded,Double averageAccuracy,Double averageElapsedMs,long helped,
                     long mission,long menu,long cart,long payment,long funnelCompleted) {}
    private MapSqlParameterSource parameters(OffsetDateTime start,OffsetDateTime end,String scenario,Integer version,OffsetDateTime cutoff) {
        return new MapSqlParameterSource().addValue("start",start).addValue("end",end)
            .addValue("scenario",scenario,java.sql.Types.VARCHAR).addValue("version",version,java.sql.Types.INTEGER).addValue("cutoff",cutoff);
    }
    List<Aggregate> aggregate(OffsetDateTime start,OffsetDateTime end,String scenario,Integer version,OffsetDateTime cutoff){
        return jdbc.query(SQL,parameters(start,end,scenario,version,cutoff),(rs,n)->new Aggregate(
            rs.getString("scenario_id"),rs.getObject("scenario_version",Integer.class),rs.getLong("total"),
            rs.getLong("completed"),rs.getLong("cancelled"),rs.getLong("active"),rs.getLong("abandoned"),
            rs.getLong("successful"),rs.getLong("graded"),rs.getObject("avg_accuracy",Double.class),
            rs.getObject("avg_elapsed",Double.class),rs.getLong("helped"),rs.getLong("mission"),
            rs.getLong("menu"),rs.getLong("cart"),rs.getLong("payment"),rs.getLong("funnel_completed")));
    }
    List<String> explain(OffsetDateTime start,OffsetDateTime end,OffsetDateTime cutoff){
        return jdbc.query("EXPLAIN (COSTS FALSE) "+SQL,parameters(start,end,null,null,cutoff),(rs,n)->rs.getString(1));
    }
}
