package com.finwall;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RiskClassifierTest {
    @Test void safeBoundaries() {
        assertEquals("Safe", RiskClassifier.classify(0));
        assertEquals("Safe", RiskClassifier.classify(25));
    }
    @Test void cautionBoundaries() {
        assertEquals("Caution", RiskClassifier.classify(26));
        assertEquals("Caution", RiskClassifier.classify(50));
    }
    @Test void highBoundaries() {
        assertEquals("High", RiskClassifier.classify(51));
        assertEquals("High", RiskClassifier.classify(75));
    }
    @Test void criticalBoundaries() {
        assertEquals("Critical", RiskClassifier.classify(76));
        assertEquals("Critical", RiskClassifier.classify(100));
    }
    @Test void invalidScoresAreRejected() {
        assertThrows(IllegalArgumentException.class, () -> RiskClassifier.classify(-1));
        assertThrows(IllegalArgumentException.class, () -> RiskClassifier.classify(101));
    }
}
