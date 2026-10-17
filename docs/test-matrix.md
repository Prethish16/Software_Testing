# Initial Test Matrix (template)

Fill **Actual Result** and **Status** only after running the test against the built website. Never mark a test passed without evidence.

| TC ID | Requirement/module | Technique | Test input | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| MSG-01 | Message scan | Equivalence partition | “Your monthly statement is available in the official app.” | Low score / Safe | Pending execution | Not Run |
| MSG-02 | Message scan | Equivalence partition | “URGENT: account blocked. Enter your OTP and UPI PIN to reactivate.” | High/Critical; sensitive-information indicator | Pending execution | Not Run |
| MSG-03 | Message scan | Negative | Empty input | Validation error; no scan result | Pending execution | Not Run |
| MSG-04 | Message scan | Boundary | 5,000-character message | Accepted for analysis | Pending execution | Not Run |
| MSG-05 | Message scan | Boundary | 5,001-character message | Validation error | Pending execution | Not Run |
| RISK-01 | Risk engine | Boundary-value analysis | Score 0 | Safe | Pending execution | Not Run |
| RISK-02 | Risk engine | Boundary-value analysis | Score 25 | Safe | Pending execution | Not Run |
| RISK-03 | Risk engine | Boundary-value analysis | Score 26 | Caution | Pending execution | Not Run |
| RISK-04 | Risk engine | Boundary-value analysis | Score 50 | Caution | Pending execution | Not Run |
| RISK-05 | Risk engine | Boundary-value analysis | Score 51 | High | Pending execution | Not Run |
| RISK-06 | Risk engine | Boundary-value analysis | Score 75 | High | Pending execution | Not Run |
| RISK-07 | Risk engine | Boundary-value analysis | Score 76 | Critical | Pending execution | Not Run |
| RISK-08 | Risk engine | Boundary-value analysis | Score 100 | Critical | Pending execution | Not Run |
| PAY-01 | Before I Pay | Negative | Missing recipient | Validation error | Pending execution | Not Run |
| PAY-02 | Before I Pay | Equivalence partition | New recipient + urgency + large amount | Elevated score with explanations | Pending execution | Not Run |
| REPORT-01 | Reports | Functional | Complete a scan, then open Reports | Scan appears in history | Pending execution | Not Run |
| SET-01 | Settings | Functional | Toggle protection | Status visibly changes | Pending execution | Not Run |
