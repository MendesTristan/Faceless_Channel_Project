# 🏗️ Diagrammes d'Architecture

## Vue d'ensemble du système

```mermaid
graph TB
    Client[Client/Frontend] --> Gateway[API Gateway :3000]
    
    Gateway --> Orchestrator[Orchestrator :3001]
    Gateway --> KF[Keyword Fetcher :3002]
    Gateway --> SG[Script Generator :3003]
    Gateway --> TTS[TTS Renderer :3004]
    Gateway --> VA[Video Assembler :3005]
    Gateway --> TM[Thumbnail Maker :3006]
    Gateway --> MB[Metadata Builder :3007]
    Gateway --> UP[Uploader :3008]
    Gateway --> ABT[AB Tester :3009]
    
    Orchestrator --> Redis[(Redis)]
    Orchestrator --> RabbitMQ[RabbitMQ]
    Orchestrator --> KF
    Orchestrator --> SG
    Orchestrator --> TTS
    Orchestrator --> VA
    Orchestrator --> TM
    Orchestrator --> MB
    Orchestrator --> UP
    Orchestrator --> ABT
    
    TTS --> MinIO[(MinIO S3)]
    VA --> MinIO
    TM --> MinIO
    UP --> MinIO
    
    ABT --> Postgres[(PostgreSQL)]
    
    RabbitMQ -.->|Events| KF
    RabbitMQ -.->|Events| SG
    RabbitMQ -.->|Events| TTS
    RabbitMQ -.->|Events| VA
    RabbitMQ -.->|Events| TM
    RabbitMQ -.->|Events| MB
    RabbitMQ -.->|Events| UP
    RabbitMQ -.->|Events| ABT
    
    style Gateway fill:#4CAF50,color:#fff
    style Orchestrator fill:#2196F3,color:#fff
    style Redis fill:#DC382D,color:#fff
    style RabbitMQ fill:#FF6600,color:#fff
    style Postgres fill:#336791,color:#fff
    style MinIO fill:#C72E49,color:#fff
```

## Flux d'exécution d'un Pipeline

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant O as Orchestrator
    participant R as Redis/BullMQ
    participant RM as RabbitMQ
    participant KF as Keyword Fetcher
    participant SG as Script Generator
    participant TTS as TTS Renderer
    participant VA as Video Assembler
    participant TM as Thumbnail Maker
    participant MB as Metadata Builder
    participant UP as Uploader
    participant ABT as AB Tester
    
    C->>G: POST /api/pipelines/start
    G->>O: Forward request
    O->>R: Add job to queue
    O-->>G: Return pipelineId
    G-->>C: 202 Accepted
    
    R->>O: Process job
    O->>RM: Publish pipeline.started
    
    O->>KF: POST /keywords/fetch
    KF-->>O: Return keywords
    O->>RM: Publish pipeline.keywords.completed
    
    O->>SG: POST /scripts/generate
    SG-->>O: Return script
    O->>RM: Publish pipeline.script.completed
    
    O->>TTS: POST /tts/render
    TTS-->>O: Return audioPath
    O->>RM: Publish pipeline.audio.completed
    
    O->>VA: POST /videos/assemble
    VA-->>O: Return videoPath
    O->>RM: Publish pipeline.video.completed
    
    O->>TM: POST /thumbnails/generate
    TM-->>O: Return thumbnailPath
    O->>RM: Publish pipeline.thumbnail.completed
    
    O->>MB: POST /metadata/generate
    MB-->>O: Return metadata
    O->>RM: Publish pipeline.metadata.completed
    
    O->>UP: POST /upload/youtube
    UP-->>O: Return videoId
    O->>RM: Publish pipeline.upload.completed
    
    O->>ABT: POST /abtests/create
    ABT-->>O: Return testId
    O->>RM: Publish pipeline.completed
    
    C->>G: GET /api/pipelines/status/:id
    G->>O: Forward request
    O->>R: Get job status
    R-->>O: Return status
    O-->>G: Return status
    G-->>C: 200 OK
