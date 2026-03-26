$cluster = "watchtower-cluster"

Write-Host "🚀 Starting Watchtower Deployment..."

# -------------------------------
# 🌐 Install Ingress Controller (idempotent)
# -------------------------------
Write-Host "📦 Installing ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

Write-Host "⏳ Waiting for ingress controller..."
kubectl wait --namespace ingress-nginx `
    --for=condition=ready pod `
    --selector=app.kubernetes.io/component=controller `
    --timeout=180s

kubectl get svc -n ingress-nginx

# -------------------------------
# 📦 Namespace
# -------------------------------
Write-Host "📦 Ensuring namespace exists..."
kubectl apply -f watchtower/templates/namespace.yaml

Start-Sleep -Seconds 2

# -------------------------------
# 🧹 (Optional) Clean old deployment
# -------------------------------
Write-Host "🧹 Cleaning previous Helm release (if exists)..."
helm uninstall watchtower -n watchtower 2>$null

# -------------------------------
# 🚀 Deploy using Helm
# -------------------------------
Write-Host "🚀 Deploying via Helm..."

helm upgrade --install watchtower ./watchtower `
    --namespace watchtower `
    --create-namespace `
    --set global.imagePullPolicy=Always

# -------------------------------
# 🔄 Rollout status
# -------------------------------
Write-Host "🔄 Checking rollout status..."
kubectl rollout status deployment/auth-service -n watchtower
kubectl rollout status deployment/incident-service -n watchtower
kubectl rollout status deployment/notification-service -n watchtower
kubectl rollout status deployment/frontend -n watchtower

# -------------------------------
# 📊 Show pods
# -------------------------------
Write-Host "📊 Current pods:"
kubectl get pods -n watchtower

Write-Host "✅ Deployment complete!"