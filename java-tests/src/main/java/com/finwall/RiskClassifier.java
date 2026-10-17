package com.finwall;

/** Java copy of the documented score-to-label contract for the required JUnit demo. */
public final class RiskClassifier {
    private RiskClassifier() {}
    public static String classify(int score) {
        if (score < 0 || score > 100) throw new IllegalArgumentException("Score must be between 0 and 100");
        if (score <= 25) return "Safe";
        if (score <= 50) return "Caution";
        if (score <= 75) return "High";
        return "Critical";
    }
}
