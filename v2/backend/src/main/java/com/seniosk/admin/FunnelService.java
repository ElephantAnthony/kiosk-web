package com.seniosk.admin;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FunnelService {
    private final FunnelRepository repository;
    public FunnelService(FunnelRepository repository){this.repository=repository;}
    public record Metrics(long total,long completed,long cancelled,long active,long abandoned,long successful,long graded,
                          Double successRate,Double averageAccuracy,Double averageElapsedMs,long helped) {}
    public record Stage(String stage,long reached,Long notReachedNext,Double conversionFromPrevious) {}
    public record ScenarioMetrics(String scenarioId,Integer version,Metrics metrics) {}
    public record Funnel(LocalDate from,LocalDate toExclusive,Instant asOf,int inactivityMinutes,Metrics metrics,
                         List<Stage> funnel,List<ScenarioMetrics> scenarios) {}
    public Funnel report(LocalDate from,LocalDate to,String scenario,Integer version){
        Instant now=Instant.now();
        LocalDate today=now.atOffset(ZoneOffset.UTC).toLocalDate();
        if(from==null)from=today.minusDays(29);
        if(to==null)to=today.plusDays(1);
        if(!from.isBefore(to)||ChronoUnit.DAYS.between(from,to)>366||
            from.isBefore(LocalDate.of(2000,1,1))||to.isAfter(today.plusDays(1))||
            (scenario!=null&&!scenario.matches("^[a-z][a-z0-9-]{0,63}$"))||
            (version!=null&&(scenario==null||version<1||version>1000000)))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid report filter");
        var rows=repository.aggregate(from.atStartOfDay().atOffset(ZoneOffset.UTC),to.atStartOfDay().atOffset(ZoneOffset.UTC),
            scenario,version,now.minus(30,ChronoUnit.MINUTES).atOffset(ZoneOffset.UTC));
        var total=rows.getFirst();
        long[] counts={total.total(),total.mission(),total.menu(),total.cart(),total.payment(),total.funnelCompleted()};
        String[] stages={"START","MISSION","MENU","CART","PAYMENT","COMPLETE"};
        var funnel=new java.util.ArrayList<Stage>();
        for(int i=0;i<counts.length;i++)funnel.add(new Stage(stages[i],counts[i],
            i==counts.length-1?null:counts[i]-counts[i+1],i==0?null:ratio(counts[i],counts[i-1])));
        return new Funnel(from,to,now,30,metrics(total),funnel,
            rows.stream().skip(1).map(r->new ScenarioMetrics(r.scenarioId(),r.version(),metrics(r))).toList());
    }
    private static Double ratio(long n,long d){return d==0?null:(double)n/d;}
    private static Metrics metrics(FunnelRepository.Aggregate r){
        return new Metrics(r.total(),r.completed(),r.cancelled(),r.active(),r.abandoned(),r.successful(),r.graded(),
            ratio(r.successful(),r.graded()),r.averageAccuracy(),r.averageElapsedMs(),r.helped());
    }
}
