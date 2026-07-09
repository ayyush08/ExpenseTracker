# ── Build stage ────────────────────────────────────────────────
FROM python:3.12-slim AS build
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Runtime stage ─────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

# Copy installed packages from build stage
COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=build /usr/local/bin /usr/local/bin

# Copy application source
COPY src/ src/

ENV FLASK_APP=src/app/__init__.py

EXPOSE 8010

CMD ["flask", "run", "--host=0.0.0.0", "--port=8010"]