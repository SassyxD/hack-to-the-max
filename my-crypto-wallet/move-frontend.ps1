# Create directories
New-Item -ItemType Directory -Force -Path frontend/src/components
New-Item -ItemType Directory -Force -Path frontend/src/screens
New-Item -ItemType Directory -Force -Path frontend/src/hooks
New-Item -ItemType Directory -Force -Path frontend/src/services
New-Item -ItemType Directory -Force -Path frontend/src/context
New-Item -ItemType Directory -Force -Path frontend/src/navigation
New-Item -ItemType Directory -Force -Path frontend/src/utils
New-Item -ItemType Directory -Force -Path frontend/src/types
New-Item -ItemType Directory -Force -Path frontend/assets

# Move files
Move-Item -Path src/* -Destination frontend/src/ -Force
Move-Item -Path assets/* -Destination frontend/assets/ -Force
Move-Item -Path App.tsx -Destination frontend/ -Force
Move-Item -Path index.ts -Destination frontend/ -Force
Move-Item -Path app.json -Destination frontend/ -Force
Move-Item -Path tsconfig.json -Destination frontend/ -Force

# Clean up empty directories
Remove-Item -Path src -Force -Recurse
Remove-Item -Path assets -Force -Recurse 