```

## Architecture des Microservices

```mermaid
graph LR
    subgraph "External"
        Client[Client]
        YouTube[YouTube API]
        OpenAI[OpenAI API]
        ElevenLabs[ElevenLabs API]
        SerpAPI[SerpAPI]
    end
    
    subgraph "API Layer"
        Gateway[API Gateway<br/>Port 3000]
    end
    
    subgraph "Orchestration Layer"
        Orchestrator[Orchestrator<br/>Port 3001]
    end
    
    subgraph "Business Services"
        KF[Keyword Fetcher<br/>3002]
        SG[Script Generator<br/>3003]
        TTS[TTS Renderer<br/>3004]
        VA[Video Assembler<br/>3005]
        TM[Thumbnail Maker<br/>3006]
        MB[Metadata Builder<br/>3007]
        UP[Uploader<br/>3008]
        ABT[AB Tester<br/>3009]
    end
    
    subgraph "Infrastructure"
        Redis[(Redis<br/>6379)]
        RabbitMQ[RabbitMQ<br/>5672/15672]
        Postgres[(PostgreSQL<br/>5432)]
        MinIO[(MinIO<br/>9000/9001)]
    end
    
    Client --> Gateway
    Gateway --> Orchestrator
    Gateway --> KF
    Gateway --> SG
    
    Orchestrator --> Redis
    Orchestrator --> RabbitMQ
    Orchestrator --> KF
    Orchestrator --> SG
    Orchestrator --> TTS
    Orchestrator --> VA
    Orchestrator --> TM
    Orchestrator --> MB
    Orchestrator --> UP
    Orchestrator --> ABT
    
    KF --> SerpAPI
    SG --> OpenAI
    TTS --> ElevenLabs
    TTS --> MinIO
    VA --> MinIO
    TM --> MinIO
    UP --> MinIO
    UP --> YouTube
    ABT --> Postgres
    
    style Gateway fill:#4CAF50,color:#fff
    style Orchestrator fill:#2196F3,color:#fff
    style Redis fill:#DC382D,color:#fff
    style RabbitMQ fill:#FF6600,color:#fff
    style Postgres fill:#336791,color:#fff
    style MinIO fill:#C72E49,color:#fff
```

## Réseau Docker

```mermaid
graph TB
    subgraph "Internet"
        User[User]
    end
    
    subgraph "Docker Network: faceless-network"
        subgraph "Public Ports"
            Gateway[API Gateway<br/>:3000]
            RabbitUI[RabbitMQ UI<br/>:15672]
            MinioUI[MinIO Console<br/>:9001]
        end
        
        subgraph "Internal Services"
            Orchestrator[Orchestrator<br/>:3001]
            KF[Keyword Fetcher<br/>:3002]
            SG[Script Generator<br/>:3003]
            TTS[TTS Renderer<br/>:3004]
            VA[Video Assembler<br/>:3005]
            TM[Thumbnail Maker<br/>:3006]
            MB[Metadata Builder<br/>:3007]
            UP[Uploader<br/>:3008]
            ABT[AB Tester<br/>:3009]
        end
        
        subgraph "Infrastructure"
            Redis[(Redis)]
            RabbitMQ[RabbitMQ]
            Postgres[(PostgreSQL)]
            MinIO[(MinIO)]
        end
    end
    
    User -->|HTTP| Gateway
    User -->|HTTP| RabbitUI
    User -->|HTTP| MinioUI
    
    Gateway --> Orchestrator
    Gateway --> KF
    Gateway --> SG
    
    Orchestrator --> Redis
    Orchestrator --> RabbitMQ
    Orchestrator --> KF
    Orchestrator --> SG
    Orchestrator --> TTS
    Orchestrator --> VA
    Orchestrator --> TM
    Orchestrator --> MB
    Orchestrator --> UP
    Orchestrator --> ABT
    
    TTS --> MinIO
    VA --> MinIO
    TM --> MinIO
    UP --> MinIO
    ABT --> Postgres
    
    style Gateway fill:#4CAF50,color:#fff
    style RabbitUI fill:#FF6600,color:#fff
    style MinioUI fill:#C72E49,color:#fff
```

## Communication Patterns

### Pattern 1: Synchrone (HTTP)

```mermaid
sequenceDiagram
    participant O as Orchestrator
    participant S as Service
    
    O->>S: HTTP POST /endpoint
    Note over S: Process request
    S-->>O: HTTP 200 Response
```

### Pattern 2: Asynchrone (Events)

```mermaid
sequenceDiagram
    participant S1 as Service 1
    participant RM as RabbitMQ
    participant S2 as Service 2
    participant S3 as Service 3
    
    S1->>RM: Publish event
    Note over RM: Store in queue
    RM->>S2: Consume event
    RM->>S3: Consume event
    Note over S2,S3: Process independently
```

## Scalabilité

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[API Gateway]
    end
    
    subgraph "Keyword Fetcher - Scaled"
        KF1[Instance 1]
        KF2[Instance 2]
        KF3[Instance 3]
    end
    
    subgraph "Video Assembler - Scaled"
        VA1[Instance 1]
        VA2[Instance 2]
    end
    
    subgraph "Other Services"
        SG[Script Generator]
        TTS[TTS Renderer]
        UP[Uploader]
    end
    
    LB --> KF1
    LB --> KF2
    LB --> KF3
    LB --> VA1
    LB --> VA2
    LB --> SG
    LB --> TTS
    LB --> UP
    
    style LB fill:#4CAF50,color:#fff
    style KF1 fill:#2196F3,color:#fff
    style KF2 fill:#2196F3,color:#fff
    style KF3 fill:#2196F3,color:#fff
    style VA1 fill:#9C27B0,color:#fff
    style VA2 fill:#9C27B0,color:#fff
```

