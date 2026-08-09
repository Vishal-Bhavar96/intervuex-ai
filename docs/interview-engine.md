# IntervueX Adaptive Interview & State Machine

## Dynamic Interview Flow

```
+-------------------+
| START INTERVIEW   |
+---------+---------+
          |
          v
+---------+-----------------+
| Analyze Candidate Context |
| (Resume, Job, Skills)     |
+---------+-----------------+
          |
          v
+---------+-----------------+
| Generate Dynamic Question |
+---------+-----------------+
          |
          v
+---------+-----------------+
| Candidate Answers         |
| (Text or Voice STT)       |
+---------+-----------------+
          |
          v
+---------+-----------------+
| Evaluate Answer           |
| (Technical, Relevance,    |
|  Completeness, Comm)      |
+---------+-----------------+
          |
          +-------------------------------------------------------+
          |                                                       |
          v (Score < 80 & Depth < 2)                              v (Score >= 80)
+---------+-----------------+                           +---------+-----------------+
| Adaptive Follow-Up        |                           | Generate Next Question    |
| Question (Deeper/Simpler) |                           +---------+-----------------+
+---------+-----------------+                                     |
          |                                                       |
          +---------------------------+---------------------------+
                                      |
                                      v (Reached Question Limit)
                            +---------+-----------------+
                            | Final Evaluation Report   |
                            | & Career Readiness Score  |
                            +---------------------------+
```

## Readiness Score Classification

- **90 - 100**: Excellent
- **80 - 89**: Interview Ready
- **70 - 79**: Needs Minor Improvement
- **60 - 69**: Needs Improvement
- **Below 60**: Needs Significant Preparation
