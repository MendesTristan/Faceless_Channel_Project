# Makefile pour faciliter les commandes Docker Compose

.PHONY: help start stop restart logs build clean status health

# Afficher l'aide
help:
	@echo "Commandes disponibles:"
	@echo "  make start       - Démarrer tous les services"
	@echo "  make stop        - Arrêter tous les services"
	@echo "  make restart     - Redémarrer tous les services"
	@echo "  make logs        - Voir les logs de tous les services"
	@echo "  make build       - Rebuild tous les services"
	@echo "  make clean       - Arrêter et supprimer tous les volumes"
	@echo "  make status      - Voir l'état des services"
	@echo "  make health      - Vérifier la santé de tous les services"

# Démarrer tous les services
start:
	docker-compose -f docker-compose.microservices.yml up -d

# Arrêter tous les services
stop:
	docker-compose -f docker-compose.microservices.yml down

# Redémarrer tous les services
restart: stop start

# Voir les logs
logs:
	docker-compose -f docker-compose.microservices.yml logs -f

# Rebuild tous les services
build:
	docker-compose -f docker-compose.microservices.yml build
	docker-compose -f docker-compose.microservices.yml up -d

# Nettoyer (attention: supprime les volumes)
clean:
	docker-compose -f docker-compose.microservices.yml down -v
	docker system prune -f

# Voir l'état des services
status:
	docker-compose -f docker-compose.microservices.yml ps

# Health check de tous les services
health:
	@echo "Checking API Gateway..."
	@curl -s http://localhost:3000/health | jq || echo "❌ API Gateway unreachable"
	@echo "\nChecking Orchestrator..."
	@curl -s http://localhost:3001/health | jq || echo "❌ Orchestrator unreachable"
	@echo "\nChecking Keyword Fetcher..."
	@curl -s http://localhost:3002/health | jq || echo "❌ Keyword Fetcher unreachable"
	@echo "\nChecking Script Generator..."
	@curl -s http://localhost:3003/health | jq || echo "❌ Script Generator unreachable"
	@echo "\nChecking TTS Renderer..."
	@curl -s http://localhost:3004/health | jq || echo "❌ TTS Renderer unreachable"
	@echo "\nChecking Video Assembler..."
	@curl -s http://localhost:3005/health | jq || echo "❌ Video Assembler unreachable"
	@echo "\nChecking Thumbnail Maker..."
	@curl -s http://localhost:3006/health | jq || echo "❌ Thumbnail Maker unreachable"
	@echo "\nChecking Metadata Builder..."
	@curl -s http://localhost:3007/health | jq || echo "❌ Metadata Builder unreachable"
	@echo "\nChecking Uploader..."
	@curl -s http://localhost:3008/health | jq || echo "❌ Uploader unreachable"
	@echo "\nChecking AB Tester..."
	@curl -s http://localhost:3009/health | jq || echo "❌ AB Tester unreachable"