## États d'un Pipeline

```mermaid
stateDiagram-v2
    [*] --> Queued: Client creates pipeline
    
    Queued --> Running: Worker picks up job
    
    Running --> Keywords: Fetch keywords
    Keywords --> Script: Generate script
    Script --> Audio: Render TTS
    Audio --> Video: Assemble video
    Video --> Thumbnail: Create thumbnail
    Thumbnail --> Metadata: Build metadata
    Metadata --> Upload: Upload to YouTube
    Upload --> ABTest: Create A/B test
    
    ABTest --> Completed: Success
    
    Keywords --> Failed: Error
    Script --> Failed: Error
    Audio --> Failed: Error
    Video --> Failed: Error
    Thumbnail --> Failed: Error
    Metadata --> Failed: Error
    Upload --> Failed: Error
    ABTest --> Failed: Error
    
    Failed --> Retry: Retry available
    Retry --> Running: Retry attempt
    
    Failed --> [*]: Max retries exceeded
    Completed --> [*]: Pipeline done
```

## Déploiement Docker Compose

```mermaid
graph TB
    subgraph "docker-compose.microservices.yml"
        subgraph "Infrastructure Services"
            Redis[redis:7-alpine]
            RabbitMQ[rabbitmq:3-management]
            Postgres[postgres:16-alpine]
            MinIO[minio/minio:latest]
        end
        
        subgraph "Application Services"
            Gateway[api-gateway<br/>Build: ./services/api-gateway]
            Orchestrator[orchestrator<br/>Build: ./services/orchestrator]
            KF[keyword-fetcher<br/>Build: ./services/keyword-fetcher]
            SG[script-generator<br/>Build: ./services/script-generator]
            TTS[tts-renderer<br/>Build: ./services/tts-renderer]
            VA[video-assembler<br/>Build: ./services/video-assembler]
            TM[thumbnail-maker<br/>Build: ./services/thumbnail-maker]
            MB[metadata-builder<br/>Build: ./services/metadata-builder]
            UP[uploader<br/>Build: ./services/uploader]
            ABT[ab-tester<br/>Build: ./services/ab-tester]
        end
        
        subgraph "Volumes"
            V1[redis-data]
            V2[rabbitmq-data]
            V3[postgres-data]
            V4[minio-data]
        end
        
        subgraph "Network"
            Net[faceless-network<br/>bridge]
        end
    end
    
    Redis --> V1
    RabbitMQ --> V2
    Postgres --> V3
    MinIO --> V4
    
    Gateway --> Net
    Orchestrator --> Net
    KF --> Net
    SG --> Net
    TTS --> Net
    VA --> Net
    TM --> Net
    MB --> Net
    UP --> Net
    ABT --> Net
    Redis --> Net
    RabbitMQ --> Net
    Postgres --> Net
    MinIO --> Net
    
    style Gateway fill:#4CAF50,color:#fff
    style Orchestrator fill:#2196F3,color:#fff
    style Net fill:#FFC107,color:#000
```

## Monitoring & Observability (Future)

```mermaid
graph TB
    subgraph "Services"
        S1[Service 1]
        S2[Service 2]
        S3[Service 3]
    end
    
    subgraph "Observability Stack"
        Prom[Prometheus<br/>Metrics]
        Loki[Loki<br/>Logs]
        Jaeger[Jaeger<br/>Traces]
        Grafana[Grafana<br/>Visualization]
    end
    
    S1 -->|Metrics| Prom
    S2 -->|Metrics| Prom
    S3 -->|Metrics| Prom
    
    S1 -->|Logs| Loki
    S2 -->|Logs| Loki
    S3 -->|Logs| Loki
    
    S1 -->|Traces| Jaeger
    S2 -->|Traces| Jaeger
    S3 -->|Traces| Jaeger
    
    Prom --> Grafana
    Loki --> Grafana
    Jaeger --> Grafana
    
    Grafana -->|Dashboards| User[User]
    
    style Prom fill:#E6522C,color:#fff
    style Loki fill:#00A3FF,color:#fff
    style Jaeger fill:#60D0E4,color:#000
    style Grafana fill:#F46800,color:#fff
```

---

## Légende

- 🟢 **Vert** : Points d'entrée publics (API Gateway)
- 🔵 **Bleu** : Services d'orchestration
- 🔴 **Rouge** : Stockage de données
- 🟠 **Orange** : Message broker
- 🟣 **Violet** : Services métier

## Notes

- Toutes les communications entre services passent par le réseau Docker `faceless-network`
- Seuls les ports suivants sont exposés publiquement :
  - 3000 (API Gateway)
  - 15672 (RabbitMQ UI)
  - 9001 (MinIO Console)
- Les services communiquent en interne via leurs noms de conteneur
- Les données persistantes sont stockées dans des volumes Docker

