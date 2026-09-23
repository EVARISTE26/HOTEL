#!/usr/bin/env bash
set -euo pipefail

# Idempotent Cloud Agent install for HOTEL management app.
# Installs root, backend, and frontend deps, then seeds the SQLite DB.

npm install
npm install --prefix backend
npm install --prefix frontend
npm run seed --prefix backend
