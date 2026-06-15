from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import events, venues

app = FastAPI(title="FFOMO API", description="Frankfurt events aggregator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ffomo.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(venues.router, prefix="/venues", tags=["venues"])


@app.get("/health")
def health():
    return {"status": "ok"}
