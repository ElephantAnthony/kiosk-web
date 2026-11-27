package com.seniosk.session;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;
import org.springframework.web.util.WebUtils;

public final class LearnerOwner {
    private static final String ATTRIBUTE = "seniosk.learner.owner";
    private LearnerOwner() {}

    public static UUID getOrCreate(HttpSession session) {
        synchronized (WebUtils.getSessionMutex(session)) {
            UUID owner = (UUID) session.getAttribute(ATTRIBUTE);
            if (owner == null) {
                owner = UUID.randomUUID();
                session.setAttribute(ATTRIBUTE, owner);
            }
            return owner;
        }
    }

    public static UUID current(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (UUID) session.getAttribute(ATTRIBUTE);
    }
}
