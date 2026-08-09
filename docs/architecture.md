# IntervueX System Architecture

IntervueX is designed following a modular, layered clean architecture.

## Component Topology

```
+-------------------------------------------------------------------+
|                        React + TypeScript UI                      |
|                  (Tailwind/Enterprise CSS System)                 |
+---------------------------------+---------------------------------+
                                  | REST APIs / JWT Auth
                                  v
+---------------------------------+---------------------------------+
|                        FastAPI App Layer                          |
|         +-----------------------+-----------------------+         |
|         | Security Middleware   | Exception Handlers    |         |
|         +-----------------------+-----------------------+         |
+---------------------------------+---------------------------------+
                                  |
    +-----------------------------+-----------------------------+
    |                             |                             |
    v                             v                             v
+---+-------------------+   +-----+---------------+   +---------+-----------+
| AI Service Layer      |   | Resume Engine       |   | Code Sandbox        |
| (Abstract Provider)   |   | (PDF / DOCX)        |   | Engine              |
+-----------------------+   +---------------------+   +---------------------+
```

## Layer Responsibilities

1. **API Layer (`app/api/v1`)**: Handles HTTP requests, input validation via Pydantic schemas, and authentication token parsing.
2. **Service Layer (`app/services`)**: Contains pure domain business logic, score calculators, matching engines, and roadmap generators.
3. **AI Layer (`app/ai`)**: Provider abstraction decoupled from specific vendor implementations (Gemini, OpenAI, or smart local Mock).
4. **Data Layer (`app/models` & `app/core/database`)**: Declarative SQLAlchemy ORM models managing relational persistence in PostgreSQL or SQLite.
5. **Security Engine (`app/core/security.py` & `app/core/sandbox.py`)**: Manages bcrypt password hashing, JWT token validation, and isolated Python process code execution.
